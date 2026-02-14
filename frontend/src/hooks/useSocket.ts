import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import type { Song, CurrentSongData, VotingStats, SongRanking, AuthResponse, Phase, ExportData } from '../types';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [songs, setSongs] = useState<Song[]>([]);
  const [phase, setPhase] = useState<Phase>('submission');
  const [currentSong, setCurrentSong] = useState<CurrentSongData | null>(null);
  const [votingStats, setVotingStats] = useState<VotingStats>({ voted: 0, total: 0 });
  const [finalResults, setFinalResults] = useState<SongRanking[]>([]);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [votingComplete, setVotingComplete] = useState<{ songId: string; averageScore?: number } | null>(null);

  useEffect(() => {
    const newSocket = io(BACKEND_URL);

    newSocket.on('connect', () => {
      setConnected(true);
      console.log('Connected to server');
    });

    newSocket.on('disconnect', () => {
      setConnected(false);
      console.log('Disconnected from server');
    });

    newSocket.on('songs-updated', (updatedSongs: Song[]) => {
      setSongs(updatedSongs);
    });

    newSocket.on('phase-changed', (newPhase: Phase) => {
      setPhase(newPhase);
    });

    newSocket.on('current-song', (data: CurrentSongData) => {
      setCurrentSong(data);
      setVotingComplete(null); // Reset voting complete when new song starts
    });

    newSocket.on('vote-stats', (stats: VotingStats) => {
      setVotingStats(stats);
    });

    newSocket.on('voting-complete', (data: { songId: string; averageScore?: number }) => {
      setVotingComplete(data);
    });

    newSocket.on('final-results', (results: SongRanking[]) => {
      setFinalResults(results);
    });

    newSocket.on('auth-result', (response: AuthResponse) => {
      if (response.success && response.token) {
        setAuthToken(response.token);
      }
    });

    newSocket.on('error', (error: string) => {
      console.error('Socket error:', error);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const submitSong = useCallback(
    (title: string, artist: string, link?: string) => {
      if (socket) {
        socket.emit('submit-song', { title, artist, link });
      }
    },
    [socket]
  );

  const editSong = useCallback(
    (id: string, title: string, artist: string, link?: string) => {
      if (socket) {
        socket.emit('edit-song', { id, title, artist, link });
      }
    },
    [socket]
  );

  const deleteSong = useCallback(
    (songId: string) => {
      if (socket) {
        socket.emit('delete-song', songId);
      }
    },
    [socket]
  );

  const startPresentation = useCallback(() => {
    if (socket) {
      socket.emit('start-presentation');
    }
  }, [socket]);

  const nextSong = useCallback(() => {
    if (socket) {
      socket.emit('next-song');
    }
  }, [socket]);

  const submitVote = useCallback(
    (songId: string, points: number) => {
      if (socket) {
        socket.emit('submit-vote', { songId, points });
      }
    },
    [socket]
  );

  const login = useCallback(
    (password: string) => {
      if (socket) {
        socket.emit('admin-login', password);
      }
    },
    [socket]
  );

  const exportResults = useCallback(
    (format: 'csv' | 'pdf', callback: (data: ExportData) => void) => {
      if (socket) {
        socket.emit('export-results', { format });
        socket.once('export-data', callback);
      }
    },
    [socket]
  );

  const resetSession = useCallback(() => {
    if (socket) {
      socket.emit('reset-session');
    }
  }, [socket]);

  return {
    connected,
    songs,
    phase,
    currentSong,
    votingStats,
    finalResults,
    authToken,
    votingComplete,
    submitSong,
    editSong,
    deleteSong,
    startPresentation,
    nextSong,
    submitVote,
    login,
    exportResults,
    resetSession,
  };
};
