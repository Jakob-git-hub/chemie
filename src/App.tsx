import { Routes, Route } from 'react-router-dom';
import Layout from '@/components/Layout';
import Home from '@/routes/index';
import Molecules from '@/routes/molecules';
import Quiz from '@/routes/quiz';
import Thermo from '@/routes/thermo';
import JSmol from '@/routes/jsmol';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/molecules" element={<Molecules />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/thermo" element={<Thermo />} />
        <Route path="/jsmol" element={<JSmol />} />
      </Route>
    </Routes>
  );
}