import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import Nav from './components/Nav'
import Footer from './components/Footer'
import SimpleTool from './pages/SimpleTool'
import FullPlanner from './pages/FullPlanner'
import Resources from './pages/Resources'

export default function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="min-h-screen flex flex-col bg-cream">
        <Nav />
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<SimpleTool />} />
            <Route path="/planner" element={<FullPlanner />} />
            <Route path="/resources" element={<Resources />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  )
}
