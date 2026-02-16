import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { StudentView } from './pages/StudentView';
import { TeacherView } from './pages/TeacherView';
import { Home } from './pages/Home';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/student/:roomCode" element={<StudentView />} />
        <Route path="/teacher/create" element={<TeacherView />} />
        <Route path="/teacher/:roomCode" element={<TeacherView />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
