import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export const Home = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="eurovision-title mb-4">SSC</h1>
          <h2 className="text-3xl font-bold text-gray-700 mb-2">School Song Contest</h2>
          <p className="text-lg text-gray-600">Wähle deine Ansicht</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <Link to="/student" className="block">
              <div className="card-hover text-center h-full">
                <div className="text-8xl mb-6">🎤</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">Schüler:in</h3>
                <p className="text-gray-600 mb-4">Songs einreichen und abstimmen</p>
                <div className="btn-primary inline-block">Zur Schüler-Ansicht</div>
              </div>
            </Link>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
            <Link to="/teacher" className="block">
              <div className="card-hover text-center h-full">
                <div className="text-8xl mb-6">👨‍🏫</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">Lehrer:in</h3>
                <p className="text-gray-600 mb-4">Verwaltung und Präsentation</p>
                <div className="btn-gold inline-block">Zur Lehrer-Ansicht</div>
              </div>
            </Link>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-12 text-gray-500 text-sm"
        >
          <p>Entwickelt für den Eurovision-inspirierten Song Contest</p>
        </motion.div>
      </div>
    </div>
  );
};
