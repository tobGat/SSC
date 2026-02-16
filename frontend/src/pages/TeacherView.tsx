import { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSocket } from '../hooks/useSocket';
import { AdminLogin } from '../components/teacher/AdminLogin';
import { SongList } from '../components/teacher/SongList';
import { Presentation } from '../components/teacher/Presentation';
import { FinalRanking } from '../components/teacher/FinalRanking';
import { motion } from 'framer-motion';
import sscLogo from '../assets/logo_ssc_transp.png';

export const TeacherView = () => {
  const { roomCode: urlRoomCode } = useParams<{ roomCode: string }>();
  const navigate = useNavigate();
  const isCreateMode = !urlRoomCode; // /teacher/create has no :roomCode param

  const {
    connected,
    phase,
    songs,
    currentSong,
    votingStats,
    votingComplete,
    finalResults,
    authToken,
    authError,
    passwordIsSet,
    roomJoined,
    roomError,
    currentRoomCode,
    createRoom,
    joinRoom,
    login,
    setPassword,
    checkPasswordStatus,
    editSong,
    deleteSong,
    startPresentation,
    nextSong,
    exportResults,
    resetSession,
  } = useSocket();

  // Create room when entering /teacher/create
  useEffect(() => {
    if (isCreateMode && connected && !roomJoined && !currentRoomCode) {
      createRoom();
    }
  }, [isCreateMode, connected, roomJoined, currentRoomCode, createRoom]);

  // Redirect to /teacher/ROOMCODE after room is created
  useEffect(() => {
    if (isCreateMode && currentRoomCode) {
      navigate(`/teacher/${currentRoomCode}`, { replace: true });
    }
  }, [isCreateMode, currentRoomCode, navigate]);

  // Join existing room from URL
  useEffect(() => {
    if (urlRoomCode && connected && !roomJoined && !currentRoomCode) {
      joinRoom(urlRoomCode);
    }
  }, [urlRoomCode, connected, roomJoined, currentRoomCode, joinRoom]);

  // Check password status once room is joined
  useEffect(() => {
    if (roomJoined && !authToken) {
      checkPasswordStatus();
    }
  }, [roomJoined, authToken, checkPasswordStatus]);

  const handleExportCSV = () => {
    exportResults('csv', (data) => {
      const blob = new Blob([data.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ssc-results-${currentRoomCode}-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    });
  };

  const handleExportPDF = () => {
    exportResults('pdf', (data) => {
      const blob = new Blob([Uint8Array.from(atob(data.data), c => c.charCodeAt(0))], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ssc-results-${currentRoomCode}-${new Date().toISOString().split('T')[0]}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    });
  };

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
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Fehler</h2>
          <p className="text-gray-600 mb-6">{roomError}</p>
          <Link to="/" className="btn-primary inline-block">Zurück zur Startseite</Link>
        </motion.div>
      </div>
    );
  }

  // Waiting for room
  if (!roomJoined) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="card text-center">
          <p className="text-gray-600">Raum wird erstellt...</p>
        </div>
      </div>
    );
  }

  // Show login if not authenticated
  if (!authToken) {
    return (
      <AdminLogin
        onLogin={login}
        onSetPassword={setPassword}
        authToken={authToken}
        passwordIsSet={passwordIsSet}
        authError={authError}
        roomCode={currentRoomCode}
      />
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      {/* Header */}
      {phase !== 'presentation' && (
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
              <div className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold">
                Phase: {phase === 'submission' ? 'Einreichung' : 'Ergebnisse'}
              </div>
            </div>
          </div>

          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center mt-6">
            <img src={sscLogo} alt="SSC - School Song Contest" className="h-14 md:h-16 mx-auto mb-2" />
            <p className="text-gray-600">Lehrer-Ansicht</p>
          </motion.div>
        </div>
      )}

      {/* Main Content */}
      {phase === 'submission' && (
        <SongList
          songs={songs}
          onEdit={editSong}
          onDelete={deleteSong}
          onStartPresentation={startPresentation}
          onReset={resetSession}
          phase={phase}
        />
      )}

      {phase === 'presentation' && (
        <Presentation
          currentSong={currentSong}
          votingStats={votingStats}
          votingComplete={votingComplete}
          onNext={nextSong}
          phase={phase}
        />
      )}

      {phase === 'results' && (
        <FinalRanking
          rankings={finalResults}
          onExportCSV={handleExportCSV}
          onExportPDF={handleExportPDF}
          onReset={resetSession}
        />
      )}
    </div>
  );
};
