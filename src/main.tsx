import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

console.log('Iniciando aplicación');
const rootElement = document.getElementById('root');
console.log('Elemento root encontrado:', rootElement);

createRoot(rootElement!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
