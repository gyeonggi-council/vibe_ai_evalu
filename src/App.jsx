import { Routes, Route } from 'react-router-dom';
import Intro from './pages/Intro';
import Survey from './pages/Survey';
import Quiz from './pages/Quiz';
import Result from './pages/Result';
import ShareResult from './pages/ShareResult';
import Admin from './pages/Admin';
import ThemeToggle from './components/ThemeToggle';

export default function App() {
  return (
    <div className="min-h-screen app-bg">
      <ThemeToggle />
      <Routes>
        <Route path="/" element={<Intro />} />
        <Route path="/survey" element={<Survey />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/result" element={<Result />} />
        <Route path="/result/:code" element={<ShareResult />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </div>
  );
}
