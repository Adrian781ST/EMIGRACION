import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import VerEntidades from './pages/VerEntidades'
import Evaluanos from './pages/Evaluanos'
import Perfil from './pages/Perfil'
import DashboardMigrante from './pages/migrante/DashboardMigrante'
import DashboardEntidad from './pages/entidad/DashboardEntidad'
import DashboardGerencia from './pages/gerencia/DashboardGerencia'
import ProtectedRoute from './components/ProtectedRoute'

const AppRoutes = () => {
  const { userProfile, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/entidades" element={<VerEntidades />} />
        <Route path="/evaluanos" element={<Evaluanos />} />
        <Route path="/perfil" element={
          <ProtectedRoute>
            <Perfil />
          </ProtectedRoute>
        } />
        
        {/* Rutas Migrante */}
        <Route path="/migrante/*" element={
          <ProtectedRoute roles={['MIGRANTE']}>
            <DashboardMigrante />
          </ProtectedRoute>
        } />
        
        {/* Rutas Entidad */}
        <Route path="/entidad/*" element={
          <ProtectedRoute roles={['ENTIDAD']}>
            <DashboardEntidad />
          </ProtectedRoute>
        } />
        
        {/* Rutas Gerencia */}
        <Route path="/gerencia/*" element={
          <ProtectedRoute roles={['GERENCIA']}>
            <DashboardGerencia />
          </ProtectedRoute>
        } />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

const App = () => {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}

export default App
