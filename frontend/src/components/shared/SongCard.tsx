import { motion } from 'framer-motion';
import type { Song } from '../../types';

interface SongCardProps {
  song: Song;
  showScore?: boolean;
}

export const SongCard = ({ song, showScore = false }: SongCardProps) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="card-hover"
    >
      <h3 className="font-bold text-lg text-gray-800">{song.title}</h3>
      <p className="text-gray-600">{song.artist}</p>

      {song.link && (
        <a
          href={song.link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-primary-600 hover:underline mt-2 inline-block"
        >
          🔗 Link
        </a>
      )}

      {showScore && song.averageScore !== undefined && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <p className="text-sm text-gray-600">Durchschnitt:</p>
          <p className="text-2xl font-bold text-primary-600">{song.averageScore.toFixed(2)}</p>
          <p className="text-xs text-gray-500">{song.totalVotes} Votes</p>
        </div>
      )}
    </motion.div>
  );
};
