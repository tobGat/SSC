import express from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { SocketEvents, SongSubmission, SongEdit, VoteSubmission, ExportRequest, JoinRoomData } from './types/socket-events';
import { RoomManager } from './services/RoomManager';
import { Room } from './models/Room';
import { ExportService } from './services/ExportService';
import * as SessionPersistence from './services/SessionPersistence';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json());

// Room manager
const roomManager = new RoomManager();

// Track which room each socket is in
const socketRooms = new Map<string, string>(); // socketId -> roomCode

// Helper: get room for a socket
const getRoomForSocket = (socketId: string): { room: Room; roomCode: string } | null => {
  const roomCode = socketRooms.get(socketId);
  if (!roomCode) return null;
  const room = roomManager.getRoom(roomCode);
  if (!room) return null;
  return { room, roomCode };
};

// Helper functions (scoped to a room)
const emitSongsUpdate = (roomCode: string, room: Room) => {
  const songs = Array.from(room.session.songs.values()).map(song => song.toJSON());
  io.to(roomCode).emit(SocketEvents.SONGS_UPDATED, songs);
};

const emitPhaseChange = (roomCode: string, room: Room) => {
  io.to(roomCode).emit(SocketEvents.PHASE_CHANGED, room.session.phase);
};

const emitVoteStats = (roomCode: string, room: Room) => {
  const actualStudentCount = room.session.connectedStudents.size - room.adminSockets.size;
  io.to(roomCode).emit(SocketEvents.VOTE_STATS, {
    voted: room.session.votedStudents.size,
    total: actualStudentCount,
  });
};

const emitCurrentSong = (roomCode: string, room: Room) => {
  const currentSong = room.session.getCurrentSong();
  if (!currentSong) return;

  const actualStudentCount = room.session.connectedStudents.size - room.adminSockets.size;
  io.to(roomCode).emit(SocketEvents.CURRENT_SONG, {
    song: currentSong.toJSON(),
    songNumber: room.session.currentSongIndex + 1,
    totalSongs: room.session.presentationOrder.length,
    votingStats: {
      voted: room.session.votedStudents.size,
      total: actualStudentCount,
    },
  });
};

