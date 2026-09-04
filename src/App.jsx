import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HeritageTour from './pages/HeritageTour';
import HeritageTourDetail from './pages/HeritageTourDetail';

function App() {


  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HeritageTour />} />
        <Route path="/heritage-tour" element={<HeritageTour />} />
        <Route path="/heritage-tour/:id" element={<HeritageTourDetail />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
