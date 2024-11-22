import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import './styles/global.css'
import './styles/components.css'
import './index.css'
import App from './App.tsx'

console.log('Iniciando aplicación')
const rootElement = document.getElementById('root')
console.log('Elemento root encontrado:', rootElement)

createRoot(rootElement!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
