import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Confetti from 'react-confetti';
import type { SongRanking } from '../../types';

interface FinalRankingProps {
  rankings: SongRanking[];
  onExportCSV: () => void;
  onExportPDF: () => void;
  onReset: () => void;
}

export const FinalRanking = ({ rankings, onExportCSV, onExportPDF, onReset }: FinalRankingProps) => {
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const { width, height } = windowSize;

  const getMedalEmoji = (rank: number) => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return '';
    }
  };

  const getRankClass = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-gold-300 to-gold-500 text-gray-900 shadow-xl scale-105';
      case 2:
        return 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-900 shadow-lg';
      case 3:
        return 'bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-lg';
      default:
        return 'bg-white hover:bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen p-8">
      {rankings.length > 0 && rankings[0].rank === 1 && width && height && (
        <Confetti width={width} height={height} recycle={false} numberOfPieces={500} />
      )}

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="eurovision-title mb-4">🏆 Endergebnis 🏆</h1>
          <p className="text-xl text-gray-600">SSC - School Song Contest</p>
        </motion.div>

        {/* Top 3 Podium */}
        {rankings.length >= 3 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-12 grid grid-cols-3 gap-6 max-w-4xl mx-auto"
          >
            {/* 2nd Place */}
            <div className="text-center transform translate-y-8">
              <div className="text-6xl mb-2">🥈</div>
              <div className="card bg-gradient-to-br from-gray-200 to-gray-300">
                <h3 className="font-bold text-lg mb-1">{rankings[1].song.title}</h3>
                <p className="text-sm text-gray-700">{rankings[1].song.artist}</p>
                <p className="text-3xl font-extrabold text-gray-800 mt-3">
                  {rankings[1].song.averageScore?.toFixed(2)}
                </p>
              </div>
            </div>

            {/* 1st Place */}
            <div className="text-center">
              <div className="text-8xl mb-2">🥇</div>
              <div className="card bg-gradient-to-br from-gold-300 via-gold-400 to-gold-500 shadow-2xl transform scale-110">
                <h3 className="font-extrabold text-2xl mb-1 text-gray-900">{rankings[0].song.title}</h3>
                <p className="text-gray-800 font-semibold">{rankings[0].song.artist}</p>
                <p className="text-5xl font-extrabold text-gray-900 mt-4">
                  {rankings[0].song.averageScore?.toFixed(2)}
                </p>
                <p className="text-xs text-gray-700 mt-2">Gewinner!</p>
              </div>
            </div>

            {/* 3rd Place */}
            <div className="text-center transform translate-y-8">
              <div className="text-6xl mb-2">🥉</div>
              <div className="card bg-gradient-to-br from-amber-600 to-amber-700">
                <h3 className="font-bold text-lg mb-1 text-white">{rankings[2].song.title}</h3>
                <p className="text-sm text-amber-100">{rankings[2].song.artist}</p>
                <p className="text-3xl font-extrabold text-white mt-3">
                  {rankings[2].song.averageScore?.toFixed(2)}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Full Rankings Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Alle Ergebnisse</h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 px-4 font-bold text-gray-700">Rang</th>
                  <th className="text-left py-3 px-4 font-bold text-gray-700">Titel</th>
                  <th className="text-left py-3 px-4 font-bold text-gray-700">Interpret:in</th>
                  <th className="text-right py-3 px-4 font-bold text-gray-700">Ø Punkte</th>
                  <th className="text-right py-3 px-4 font-bold text-gray-700">Votes</th>
                </tr>
              </thead>
              <tbody>
                {rankings.map((ranking, index) => (
                  <motion.tr
                    key={ranking.song.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.05 }}
                    className={`border-b border-gray-100 transition-all ${getRankClass(ranking.rank)}`}
                  >
                    <td className="py-4 px-4">
                      <span className="text-2xl font-bold">
                        {getMedalEmoji(ranking.rank)} {ranking.rank}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-semibold">{ranking.song.title}</td>
                    <td className="py-4 px-4">{ranking.song.artist}</td>
                    <td className="py-4 px-4 text-right font-bold text-lg">
                      {ranking.song.averageScore?.toFixed(2)}
                    </td>
                    <td className="py-4 px-4 text-right text-gray-600">{ranking.song.totalVotes}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 flex gap-4 justify-center"
        >
          <button onClick={onExportCSV} className="btn-secondary">
            📊 CSV exportieren
          </button>
          <button onClick={onExportPDF} className="btn-secondary">
            📄 PDF exportieren
          </button>
          <button onClick={onReset} className="btn-primary">
            🔄 Neue Session starten
          </button>
        </motion.div>
      </div>
    </div>
  );
};
