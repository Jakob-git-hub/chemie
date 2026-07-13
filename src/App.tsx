import { Routes, Route } from 'react-router-dom';
import Layout from '@/components/Layout';
import Home from '@/routes/index';
import Molecules from '@/routes/molecules';
import Quiz from '@/routes/quiz';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/molecules" element={<Molecules />} />
        <Route path="/quiz" element={<Quiz />} />
      </Route>
    </Routes>
  );
}