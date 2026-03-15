import React from 'react'
import ReactDOM from 'react-dom/client'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import App from './App.jsx'
import './index.css'

// Register all Chart.js components globally
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

// Global Chart.js defaults
ChartJS.defaults.font.family = '"Plus Jakarta Sans", system-ui, sans-serif'
ChartJS.defaults.font.size = 12
ChartJS.defaults.color = '#5a5a58'
ChartJS.defaults.borderColor = 'rgba(0,0,0,0.06)'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