// Socket.io connection handling
io.on('connection', (socket: Socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Create Room (Teacher)
  socket.on(SocketEvents.CREATE_ROOM, () => {
    try {
      const room = roomManager.createRoom();
      const roomCode = room.roomCode;

      socket.join(roomCode);
      socketRooms.set(socket.id, roomCode);
      room.session.addStudent(socket.id);

      socket.emit(SocketEvents.ROOM_CREATED, { roomCode });
      console.log(`Room created by ${socket.id}: ${roomCode}`);
    } catch (error) {
      socket.emit(SocketEvents.ERROR, 'Failed to create room');
      console.error('Create room error:', error);
    }
  });

  // Join Room (Student or Teacher login)
  socket.on(SocketEvents.JOIN_ROOM, (data: JoinRoomData | string) => {
    try {
      const roomCode = typeof data === 'string' ? data : data.roomCode;
      const clientId = typeof data === 'object' ? data.clientId : undefined;

      if (!roomCode || typeof roomCode !== 'string') {
        socket.emit(SocketEvents.ROOM_ERROR, 'Ungültiger Raumcode');
        return;
      }

      const code = roomCode.toUpperCase().trim();
      const room = roomManager.getRoom(code);

      if (!room) {
        socket.emit(SocketEvents.ROOM_ERROR, 'Raum nicht gefunden');
        return;
      }

      socket.join(code);
      socketRooms.set(socket.id, code);
      room.session.addStudent(socket.id);

      // Track clientId → socketId for resubmission notification
      if (clientId) {
        room.clientSockets.set(clientId, socket.id);
      }

      socket.emit(SocketEvents.ROOM_JOINED, { roomCode: code });

      // Send current state
      emitSongsUpdate(code, room);
      emitPhaseChange(code, room);

      if (room.session.phase === 'presentation') {
        emitCurrentSong(code, room);
      } else if (room.session.phase === 'results') {
        const rankings = room.session.getRankings();
        socket.emit(SocketEvents.FINAL_RESULTS, rankings);
      }

      console.log(`${socket.id} joined room ${code}`);
    } catch (error) {
      socket.emit(SocketEvents.ROOM_ERROR, 'Fehler beim Beitreten');
      console.error('Join room error:', error);
    }
  });

  // Song Submission (Students)
  socket.on(SocketEvents.SUBMIT_SONG, (data: SongSubmission) => {
    try {
      const ctx = getRoomForSocket(socket.id);
      if (!ctx) { socket.emit(SocketEvents.ERROR, 'Kein Raum beigetreten'); return; }
      const { room, roomCode } = ctx;

      if (room.session.phase !== 'submission') {
        socket.emit(SocketEvents.ERROR, 'Song submissions are closed');
        return;
      }

      const { title, artist, link } = data;
      if (!title || !artist) {
        socket.emit(SocketEvents.ERROR, 'Title and artist are required');
        return;
      }

      if (link && /spotify\.com|open\.spotify/i.test(link)) {
        socket.emit(SocketEvents.ERROR, 'Spotify-Links sind nicht erlaubt');
        return;
      }

      const { clientId } = data;
      room.session.addSong(title.trim(), artist.trim(), link?.trim(), clientId);
      emitSongsUpdate(roomCode, room);
      SessionPersistence.save(room);
      console.log(`[${roomCode}] Song submitted: ${title} by ${artist}`);
    } catch (error) {
      socket.emit(SocketEvents.ERROR, 'Failed to submit song');
      console.error('Submit song error:', error);
    }
  });

  // Edit Song (Teacher only)
  socket.on(SocketEvents.EDIT_SONG, (data: SongEdit) => {
    try {
      const ctx = getRoomForSocket(socket.id);
      if (!ctx) { socket.emit(SocketEvents.ERROR, 'Kein Raum beigetreten'); return; }
      const { room, roomCode } = ctx;

      const { id, title, artist, link } = data;
      if (!id || !title || !artist) {
        socket.emit(SocketEvents.ERROR, 'ID, title and artist are required');
        return;
      }

      const song = room.session.editSong(id, title.trim(), artist.trim(), link?.trim());
      if (!song) {
        socket.emit(SocketEvents.ERROR, 'Song not found');
        return;
      }

      emitSongsUpdate(roomCode, room);
      SessionPersistence.save(room);
      console.log(`[${roomCode}] Song edited: ${id}`);
    } catch (error) {
      socket.emit(SocketEvents.ERROR, 'Failed to edit song');
      console.error('Edit song error:', error);
    }
  });

  // Delete Song (Teacher only)
  socket.on(SocketEvents.DELETE_SONG, (songId: string) => {
    try {
      const ctx = getRoomForSocket(socket.id);
      if (!ctx) { socket.emit(SocketEvents.ERROR, 'Kein Raum beigetreten'); return; }
      const { room, roomCode } = ctx;

      const result = room.session.deleteSong(songId);
      if (!result.deleted) {
        socket.emit(SocketEvents.ERROR, 'Song not found');
        return;
      }

      // Notify the original submitter so they can resubmit
      if (result.submitterClientId) {
        const submitterSocketId = room.clientSockets.get(result.submitterClientId);
        if (submitterSocketId) {
          io.to(submitterSocketId).emit(SocketEvents.SONG_DELETED);
        }
      }

      emitSongsUpdate(roomCode, room);
      SessionPersistence.save(room);
      console.log(`[${roomCode}] Song deleted: ${songId}`);
    } catch (error) {
      socket.emit(SocketEvents.ERROR, 'Failed to delete song');
      console.error('Delete song error:', error);
    }
  });

  // Start Presentation (Teacher only)
  socket.on(SocketEvents.START_PRESENTATION, () => {
    try {
      const ctx = getRoomForSocket(socket.id);
      if (!ctx) { socket.emit(SocketEvents.ERROR, 'Kein Raum beigetreten'); return; }
      const { room, roomCode } = ctx;

      room.session.startPresentation();
      emitPhaseChange(roomCode, room);
      emitCurrentSong(roomCode, room);
      SessionPersistence.save(room);
      console.log(`[${roomCode}] Presentation started`);
    } catch (error) {
      socket.emit(SocketEvents.ERROR, error instanceof Error ? error.message : 'Failed to start presentation');
      console.error('Start presentation error:', error);
    }
  });

  // Next Song (Teacher only)
  socket.on(SocketEvents.NEXT_SONG, () => {
    try {
      const ctx = getRoomForSocket(socket.id);
      if (!ctx) { socket.emit(SocketEvents.ERROR, 'Kein Raum beigetreten'); return; }
      const { room, roomCode } = ctx;

      const hasNext = room.session.nextSong();

      if (hasNext) {
        emitCurrentSong(roomCode, room);
      } else {
        emitPhaseChange(roomCode, room);
        const rankings = room.session.getRankings();
        io.to(roomCode).emit(SocketEvents.FINAL_RESULTS, rankings);
      }

      SessionPersistence.save(room);
      console.log(`[${roomCode}] Next song. Has next: ${hasNext}`);
    } catch (error) {
      socket.emit(SocketEvents.ERROR, 'Failed to move to next song');
      console.error('Next song error:', error);
    }
  });

  // Submit Vote (Students)
  socket.on(SocketEvents.SUBMIT_VOTE, (data: VoteSubmission) => {
    try {
      const ctx = getRoomForSocket(socket.id);
      if (!ctx) { socket.emit(SocketEvents.ERROR, 'Kein Raum beigetreten'); return; }
      const { room, roomCode } = ctx;

      if (room.session.phase !== 'presentation') {
        socket.emit(SocketEvents.ERROR, 'Voting is not active');
        return;
      }

      const { songId, points } = data;
      if (!songId || points < 1 || points > 10) {
        socket.emit(SocketEvents.ERROR, 'Invalid vote data');
        return;
      }

      const success = room.session.addVote(songId, points, socket.id);
      if (!success) {
        socket.emit(SocketEvents.ERROR, 'Vote already submitted or invalid song');
        return;
      }

      emitVoteStats(roomCode, room);
      SessionPersistence.save(room);
      console.log(`[${roomCode}] Vote: ${points} points for ${songId}`);

      // Check if all students have voted (excluding admins)
      const actualStudentCount = room.session.connectedStudents.size - room.adminSockets.size;
      const allVoted = room.session.votedStudents.size >= actualStudentCount && actualStudentCount > 0;

      if (allVoted) {
        const currentSong = room.session.getCurrentSong();
        if (currentSong) {
          setTimeout(() => {
            io.to(roomCode).emit(SocketEvents.VOTING_COMPLETE, {
              songId: currentSong.id,
              averageScore: currentSong.averageScore,
            });
            console.log(`[${roomCode}] Voting complete for: ${currentSong.title}`);
          }, 1000);
        }
      }
    } catch (error) {
      socket.emit(SocketEvents.ERROR, 'Failed to submit vote');
      console.error('Submit vote error:', error);
    }
  });

  // Check if password is already set
  socket.on(SocketEvents.CHECK_PASSWORD_STATUS, () => {
    const ctx = getRoomForSocket(socket.id);
    if (!ctx) { socket.emit(SocketEvents.ERROR, 'Kein Raum beigetreten'); return; }
    socket.emit(SocketEvents.PASSWORD_STATUS, { isSet: ctx.room.isPasswordSet() });
  });

  // Set Session Password (first teacher)
  socket.on(SocketEvents.SET_PASSWORD, (password: string) => {
    try {
      const ctx = getRoomForSocket(socket.id);
      if (!ctx) { socket.emit(SocketEvents.ERROR, 'Kein Raum beigetreten'); return; }
      const { room, roomCode } = ctx;

      if (!password || password.trim().length < 3) {
        socket.emit(SocketEvents.AUTH_RESULT, {
          success: false,
          message: 'Passwort muss mindestens 3 Zeichen lang sein',
        });
        return;
      }

      const wasSet = room.setPassword(password.trim());
      if (wasSet) {
        const token = room.generateToken();
        room.adminSockets.add(socket.id);
        socket.emit(SocketEvents.AUTH_RESULT, {
          success: true,
          token,
          message: 'Passwort gesetzt und eingeloggt',
        });
        if (room.session.phase === 'presentation') {
          emitVoteStats(roomCode, room);
        }
        SessionPersistence.save(room);
        console.log(`[${roomCode}] Password set by ${socket.id}`);
      } else {
        socket.emit(SocketEvents.AUTH_RESULT, {
          success: false,
          message: 'Passwort wurde bereits gesetzt. Bitte einloggen.',
        });
      }
    } catch (error) {
      socket.emit(SocketEvents.ERROR, 'Failed to set password');
      console.error('Set password error:', error);
    }
  });

  // Admin Login
  socket.on(SocketEvents.ADMIN_LOGIN, (password: string) => {
    try {
      const ctx = getRoomForSocket(socket.id);
      if (!ctx) { socket.emit(SocketEvents.ERROR, 'Kein Raum beigetreten'); return; }
      const { room, roomCode } = ctx;

      if (!room.isPasswordSet()) {
        socket.emit(SocketEvents.AUTH_RESULT, {
          success: false,
          message: 'Noch kein Passwort gesetzt',
        });
        return;
      }

      if (room.verifyPassword(password)) {
        const token = room.generateToken();
        room.adminSockets.add(socket.id);
        socket.emit(SocketEvents.AUTH_RESULT, {
          success: true,
          token,
          message: 'Login erfolgreich',
        });
        if (room.session.phase === 'presentation') {
          emitVoteStats(roomCode, room);
        }
        console.log(`[${roomCode}] Admin logged in: ${socket.id}`);
      } else {
        socket.emit(SocketEvents.AUTH_RESULT, {
          success: false,
          message: 'Falsches Passwort',
        });
        console.log(`[${roomCode}] Failed login attempt`);
      }
    } catch (error) {
      socket.emit(SocketEvents.ERROR, 'Login failed');
      console.error('Login error:', error);
    }
  });

  // Export Session (Teacher only)
  socket.on('export-session', () => {
    try {
      const ctx = getRoomForSocket(socket.id);
      if (!ctx) { socket.emit(SocketEvents.ERROR, 'Kein Raum beigetreten'); return; }
      const { room, roomCode } = ctx;

      const data = SessionPersistence.buildPersistedData(room);
      socket.emit('session-exported', data);
      console.log(`[${roomCode}] Session exported`);
    } catch (error) {
      socket.emit(SocketEvents.ERROR, 'Export fehlgeschlagen');
      console.error('Export session error:', error);
    }
  });

  // Export Results
  socket.on(SocketEvents.EXPORT_RESULTS, async (data: ExportRequest) => {
    try {
      const ctx = getRoomForSocket(socket.id);
      if (!ctx) { socket.emit(SocketEvents.ERROR, 'Kein Raum beigetreten'); return; }
      const { room, roomCode } = ctx;

      const rankings = room.session.getRankings();

      if (data.format === 'csv') {
        const csv = await ExportService.exportToCSV(rankings);
        socket.emit('export-data', { format: 'csv', data: csv });
      } else if (data.format === 'pdf') {
        const pdf = await ExportService.exportToPDF(rankings);
        socket.emit('export-data', { format: 'pdf', data: pdf.toString('base64') });
      }

      console.log(`[${roomCode}] Results exported as ${data.format}`);
    } catch (error) {
      socket.emit(SocketEvents.ERROR, 'Failed to export results');
      console.error('Export error:', error);
    }
  });

  // Reset Session (Teacher only)
  socket.on(SocketEvents.RESET_SESSION, () => {
    try {
      const ctx = getRoomForSocket(socket.id);
      if (!ctx) { socket.emit(SocketEvents.ERROR, 'Kein Raum beigetreten'); return; }
      const { room, roomCode } = ctx;

      room.session.reset();
      room.resetAuth();
      emitSongsUpdate(roomCode, room);
      emitPhaseChange(roomCode, room);
      console.log(`[${roomCode}] Session reset`);
    } catch (error) {
      socket.emit(SocketEvents.ERROR, 'Failed to reset session');
      console.error('Reset error:', error);
    }
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
    const ctx = getRoomForSocket(socket.id);
    if (ctx) {
      const { room, roomCode } = ctx;
      room.session.removeStudent(socket.id);
      room.adminSockets.delete(socket.id);
      if (room.session.phase === 'presentation') {
        emitVoteStats(roomCode, room);
      }
    }
    socketRooms.delete(socket.id);
  });
});

// Import Session
app.post('/api/sessions/import', (req, res) => {
  try {
    const data = req.body as SessionPersistence.PersistedSession;
    if (!data || !Array.isArray(data.songs) || !data.phase || !data.roomCode) {
      res.status(400).json({ error: 'Ungültige Session-Daten' });
      return;
    }
    const roomCode = roomManager.importRoom(data);
    res.json({ roomCode });
    console.log(`Session imported as room ${roomCode}`);
  } catch (err) {
    console.error('Import session error:', err);
    res.status(500).json({ error: 'Import fehlgeschlagen' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    rooms: roomManager.getRoomCount(),
  });
});

// Start server
const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`SSC Server running on port ${PORT}`);
  console.log(`Frontend URL: ${process.env.FRONTEND_URL}`);
});
