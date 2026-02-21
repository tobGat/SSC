import { useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { CurrentSongData } from '../../types';

function getYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

interface PresentationProps {
  currentSong: CurrentSongData | null;
  votingStats: { voted: number; total: number };
  votingComplete: { songId: string; averageScore?: number } | null;
  onNext: () => void;
  onExport: () => void;
  phase: string;
}

export const Presentation = ({ currentSong, votingStats, votingComplete, onNext, onExport, phase }: PresentationProps) => {
  const youtubeId = useMemo(() => {
    if (currentSong?.song.link) return getYouTubeId(currentSong.song.link);
    return null;
  }, [currentSong?.song.link]);

  useEffect(() => {
    // Auto-advance when voting is complete (after 5 seconds)
    if (votingComplete && currentSong && votingComplete.songId === currentSong.song.id) {
      const timer = setTimeout(() => {
        onNext();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [votingComplete, currentSong, onNext]);

  if (phase !== 'presentation') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="card text-center">
          <p className="text-lg text-gray-600">Präsentation noch nicht gestartet</p>
        </div>
      </div>
    );
  }

  if (!currentSong) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="card text-center">
          <p className="text-lg text-gray-600">Lade Song-Daten...</p>
        </div>
      </div>
    );
  }

  const progressPercent =
    votingStats.total > 0 ? Math.round((votingStats.voted / votingStats.total) * 100) : 0;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 relative">
      {/* Progress Indicator */}
      <div className="absolute top-8 right-8 bg-white rounded-lg shadow-lg px-6 py-3">
        <p className="text-sm font-semibold text-gray-600">
          Song {currentSong.songNumber} von {currentSong.totalSongs}
        </p>
      </div>

      {/* Export Button */}
      <button
        onClick={onExport}
        className="absolute bottom-8 right-8 bg-white/80 hover:bg-white text-gray-700 text-sm font-medium px-4 py-2 rounded-lg shadow transition-colors"
        title="Sitzung als Datei speichern – kann später wieder importiert werden"
      >
        💾 Exportieren
      </button>

      {/* Manual Next Button */}
      {votingComplete && (
        <button
          onClick={onNext}
          className="absolute top-8 left-8 bg-green-500 hover:bg-green-600 text-white font-bold px-6 py-3 rounded-lg shadow-lg"
        >
          Nächster Song →
        </button>
      )}

      {/* Main Song Card */}
      <motion.div
        key={currentSong.song.id}
        initial={{ opacity: 0, scale: 0.8, rotateY: -90 }}
        animate={{ opacity: 1, scale: 1, rotateY: 0 }}
        exit={{ opacity: 0, scale: 0.8, rotateY: 90 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl w-full"
      >
        <div className="bg-gradient-to-br from-primary-500 via-purple-600 to-pink-600 rounded-3xl shadow-2xl p-12 text-center text-white">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {!youtubeId && <div className="text-8xl mb-8">🎵</div>}
            <h1 className="text-6xl font-extrabold mb-6 drop-shadow-lg">{currentSong.song.title}</h1>
            <h2 className="text-4xl font-semibold mb-8 opacity-90">{currentSong.song.artist}</h2>

            {youtubeId ? (
              <div className="relative w-full pt-[56.25%] rounded-2xl overflow-hidden shadow-2xl">
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src={`https://www.youtube-nocookie.com/embed/${youtubeId}?rel=0`}
                  title={currentSong.song.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : currentSong.song.link ? (
              <a
                href={currentSong.song.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-white text-purple-700 font-bold px-8 py-4 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
              >
                🎧 Song anhören
              </a>
            ) : null}
          </motion.div>
        </div>
      </motion.div>

      {/* Voting Status */}
      <AnimatePresence mode="wait">
        {!votingComplete ? (
          <motion.div
            key="voting"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mt-12 max-w-2xl w-full"
          >
            <div className="card bg-white/90 backdrop-blur">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">Voting läuft...</h3>
                <span className="text-2xl font-bold text-purple-700">
                  {votingStats.voted} / {votingStats.total}
                </span>
              </div>

              <div className="bg-gray-200 rounded-full h-6 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  className="bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 h-full rounded-full flex items-center justify-center"
                  transition={{ duration: 0.5 }}
                >
                  {progressPercent > 10 && <span className="text-white text-sm font-bold">{progressPercent}%</span>}
                </motion.div>
              </div>

              <p className="text-center text-gray-600 mt-4">Warte auf alle Votes...</p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="complete"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="mt-12 max-w-2xl w-full"
          >
            <div className="card bg-gradient-to-r from-green-50 to-emerald-50 border-4 border-green-300">
              <div className="text-center">
                <div className="text-7xl mb-4">✨</div>
                <h3 className="text-4xl font-extrabold text-green-700 mb-4">Voting abgeschlossen!</h3>
                <div className="bg-white rounded-xl p-6 shadow-inner">
                  <p className="text-gray-600 text-lg mb-2">Durchschnittspunktzahl</p>
                  <p className="text-6xl font-extrabold bg-gradient-to-r from-gold-500 to-gold-600 bg-clip-text text-transparent">
                    {votingComplete.averageScore?.toFixed(2)}
                  </p>
                  <p className="text-gray-500 text-sm mt-2">Punkte</p>
                </div>
                <p className="text-gray-600 mt-6 text-sm">Weiter zum nächsten Song in 5 Sekunden...</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
