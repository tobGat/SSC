import { useState } from 'react';
import { motion } from 'framer-motion';

interface SongSubmissionProps {
  onSubmit: (title: string, artist: string, link?: string) => void;
  phase: string;
}

export const SongSubmission = ({ onSubmit, phase }: SongSubmissionProps) => {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [link, setLink] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !artist.trim()) {
      alert('Bitte Titel und Interpret:in eingeben');
      return;
    }

    onSubmit(title.trim(), artist.trim(), link.trim() || undefined);
    setSubmitted(true);

    setTimeout(() => {
      setTitle('');
      setArtist('');
      setLink('');
      setSubmitted(false);
    }, 2000);
  };

  if (phase !== 'submission') {
    return (
      <div className="card text-center">
        <p className="text-lg text-gray-600">Die Einreichungsphase ist beendet.</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card max-w-2xl mx-auto"
    >
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Deinen Song einreichen</h2>

      {submitted ? (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-center py-12"
        >
          <div className="text-6xl mb-4">🎵</div>
          <p className="text-2xl font-bold text-green-600">Song eingereicht!</p>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
              Song-Titel *
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="input-field"
              placeholder="z.B. Satellite"
              required
            />
          </div>

          <div>
            <label htmlFor="artist" className="block text-sm font-semibold text-gray-700 mb-2">
              Interpret:in *
            </label>
            <input
              type="text"
              id="artist"
              value={artist}
              onChange={e => setArtist(e.target.value)}
              className="input-field"
              placeholder="z.B. Lena Meyer-Landrut"
              required
            />
          </div>

          <div>
            <label htmlFor="link" className="block text-sm font-semibold text-gray-700 mb-2">
              Link (optional)
            </label>
            <input
              type="url"
              id="link"
              value={link}
              onChange={e => setLink(e.target.value)}
              className="input-field"
              placeholder="YouTube oder Spotify Link"
            />
          </div>

          <button type="submit" className="btn-primary w-full mt-6">
            Song einreichen
          </button>
        </form>
      )}
    </motion.div>
  );
};
