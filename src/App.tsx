import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Board from './components/Board/Board';
import './styles/Home.css';
import './styles/Board.css';
import './App.css';

function App() {
  console.log('Renderizando App');
  return (
    <BrowserRouter>
      <div className="app-container">
        <Routes>
          <Route index element={<Home />} />
          <Route path="/" element={<Home />} />
          <Route path="/play">
            <Route path="computer" element={<Board />} />
            <Route path="online" element={<Board />} />
            <Route path="friend" element={<Board />} />
            <Route path="puzzle" element={<Board isPuzzle={true} />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;