import { Routes, Route } from 'react-router-dom';
import Layout from '@/components/Layout';
import Home from '@/routes/index';
import Molecules from '@/routes/molecules';
import Quiz from '@/routes/quiz';
import Calculator from '@/routes/calculator';
import PeriodicTable from '@/routes/periodic-table';
import ErrorBoundary from '@/components/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/periodic-table" element={<PeriodicTable />} />
          <Route path="/molecules" element={<Molecules />} />
          <Route path="/calculator" element={<Calculator />} />
          <Route path="/quiz" element={<Quiz />} />
        </Route>
      </Routes>
    </ErrorBoundary>
  );
}
