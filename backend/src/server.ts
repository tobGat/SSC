import express from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { VotingSessionModel } from './models/VotingSession';
import { SocketEvents, SongSubmission, SongEdit, VoteSubmission, ExportRequest } from './types/socket-events';
import { generateToken, verifyPassword } from './middleware/auth';
import { ExportService } from './services/ExportService';

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

// Global voting session
const votingSession = new VotingSessionModel();

// Track admin sockets (exclude from student count)
const adminSockets = new Set<string>();

// Helper functions
const emitSongsUpdate = () => {
  const songs = Array.from(votingSession.songs.values()).map(song => song.toJSON());
  io.emit(SocketEvents.SONGS_UPDATED, songs);
};

const emitPhaseChange = () => {
  io.emit(SocketEvents.PHASE_CHANGED, votingSession.phase);
};

const emitVoteStats = () => {
  // Calculate actual student count (excluding admins)
  const actualStudentCount = votingSession.connectedStudents.size - adminSockets.size;
  io.emit(SocketEvents.VOTE_STATS, {
    voted: votingSession.votedStudents.size,
    total: actualStudentCount,
  });
};

const emitCurrentSong = () => {
  const currentSong = votingSession.getCurrentSong();
  if (!currentSong) return;

  // Calculate actual student count (excluding admins)
  const actualStudentCount = votingSession.connectedStudents.size - adminSockets.size;
  io.emit(SocketEvents.CURRENT_SONG, {
    song: currentSong.toJSON(),
    songNumber: votingSession.currentSongIndex + 1,
    totalSongs: votingSession.presentationOrder.length,
    votingStats: {
      voted: votingSession.votedStudents.size,
      total: actualStudentCount,
    },
  });
};

