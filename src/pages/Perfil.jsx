import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useState, useEffect } from 'react'

const Perfil = () => {
  const { user, userProfile } = useAuth()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (userProfile) {
      setLoading(false)
    } else if (user) {
      // Give time for profile to load
      const timer = setTimeout(() => setLoading(false), 2000)
      return () => clearTimeout(timer)
    } else {
      setLoading(false)
    }
  }, [user, userProfile])

  const getRoleLabel = (tipo) => {
    const labels = {
      'MIGRANTE': 'Migrante',
      'ENTIDAD': 'Entidad de Servicio',
      'GERENCIA': 'Gerencia'
    }
    return labels[tipo] || tipo || 'Sin rol'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando perfil...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-32"></div>
          <div className="px-8 pb-8">
            <div className="relative -mt-16 mb-6">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center border-4 border-white mx-auto shadow-lg">
                <span className="text-4xl font-bold text-white">
                  {userProfile?.nombre?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || '?'}
                </span>
              </div>
            </div>

            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-800">
                {userProfile?.nombre || 'Usuario'}
              </h1>
              <p className="text-gray-600">{user?.email}</p>
              <span className="inline-block mt-2 bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full uppercase">
                {getRoleLabel(userProfile?.tipo)}
              </span>
            </div>

            <div className="border-t pt-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 uppercase">Información de la Cuenta</h2>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Correo</span>
                  <span className="font-medium">{user?.email}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">ID de Usuario</span>
                  <span className="font-medium text-sm">{user?.id}</span>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4 uppercase">
                Panel de: {getRoleLabel(userProfile?.tipo)}
              </h2>
              <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                <p className="text-sm text-blue-700 mb-4">
                  {userProfile?.tipo === 'MIGRANTE' && 'Accede a tu panel de migrante para gestionar emergencias y más.'}
                  {userProfile?.tipo === 'ENTIDAD' && 'Accede al panel de tu entidad para gestionar servicios y emergencias.'}
                  {userProfile?.tipo === 'GERENCIA' && 'Accede para administrar la plataforma.'}
                  {!userProfile?.tipo && 'Tu perfil no tiene un rol asignado. Contacta a soporte.'}
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {userProfile?.tipo === 'MIGRANTE' && (
                    <>
                      <Link to="/migrante/emergencias" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">Emergencias</Link>
                      <Link to="/evaluanos" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">Experiencia</Link>
                      <Link to="/migrante/novedades" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">Novedades</Link>
                    </>
                  )}
                  {userProfile?.tipo === 'ENTIDAD' && (
                    <>
                      <Link to="/entidad/emergencias" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">Emergencias</Link>
                      <Link to="/entidad/servicios" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">Servicios</Link>
                      <Link to="/entidad/evaluaciones" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">Evaluaciones</Link>
                    </>
                  )}
                  {userProfile?.tipo === 'GERENCIA' && (
                    <Link to="/gerencia" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">Panel de Gerencia</Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Perfil
