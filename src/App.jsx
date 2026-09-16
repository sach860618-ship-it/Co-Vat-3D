import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HeritageTour from './pages/HeritageTour';
import DemoMovement from './pages/DemoMovement';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HeritageTour />} />
        <Route path="/heritage-tour" element={<HeritageTour />} />
        <Route path="/heritage-tour/:id" element={<DemoMovement />} />
        <Route path="/demo-movement" element={<DemoMovement />} />
        <Route path="/demo-movement/:id" element={<DemoMovement />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
