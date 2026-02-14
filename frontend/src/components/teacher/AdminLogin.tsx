import { useState } from 'react';
import { motion } from 'framer-motion';

interface AdminLoginProps {
  onLogin: (password: string) => void;
  authToken: string | null;
}

export const AdminLogin = ({ onLogin, authToken }: AdminLoginProps) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError('Bitte Passwort eingeben');
      return;
    }
    onLogin(password);
    setError('');
  };

  if (authToken) {
    return null; // Already logged in
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card max-w-md w-full"
      >
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">🔐</div>
          <h2 className="text-2xl font-bold text-gray-800">Lehrer-Zugang</h2>
          <p className="text-gray-600 mt-2">Bitte melde dich mit deinem Passwort an</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
              Passwort
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="input-field"
              placeholder="Admin-Passwort"
              autoFocus
            />
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button type="submit" className="btn-primary w-full">
            Anmelden
          </button>
        </form>

        <p className="text-xs text-gray-500 text-center mt-6">
          Standard-Passwort: <code className="bg-gray-100 px-2 py-1 rounded">schule123</code>
        </p>
      </motion.div>
    </div>
  );
};
