import { useState, useEffect } from 'react'
import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'

const DashboardMigrante = () => {
  const { userProfile } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-blue-600 text-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl font-bold">
            Bienvenido, {userProfile?.nombre}
          </h1>
          <p className="text-blue-100 mt-2">
            Panel de Migrante - Gestiona tus emergencias y servicios
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Link to="emergencias" className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">🚨</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Mis Emergencias</h3>
                <p className="text-gray-600 text-sm">Reportar y gestionar</p>
              </div>
            </div>
          </Link>

          <Link to="/entidades" className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">🏢</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Ver Entidades</h3>
                <p className="text-gray-600 text-sm">Explorar servicios</p>
              </div>
            </div>
          </Link>

          <Link to="/evaluanos" className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">⭐</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Evaluar</h3>
                <p className="text-gray-600 text-sm">Calificar servicios</p>
              </div>
            </div>
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Acciones Rápidas</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Link
              to="emergencias"
              className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100"
            >
              <span className="text-2xl mr-4">📝</span>
              <div>
                <p className="font-medium text-gray-800">Reportar Nueva Emergencia</p>
                <p className="text-sm text-gray-600">Solicita ayuda a las entidades</p>
              </div>
            </Link>
            <Link
              to="/perfil"
              className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100"
            >
              <span className="text-2xl mr-4">👤</span>
              <div>
                <p className="font-medium text-gray-800">Mi Perfil</p>
                <p className="text-sm text-gray-600">Ver y editar información</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

const EmergenciasMigrante = () => {
  const { user } = useAuth()
  const [emergencias, setEmergencias] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [newEmergencia, setNewEmergencia] = useState({
    tipo: 'SALUD',
    descripcion: '',
    direccion: ''
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchEmergencias()
  }, [])

  const fetchEmergencias = async () => {
    try {
      const { data, error } = await supabase
        .from('emergencias')
        .select('*, usuarios(nombre)')
        .eq('usuario_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setEmergencias(data || [])
    } catch (error) {
      console.error('Error fetching emergencias:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const { error } = await supabase
        .from('emergencias')
        .insert([{
          usuario_id: user.id,
          tipo: newEmergencia.tipo,
          descripcion: newEmergencia.descripcion,
          direccion: newEmergencia.direccion,
          estado: 'PENDIENTE'
        }])

      if (error) throw error

      toast.success('Emergencia reportada exitosamente')
      setShowForm(false)
      setNewEmergencia({ tipo: 'SALUD', descripcion: '', direccion: '' })
      fetchEmergencias()
    } catch (error) {
      toast.error(error.message || 'Error al reportar emergencia')
    } finally {
      setSubmitting(false)
    }
  }

  const getEstadoColor = (estado) => {
    const colors = {
      'PENDIENTE': 'bg-yellow-100 text-yellow-800',
      'ATENDIDA': 'bg-green-100 text-green-800',
      'CANCELADA': 'bg-red-100 text-red-800'
    }
    return colors[estado] || 'bg-gray-100 text-gray-800'
  }

  const getTipoLabel = (tipo) => {
    const labels = {
      'SALUD': 'Salud',
      'LEGAL': 'Asesoría Legal',
      'VIVIENDA': 'Vivienda',
      'ALIMENTACION': 'Alimentación',
      'EMPLEO': 'Empleo',
      'OTROS': 'Otros'
    }
    return labels[tipo] || tipo
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Mis Emergencias</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            {showForm ? 'Cancelar' : '+ Reportar Emergencia'}
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <h2 className="text-lg font-semibold mb-4">Nueva Emergencia</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
                <select
                  value={newEmergencia.tipo}
                  onChange={(e) => setNewEmergencia({ ...newEmergencia, tipo: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="SALUD">Salud</option>
                  <option value="LEGAL">Asesoría Legal</option>
                  <option value="VIVIENDA">Vivienda</option>
                  <option value="ALIMENTACION">Alimentación</option>
                  <option value="EMPLEO">Empleo</option>
                  <option value="OTROS">Otros</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
                <textarea
                  value={newEmergencia.descripcion}
                  onChange={(e) => setNewEmergencia({ ...newEmergencia, descripcion: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Dirección</label>
                <input
                  type="text"
                  value={newEmergencia.direccion}
                  onChange={(e) => setNewEmergencia({ ...newEmergencia, direccion: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {submitting ? 'Enviando...' : 'Reportar Emergencia'}
              </button>
            </form>
          </div>
        )}

        {emergencias.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <p className="text-gray-600">No tienes emergencias reportadas.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {emergencias.map(emergencia => (
              <div key={emergencia.id} className="bg-white rounded-xl shadow-md p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2 py-0.5 rounded">
                        {getTipoLabel(emergencia.tipo)}
                      </span>
                      <span className={`text-sm font-medium px-2 py-0.5 rounded ${getEstadoColor(emergencia.estado)}`}>
                        {emergencia.estado}
                      </span>
                    </div>
                    <p className="text-gray-800">{emergencia.descripcion}</p>
                    {emergencia.direccion && (
                      <p className="text-gray-600 text-sm mt-2">📍 {emergencia.direccion}</p>
                    )}
                    <p className="text-gray-500 text-sm mt-2">
                      Reportada el {new Date(emergencia.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const MigranteRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<DashboardMigrante />} />
      <Route path="emergencias" element={<EmergenciasMigrante />} />
    </Routes>
  )
}

export default MigranteRoutes
