import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import VerEntidades from './pages/VerEntidades'
import Evaluanos from './pages/Evaluanos'
import Perfil from './pages/Perfil'
import DashboardGerencia from './pages/gerencia/DashboardGerencia'
import ProtectedRoute from './components/ProtectedRoute'

// Import Migrante components
import DashboardMigrante from './pages/migrante/DashboardMigrante'
import { EmergenciasMigrante, NovedadesPage } from './pages/migrante/DashboardMigrante'

// Import Entidad components
import DashboardEntidad from './pages/entidad/DashboardEntidad'
import { EmergenciasEntidad, ServiciosEntidad, EvaluacionesEntidad, NovedadesEntidad } from './pages/entidad/DashboardEntidad'

const AppRoutes = () => {
  const { userProfile, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
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
        
        {/* Rutas Migrante - Directas */}
        <Route path="/migrante/emergencias" element={
          <ProtectedRoute roles={['MIGRANTE']}>
            <EmergenciasMigrante />
          </ProtectedRoute>
        } />
        <Route path="/migrante/novedades" element={
          <ProtectedRoute roles={['MIGRANTE']}>
            <NovedadesPage />
          </ProtectedRoute>
        } />
        
        {/* Rutas Entidad */}
        <Route path="/entidad" element={
          <ProtectedRoute roles={['ENTIDAD']}>
            <DashboardEntidad />
          </ProtectedRoute>
        } />
        <Route path="/entidad/dashboard" element={
          <ProtectedRoute roles={['ENTIDAD']}>
            <Navigate to="/entidad" replace />
          </ProtectedRoute>
        } />
        <Route path="/entidad/emergencias" element={
          <ProtectedRoute roles={['ENTIDAD']}>
            <Navigate to="/entidad" replace />
          </ProtectedRoute>
        } />
        <Route path="/entidad/servicios" element={
          <ProtectedRoute roles={['ENTIDAD']}>
            <Navigate to="/entidad" replace />
          </ProtectedRoute>
        } />
        <Route path="/entidad/evaluaciones" element={
          <ProtectedRoute roles={['ENTIDAD']}>
            <EvaluacionesEntidad />
          </ProtectedRoute>
        } />
        <Route path="/entidad/novedades" element={
          <ProtectedRoute roles={['ENTIDAD']}>
            <NovedadesEntidad />
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
