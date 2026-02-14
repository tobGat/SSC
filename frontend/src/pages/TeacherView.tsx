import { Link } from 'react-router-dom';
import { useSocket } from '../hooks/useSocket';
import { AdminLogin } from '../components/teacher/AdminLogin';
import { SongList } from '../components/teacher/SongList';
import { Presentation } from '../components/teacher/Presentation';
import { FinalRanking } from '../components/teacher/FinalRanking';
import { motion } from 'framer-motion';

export const TeacherView = () => {
  const {
    connected,
    phase,
    songs,
    currentSong,
    votingStats,
    votingComplete,
    finalResults,
    authToken,
    login,
    editSong,
    deleteSong,
    startPresentation,
    nextSong,
    exportResults,
    resetSession,
  } = useSocket();

  const handleExportCSV = () => {
    exportResults('csv', (data) => {
      const blob = new Blob([data.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ssc-results-${new Date().toISOString().split('T')[0]}.csv`;
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
      a.download = `ssc-results-${new Date().toISOString().split('T')[0]}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    });
  };

  // Show login if not authenticated
  if (!authToken) {
    return <AdminLogin onLogin={login} authToken={authToken} />;
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
            <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent mb-2">
              SSC - School Song Contest
            </h1>
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
