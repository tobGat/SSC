import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import sscLogo from '../assets/logo_ssc_transp.png';

export const Home = () => {
  const [roomCode, setRoomCode] = useState('');
  const [error, setError] = useState('');
  const [teacherCode, setTeacherCode] = useState('');
  const [teacherError, setTeacherError] = useState('');
  const navigate = useNavigate();

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    const code = roomCode.trim().toUpperCase();
    if (!code) {
      setError('Bitte Raumcode eingeben');
      return;
    }
    if (code.length < 4) {
      setError('Raumcode ist zu kurz');
      return;
    }
    setError('');
    navigate(`/student/${code}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <img src={sscLogo} alt="SSC - School Song Contest" className="h-20 md:h-24 mx-auto mb-4" />
          <p className="text-lg text-gray-600">Wähle deine Ansicht</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <div className="card-hover text-center h-full">
              <div className="text-8xl mb-6">🎤</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">Schüler:in</h3>
              <p className="text-gray-600 mb-4">Gib den Raumcode ein, den deine Lehrkraft anzeigt</p>

              <form onSubmit={handleJoinRoom} className="space-y-3">
                <input
                  type="text"
                  value={roomCode}
                  onChange={e => {
                    setRoomCode(e.target.value.toUpperCase());
                    setError('');
                  }}
                  className="input-field text-center text-2xl tracking-widest font-mono"
                  placeholder="RAUMCODE"
                  maxLength={6}
                  autoComplete="off"
                />
                {error && <p className="text-red-600 text-sm">{error}</p>}
                <button type="submit" className="btn-primary w-full">
                  Raum beitreten
                </button>
              </form>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
            <div className="card-hover text-center h-full">
              <div className="text-8xl mb-6">👨‍🏫</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">Lehrer:in</h3>
              <p className="text-gray-600 mb-4">Erstelle einen neuen Raum für deine Klasse</p>
              <button className="btn-gold w-full" onClick={() => navigate('/teacher/create')}>
                Neuen Raum erstellen
              </button>

              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-sm text-gray-400">oder</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              <p className="text-gray-500 text-sm mb-3">Bestehende Sitzung fortsetzen</p>
              <form
                onSubmit={e => {
                  e.preventDefault();
                  const code = teacherCode.trim().toUpperCase();
                  if (!code || code.length < 4) { setTeacherError('Raumcode ist zu kurz'); return; }
                  setTeacherError('');
                  navigate(`/teacher/${code}`);
                }}
                className="space-y-2"
              >
                <input
                  type="text"
                  value={teacherCode}
                  onChange={e => { setTeacherCode(e.target.value.toUpperCase()); setTeacherError(''); }}
                  className="input-field text-center text-xl tracking-widest font-mono"
                  placeholder="RAUMCODE"
                  maxLength={6}
                  autoComplete="off"
                />
                {teacherError && <p className="text-red-600 text-sm">{teacherError}</p>}
                <button type="submit" className="btn-secondary w-full">
                  Sitzung fortsetzen
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