// Socket.io connection handling
io.on('connection', (socket: Socket) => {
  console.log(`Client connected: ${socket.id}`);
  votingSession.addStudent(socket.id);

  // Send current state to new connection
  emitSongsUpdate();
  emitPhaseChange();

  if (votingSession.phase === 'presentation') {
    emitCurrentSong();
  } else if (votingSession.phase === 'results') {
    const rankings = votingSession.getRankings();
    socket.emit(SocketEvents.FINAL_RESULTS, rankings);
  }

  // Song Submission (Students)
  socket.on(SocketEvents.SUBMIT_SONG, (data: SongSubmission) => {
    try {
      if (votingSession.phase !== 'submission') {
        socket.emit(SocketEvents.ERROR, 'Song submissions are closed');
        return;
      }

      const { title, artist, link } = data;
      if (!title || !artist) {
        socket.emit(SocketEvents.ERROR, 'Title and artist are required');
        return;
      }

      votingSession.addSong(title.trim(), artist.trim(), link?.trim());
      emitSongsUpdate();
      console.log(`Song submitted: ${title} by ${artist}`);
    } catch (error) {
      socket.emit(SocketEvents.ERROR, 'Failed to submit song');
      console.error('Submit song error:', error);
    }
  });

  // Edit Song (Teacher only)
  socket.on(SocketEvents.EDIT_SONG, (data: SongEdit) => {
    try {
      const { id, title, artist, link } = data;
      if (!id || !title || !artist) {
        socket.emit(SocketEvents.ERROR, 'ID, title and artist are required');
        return;
      }

      const song = votingSession.editSong(id, title.trim(), artist.trim(), link?.trim());
      if (!song) {
        socket.emit(SocketEvents.ERROR, 'Song not found');
        return;
      }

      emitSongsUpdate();
      console.log(`Song edited: ${id}`);
    } catch (error) {
      socket.emit(SocketEvents.ERROR, 'Failed to edit song');
      console.error('Edit song error:', error);
    }
  });

  // Delete Song (Teacher only)
  socket.on(SocketEvents.DELETE_SONG, (songId: string) => {
    try {
      const deleted = votingSession.deleteSong(songId);
      if (!deleted) {
        socket.emit(SocketEvents.ERROR, 'Song not found');
        return;
      }

      emitSongsUpdate();
      console.log(`Song deleted: ${songId}`);
    } catch (error) {
      socket.emit(SocketEvents.ERROR, 'Failed to delete song');
      console.error('Delete song error:', error);
    }
  });

  // Start Presentation (Teacher only)
  socket.on(SocketEvents.START_PRESENTATION, () => {
    try {
      votingSession.startPresentation();
      emitPhaseChange();
      emitCurrentSong();
      console.log('Presentation started');
    } catch (error) {
      socket.emit(SocketEvents.ERROR, error instanceof Error ? error.message : 'Failed to start presentation');
      console.error('Start presentation error:', error);
    }
  });

  // Next Song (Teacher only - or automatic)
  socket.on(SocketEvents.NEXT_SONG, () => {
    try {
      const hasNext = votingSession.nextSong();

      if (hasNext) {
        emitCurrentSong();
      } else {
        emitPhaseChange();
        const rankings = votingSession.getRankings();
        io.emit(SocketEvents.FINAL_RESULTS, rankings);
      }

      console.log(`Moving to next song. Has next: ${hasNext}`);
    } catch (error) {
      socket.emit(SocketEvents.ERROR, 'Failed to move to next song');
      console.error('Next song error:', error);
    }
  });

  // Submit Vote (Students)
  socket.on(SocketEvents.SUBMIT_VOTE, (data: VoteSubmission) => {
    try {
      if (votingSession.phase !== 'presentation') {
        socket.emit(SocketEvents.ERROR, 'Voting is not active');
        return;
      }

      const { songId, points } = data;
      if (!songId || points < 1 || points > 10) {
        socket.emit(SocketEvents.ERROR, 'Invalid vote data');
        return;
      }

      const success = votingSession.addVote(songId, points, socket.id);
      if (!success) {
        socket.emit(SocketEvents.ERROR, 'Vote already submitted or invalid song');
        return;
      }

      emitVoteStats();
      console.log(`Vote submitted: ${points} points for song ${songId}`);

      // Check if all students have voted (excluding admins)
      const actualStudentCount = votingSession.connectedStudents.size - adminSockets.size;
      const allVoted = votingSession.votedStudents.size >= actualStudentCount && actualStudentCount > 0;

      if (allVoted) {
        const currentSong = votingSession.getCurrentSong();
        if (currentSong) {
          setTimeout(() => {
            io.emit(SocketEvents.VOTING_COMPLETE, {
              songId: currentSong.id,
              averageScore: currentSong.averageScore,
            });
            console.log(`Voting complete for song: ${currentSong.title} - Average: ${currentSong.averageScore}`);
          }, 1000);
        }
      }
    } catch (error) {
      socket.emit(SocketEvents.ERROR, 'Failed to submit vote');
      console.error('Submit vote error:', error);
    }
  });

  // Admin Login
  socket.on(SocketEvents.ADMIN_LOGIN, (password: string) => {
    try {
      if (verifyPassword(password)) {
        const token = generateToken();
        // Mark this socket as admin
        adminSockets.add(socket.id);
        socket.emit(SocketEvents.AUTH_RESULT, {
          success: true,
          token,
          message: 'Login successful',
        });
        // Update vote stats to reflect correct student count
        if (votingSession.phase === 'presentation') {
          emitVoteStats();
        }
        console.log('Admin logged in:', socket.id);
      } else {
        socket.emit(SocketEvents.AUTH_RESULT, {
          success: false,
          message: 'Invalid password',
        });
        console.log('Failed admin login attempt');
      }
    } catch (error) {
      socket.emit(SocketEvents.ERROR, 'Login failed');
      console.error('Login error:', error);
    }
  });

  // Export Results
  socket.on(SocketEvents.EXPORT_RESULTS, async (data: ExportRequest) => {
    try {
      const rankings = votingSession.getRankings();

      if (data.format === 'csv') {
        const csv = await ExportService.exportToCSV(rankings);
        socket.emit('export-data', { format: 'csv', data: csv });
      } else if (data.format === 'pdf') {
        const pdf = await ExportService.exportToPDF(rankings);
        socket.emit('export-data', { format: 'pdf', data: pdf.toString('base64') });
      }

      console.log(`Results exported as ${data.format}`);
    } catch (error) {
      socket.emit(SocketEvents.ERROR, 'Failed to export results');
      console.error('Export error:', error);
    }
  });

  // Reset Session (Teacher only)
  socket.on(SocketEvents.RESET_SESSION, () => {
    try {
      votingSession.reset();
      emitSongsUpdate();
      emitPhaseChange();
      console.log('Session reset');
    } catch (error) {
      socket.emit(SocketEvents.ERROR, 'Failed to reset session');
      console.error('Reset error:', error);
    }
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
    votingSession.removeStudent(socket.id);
    adminSockets.delete(socket.id);
    if (votingSession.phase === 'presentation') {
      emitVoteStats();
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    phase: votingSession.phase,
    songs: votingSession.songs.size,
    students: votingSession.connectedStudents.size,
  });
});

// Start server
const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`🎵 SSC Server running on port ${PORT}`);
  console.log(`Frontend URL: ${process.env.FRONTEND_URL}`);
});
