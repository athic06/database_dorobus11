import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { StoreProvider, useStore } from './store.jsx'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import MyRoom from './pages/MyRoom.jsx'
import World from './pages/World.jsx'
import Cave from './pages/Cave.jsx'
import Plaza from './pages/Plaza.jsx'
import Play from './pages/Play.jsx'
import Visit from './pages/Visit.jsx'
import PortraitGallery from './pages/PortraitGallery.jsx'
import CharacterGallery from './pages/CharacterGallery.jsx'
import MissionPreview from './pages/MissionPreview.jsx'
import Courses from './pages/Courses.jsx'
import './styles.css'

function RequireAuth({ children }) {
  const { user } = useStore()
  return user ? children : <Navigate to="/login" replace />
}

function GuestOnly({ children }) {
  const { user } = useStore()
  return user ? <Navigate to="/" replace /> : children
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <StoreProvider>
      <HashRouter>
        <Routes>
          <Route path="/login" element={<GuestOnly><Login /></GuestOnly>} />
          <Route path="/" element={<RequireAuth><Dashboard /></RequireAuth>} />
          <Route path="/myroom" element={<RequireAuth><MyRoom /></RequireAuth>} />
          <Route path="/world" element={<RequireAuth><World /></RequireAuth>} />
          <Route path="/cave" element={<RequireAuth><Cave /></RequireAuth>} />
          <Route path="/plaza" element={<RequireAuth><Plaza /></RequireAuth>} />
          <Route path="/courses" element={<RequireAuth><Courses /></RequireAuth>} />
          <Route path="/play" element={<RequireAuth><Play /></RequireAuth>} />
          <Route path="/visit/:id" element={<RequireAuth><Visit /></RequireAuth>} />
          <Route path="/dev/portraits" element={import.meta.env.DEV ? <PortraitGallery /> : <Navigate to="/" replace />} />
          <Route path="/dev/characters" element={<CharacterGallery />} />
          <Route path="/dev/mission/:name" element={import.meta.env.DEV ? <RequireAuth><MissionPreview /></RequireAuth> : <Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </StoreProvider>
  </React.StrictMode>,
)
