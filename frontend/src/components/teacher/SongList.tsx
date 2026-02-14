import { useState } from 'react';
import { motion } from 'framer-motion';
import type { Song } from '../../types';

interface SongListProps {
  songs: Song[];
  onEdit: (id: string, title: string, artist: string, link?: string) => void;
  onDelete: (id: string) => void;
  onStartPresentation: () => void;
  onReset: () => void;
  phase: string;
}

export const SongList = ({ songs, onEdit, onDelete, onStartPresentation, onReset, phase }: SongListProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editArtist, setEditArtist] = useState('');
  const [editLink, setEditLink] = useState('');

  const handleEditClick = (song: Song) => {
    setEditingId(song.id);
    setEditTitle(song.title);
    setEditArtist(song.artist);
    setEditLink(song.link || '');
  };

  const handleSaveEdit = () => {
    if (editingId && editTitle.trim() && editArtist.trim()) {
      onEdit(editingId, editTitle.trim(), editArtist.trim(), editLink.trim() || undefined);
      setEditingId(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleDeleteClick = (song: Song) => {
    if (confirm(`Song "${song.title}" wirklich löschen?`)) {
      onDelete(song.id);
    }
  };

  const canStartPresentation = songs.length > 0 && phase === 'submission';

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Song-Verwaltung</h2>
            <p className="text-gray-600">
              {songs.length} {songs.length === 1 ? 'Song' : 'Songs'} eingereicht
            </p>
          </div>
          <div className="flex gap-3">
            {phase === 'submission' && (
              <button
                onClick={onStartPresentation}
                disabled={!canStartPresentation}
                className={`btn-primary ${!canStartPresentation ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Präsentation starten
              </button>
            )}
            {phase !== 'submission' && (
              <button onClick={onReset} className="btn-secondary">
                Session zurücksetzen
              </button>
            )}
          </div>
        </div>

        {songs.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎵</div>
            <p className="text-lg text-gray-600">Noch keine Songs eingereicht</p>
            <p className="text-sm text-gray-500 mt-2">Warte auf Song-Einreichungen von den Schüler:innen</p>
          </div>
        ) : (
          <div className="space-y-3">
            {songs.map((song, index) => (
              <motion.div
                key={song.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-primary-300 transition-colors"
              >
                {editingId === song.id ? (
                  // Edit Mode
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editTitle}
                      onChange={e => setEditTitle(e.target.value)}
                      className="input-field text-sm"
                      placeholder="Titel"
                    />
                    <input
                      type="text"
                      value={editArtist}
                      onChange={e => setEditArtist(e.target.value)}
                      className="input-field text-sm"
                      placeholder="Interpret:in"
                    />
                    <input
                      type="url"
                      value={editLink}
                      onChange={e => setEditLink(e.target.value)}
                      className="input-field text-sm"
                      placeholder="Link (optional)"
                    />
                    <div className="flex gap-2">
                      <button onClick={handleSaveEdit} className="btn-primary text-sm px-4 py-2">
                        Speichern
                      </button>
                      <button onClick={handleCancelEdit} className="btn-secondary text-sm px-4 py-2">
                        Abbrechen
                      </button>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800">{song.title}</h3>
                      <p className="text-sm text-gray-600">{song.artist}</p>
                      {song.link && (
                        <a
                          href={song.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary-600 hover:underline"
                        >
                          🔗 Link
                        </a>
                      )}
                      {song.averageScore !== undefined && (
                        <p className="text-sm font-semibold text-green-600 mt-1">
                          Ø {song.averageScore.toFixed(2)} Punkte ({song.totalVotes} Votes)
                        </p>
                      )}
                    </div>
                    {phase === 'submission' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditClick(song)}
                          className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                        >
                          Bearbeiten
                        </button>
                        <button
                          onClick={() => handleDeleteClick(song)}
                          className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                        >
                          Löschen
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
