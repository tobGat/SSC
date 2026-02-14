import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { CurrentSongData } from '../../types';

interface VotingInterfaceProps {
  currentSong: CurrentSongData | null;
  votingStats: { voted: number; total: number };
  votingComplete: { songId: string; averageScore?: number } | null;
  onVote: (songId: string, points: number) => void;
  phase: string;
}

export const VotingInterface = ({ currentSong, votingStats, votingComplete, onVote, phase }: VotingInterfaceProps) => {
  const [selectedPoints, setSelectedPoints] = useState<number | null>(null);
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(() => {
    // Reset when new song starts
    if (currentSong && !votingComplete) {
      setHasVoted(false);
      setSelectedPoints(null);
    }
  }, [currentSong, votingComplete]);

  if (phase !== 'presentation') {
    return (
      <div className="card text-center">
        <p className="text-lg text-gray-600">Warte auf den Start der Präsentation...</p>
      </div>
    );
  }

  if (!currentSong) {
    return (
      <div className="card text-center">
        <p className="text-lg text-gray-600">Lade Song-Daten...</p>
      </div>
    );
  }

  const handleVote = () => {
    if (selectedPoints === null) {
      alert('Bitte wähle eine Punktzahl aus');
      return;
    }

    onVote(currentSong.song.id, selectedPoints);
    setHasVoted(true);
  };

  const pointsButtons = Array.from({ length: 10 }, (_, i) => i + 1);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Song Info */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="card text-center">
        <div className="mb-4">
          <span className="text-sm font-semibold text-primary-600">
            Song {currentSong.songNumber} von {currentSong.totalSongs}
          </span>
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">{currentSong.song.title}</h2>
        <p className="text-xl text-gray-600 mb-4">{currentSong.song.artist}</p>

        {currentSong.song.link && (
          <a
            href={currentSong.song.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-primary-600 hover:text-primary-700 font-semibold"
          >
            🎵 Song anhören
          </a>
        )}
      </motion.div>

      {/* Voting Complete Message */}
      <AnimatePresence>
        {votingComplete && votingComplete.songId === currentSong.song.id && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="card text-center bg-gradient-to-r from-green-50 to-emerald-50 border-green-200"
          >
            <div className="text-5xl mb-3">✨</div>
            <h3 className="text-2xl font-bold text-green-700 mb-2">Voting abgeschlossen!</h3>
            <p className="text-xl text-green-600">
              Durchschnitt: <span className="font-bold">{votingComplete.averageScore?.toFixed(2)} Punkte</span>
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Voting Interface */}
      {!hasVoted && !votingComplete && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card">
          <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Wie viele Punkte gibst du?</h3>

          <div className="grid grid-cols-5 gap-3 mb-6">
            {pointsButtons.map(points => (
              <motion.button
                key={points}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedPoints(points)}
                className={`h-16 rounded-lg font-bold text-lg transition-all duration-200 ${
                  selectedPoints === points
                    ? 'bg-gradient-to-r from-primary-500 to-purple-600 text-white shadow-lg scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {points}
              </motion.button>
            ))}
          </div>

          <button onClick={handleVote} disabled={selectedPoints === null} className="btn-primary w-full">
            Vote abgeben
          </button>
        </motion.div>
      )}

      {/* Already Voted */}
      {hasVoted && !votingComplete && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card text-center bg-gradient-to-r from-blue-50 to-purple-50"
        >
          <div className="text-5xl mb-3">✓</div>
          <h3 className="text-2xl font-bold text-primary-700 mb-2">Dein Vote wurde abgegeben!</h3>
          <p className="text-lg text-gray-600">
            {votingStats.voted} von {votingStats.total} Schüler:innen haben abgestimmt
          </p>
        </motion.div>
      )}

      {/* Live Stats */}
      {!votingComplete && (
        <div className="card bg-gradient-to-r from-purple-50 to-pink-50">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-700">Voting Fortschritt:</span>
            <span className="text-sm font-bold text-purple-700">
              {votingStats.voted} / {votingStats.total}
            </span>
          </div>
          <div className="mt-2 bg-gray-200 rounded-full h-3 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${votingStats.total > 0 ? (votingStats.voted / votingStats.total) * 100 : 0}%` }}
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full"
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
