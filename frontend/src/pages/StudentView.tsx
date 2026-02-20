import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSocket } from '../hooks/useSocket';
import { SongSubmission } from '../components/student/SongSubmission';
import { VotingInterface } from '../components/student/VotingInterface';
import { motion } from 'framer-motion';
import sscLogo from '../assets/logo_ssc_transp.png';

export const StudentView = () => {
  const { roomCode } = useParams<{ roomCode: string }>();

  const {
    connected,
    phase,
    currentSong,
    votingStats,
    votingComplete,
    finalResults,
    roomJoined,
    roomError,
    currentRoomCode,
    joinRoom,
    submitSong,
    submitVote,
  } = useSocket();

  const [songSubmitted, setSongSubmitted] = useState(false);

  const handleSubmitSong = (title: string, artist: string, link?: string) => {
    submitSong(title, artist, link);
    setSongSubmitted(true);
  };

  // Auto-join room from URL (also re-joins after reconnect)
  useEffect(() => {
    if (roomCode && connected && !roomJoined) {
      joinRoom(roomCode);
    }
  }, [roomCode, connected, roomJoined, joinRoom]);

  // Room error
  if (roomError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card text-center max-w-md"
        >
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Raum nicht gefunden</h2>
          <p className="text-gray-600 mb-6">Der Raumcode „{roomCode}" ist ungültig oder der Raum existiert nicht mehr.</p>
          <Link to="/" className="btn-primary inline-block">Zurück zur Startseite</Link>
        </motion.div>
      </div>
    );
  }

  // Waiting for room join
  if (!roomJoined) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="card text-center">
          <p className="text-gray-600">Raum wird beigetreten...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-primary-600 hover:text-primary-700 font-semibold">
            ← Zurück
          </Link>
          <div className="flex items-center gap-4">
            <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-bold font-mono tracking-wider">
              Raum: {currentRoomCode}
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm text-gray-600">{connected ? 'Verbunden' : 'Nicht verbunden'}</span>
            </div>
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center mt-6">
          <img src={sscLogo} alt="SSC - School Song Contest" className="h-14 md:h-16 mx-auto mb-2" />
          <p className="text-gray-600">Schüler:innen-Ansicht</p>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto">
        {phase === 'submission' && (
          <SongSubmission onSubmit={handleSubmitSong} submitted={songSubmitted} phase={phase} />
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
