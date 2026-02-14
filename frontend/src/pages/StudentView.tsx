import { Link } from 'react-router-dom';
import { useSocket } from '../hooks/useSocket';
import { SongSubmission } from '../components/student/SongSubmission';
import { VotingInterface } from '../components/student/VotingInterface';
import { motion } from 'framer-motion';

export const StudentView = () => {
  const {
    connected,
    phase,
    currentSong,
    votingStats,
    votingComplete,
    finalResults,
    submitSong,
    submitVote,
  } = useSocket();

  return (
    <div className="min-h-screen p-4 md:p-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-primary-600 hover:text-primary-700 font-semibold">
            ← Zurück
          </Link>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm text-gray-600">{connected ? 'Verbunden' : 'Nicht verbunden'}</span>
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center mt-6">
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent mb-2">
            SSC - School Song Contest
          </h1>
          <p className="text-gray-600">Schüler-Ansicht</p>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto">
        {phase === 'submission' && (
          <SongSubmission onSubmit={submitSong} phase={phase} />
        )}

        {phase === 'presentation' && (
          <VotingInterface
            currentSong={currentSong}
            votingStats={votingStats}
            votingComplete={votingComplete}
            onVote={submitVote}
            phase={phase}
          />
        )}

        {phase === 'results' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card text-center max-w-2xl mx-auto"
          >
            <div className="text-7xl mb-4">🏆</div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Voting abgeschlossen!</h2>
            <p className="text-lg text-gray-600 mb-6">Die Ergebnisse werden jetzt präsentiert.</p>

            {finalResults.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xl font-bold text-gray-700 mb-4">Top 3</h3>
                {finalResults.slice(0, 3).map(ranking => (
                  <div
                    key={ranking.song.id}
                    className={`p-4 rounded-lg ${
                      ranking.rank === 1
                        ? 'bg-gradient-to-r from-gold-300 to-gold-400'
                        : ranking.rank === 2
                        ? 'bg-gray-200'
                        : 'bg-amber-600 text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-left">
                        <p className="text-2xl font-bold">
                          {ranking.rank === 1 ? '🥇' : ranking.rank === 2 ? '🥈' : '🥉'} {ranking.song.title}
                        </p>
                        <p className="text-sm opacity-90">{ranking.song.artist}</p>
                      </div>
                      <p className="text-3xl font-extrabold">{ranking.song.averageScore?.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};
