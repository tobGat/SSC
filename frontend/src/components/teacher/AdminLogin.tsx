import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface AdminLoginProps {
  onLogin: (password: string) => void;
  onSetPassword: (password: string) => void;
  authToken: string | null;
  passwordIsSet: boolean | null;
  authError: string | null;
  roomCode?: string | null;
}

export const AdminLogin = ({ onLogin, onSetPassword, authToken, passwordIsSet, authError, roomCode }: AdminLoginProps) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (authError) setError(authError);
  }, [authError]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError('Bitte Passwort eingeben');
      return;
    }
    setError('');
    onLogin(password);
  };

  const handleSetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError('Bitte Passwort eingeben');
      return;
    }
    if (password.trim().length < 3) {
      setError('Passwort muss mindestens 3 Zeichen lang sein');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwörter stimmen nicht überein');
      return;
    }
    setError('');
    onSetPassword(password.trim());
  };

  if (authToken) {
    return null;
  }

  // Still loading password status
  if (passwordIsSet === null) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="card text-center">
          <p className="text-gray-600">Verbinde...</p>
        </div>
      </div>
    );
  }

  // No password set yet — show "set password" form
  if (!passwordIsSet) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card max-w-md w-full"
        >
          <div className="text-center mb-6">
            {roomCode && (
              <div className="mb-4 p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
                <p className="text-sm text-blue-600 font-semibold mb-1">Dein Raumcode</p>
                <p className="text-4xl font-mono font-extrabold tracking-widest text-blue-800">{roomCode}</p>
                <p className="text-xs text-blue-500 mt-1">Teile diesen Code mit deiner Klasse</p>
              </div>
            )}
            <div className="text-6xl mb-4">🔐</div>
            <h2 className="text-2xl font-bold text-gray-800">Neue Session</h2>
            <p className="text-gray-600 mt-2">
              Lege ein Passwort für diese Session fest. Dieses können auch andere Lehrkräfte verwenden, um sich anzumelden.
            </p>
          </div>

          <form onSubmit={handleSetPassword} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Neues Passwort
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="input-field"
                placeholder="Mindestens 3 Zeichen"
                autoFocus
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                Passwort bestätigen
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="input-field"
                placeholder="Passwort wiederholen"
              />
            </div>

            {error && <p className="text-red-600 text-sm">{error}</p>}

            <button type="submit" className="btn-primary w-full">
              Passwort festlegen & starten
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  // Password is set — show login form
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card max-w-md w-full"
      >
        <div className="text-center mb-6">
          {roomCode && (
            <div className="mb-4 p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
              <p className="text-sm text-blue-600 font-semibold mb-1">Raumcode</p>
              <p className="text-4xl font-mono font-extrabold tracking-widest text-blue-800">{roomCode}</p>
            </div>
          )}
          <div className="text-6xl mb-4">🔐</div>
          <h2 className="text-2xl font-bold text-gray-800">Lehrer-Zugang</h2>
          <p className="text-gray-600 mt-2">Bitte melde dich mit dem Session-Passwort an</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="loginPassword" className="block text-sm font-semibold text-gray-700 mb-2">
              Passwort
            </label>
            <input
              type="password"
              id="loginPassword"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="input-field"
              placeholder="Session-Passwort"
              autoFocus
            />
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button type="submit" className="btn-primary w-full">
            Anmelden
          </button>
        </form>
      </motion.div>
    </div>
  );
};
