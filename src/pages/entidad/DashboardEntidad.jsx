import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'

// Componente para mostrar Novedades en Entidad
const NovedadesEntidad = () => {
  const [novedades, setNovedades] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNovedades()
  }, [])

  const fetchNovedades = async () => {
    try {
      const { data, error } = await supabase
        .from('novedades')
        .select('*')
        .eq('activa', true)
        .order('created_at', { ascending: false })
        .limit(5)

      if (error) throw error
      setNovedades(data || [])
    } catch (error) {
      console.error('Error fetching novedades:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="space-y-3">
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">📋 Novedades</h2>
        <span className="text-gray-500 text-sm">Noticias importantes</span>
      </div>
      
      {novedades.length === 0 ? (
        <p className="text-gray-600 text-center py-4">No hay novedades recientes</p>
      ) : (
        <div className="space-y-3">
          {novedades.map(novedad => (
            <div key={novedad.id} className={`p-4 rounded-lg border-l-4 ${
              novedad.tipo === 'ALERTA' ? 'bg-red-50 border-red-500' :
              novedad.tipo === 'EVENTO' ? 'bg-green-50 border-green-500' :
              'bg-blue-50 border-blue-500'
            }`}>
              <div className="flex items-center space-x-2 mb-1">
                <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                  novedad.tipo === 'ALERTA' ? 'bg-red-100 text-red-800' :
                  novedad.tipo === 'EVENTO' ? 'bg-green-100 text-green-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {novedad.tipo}
                </span>
              </div>
              <h3 className="font-medium text-gray-800">{novedad.titulo}</h3>
              <p className="text-gray-600 text-sm mt-1">{novedad.contenido}</p>
              <p className="text-gray-500 text-xs mt-2">
                {new Date(novedad.created_at).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const DashboardEntidad = () => {
  const { userProfile } = useAuth()

  const getSectorLabel = (tipo) => {
    const labels = {
      'SALUD': 'Salud',
      'EDUCACION': 'Educación',
      'LEGAL': 'Asesoría Legal',
      'VIVIENDA': 'Vivienda',
      'EMPLEO': 'Empleo',
      'ALIMENTACION': 'Alimentación',
      'OTROS': 'Otros Servicios'
    }
    return labels[tipo] || tipo
  }

  const getSectorIcon = (tipo) => {
    const icons = {
      'SALUD': '🏥',
      'EDUCACION': '📚',
      'LEGAL': '⚖️',
      'VIVIENDA': '🏠',
      'EMPLEO': '💼',
      'ALIMENTACION': '🍽️',
      'OTROS': '📋'
    }
    return icons[tipo] || '📋'
  }

  const getSectorColor = (tipo) => {
    const colors = {
      'SALUD': 'from-red-500 to-red-600',
      'EDUCACION': 'from-blue-500 to-blue-600',
      'LEGAL': 'from-gray-500 to-gray-600',
      'VIVIENDA': 'from-orange-500 to-orange-600',
      'EMPLEO': 'from-green-500 to-green-600',
      'ALIMENTACION': 'from-yellow-500 to-yellow-600',
      'OTROS': 'from-purple-500 to-purple-600'
    }
    return colors[tipo] || 'from-gray-500 to-gray-600'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      {/* Sector Banner */}
      {userProfile?.tipo && (
        <div className={`bg-gradient-to-r ${getSectorColor(userProfile.tipo)} text-white py-6 shadow-lg`}>
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-4xl">
                {getSectorIcon(userProfile.tipo)}
              </div>
              <div>
                <p className="text-white/80 text-sm uppercase tracking-wide">Tu sector</p>
                <h2 className="text-2xl font-bold">{getSectorLabel(userProfile.tipo)}</h2>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-gradient-to-r from-green-600 via-green-500 to-teal-600 text-white py-8 shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl font-bold">
            Panel de {userProfile?.nombre || 'Entidad'}
          </h1>
          <p className="text-green-100 mt-2">
            Gestiona tus servicios y emergencias
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Link to="emergencias" className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">🚨</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Emergencias</h3>
                <p className="text-gray-600 text-sm">Atender solicitudes</p>
              </div>
            </div>
          </Link>

          <Link to="servicios" className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">🛠️</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Servicios</h3>
                <p className="text-gray-600 text-sm">Gestionar servicios</p>
              </div>
            </div>
          </Link>

          <Link to="evaluaciones" className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">⭐</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Evaluaciones</h3>
                <p className="text-gray-600 text-sm">Ver calificaciones</p>
              </div>
            </div>
          </Link>

          <Link to="/perfil" className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">👤</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Perfil</h3>
                <p className="text-gray-600 text-sm">Editar información</p>
              </div>
            </div>
          </Link>

          <Link to="novedades" className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">📋</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Novedades</h3>
                <p className="text-gray-600 text-sm">Ver noticias</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Novedades Section */}
        <div className="mb-8">
          <NovedadesEntidad />
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Estadísticas Rápidas</h2>
          <div className="grid grid-cols-3 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-600 text-sm">Emergencias Pendientes</p>
              <p className="text-3xl font-bold text-gray-800" id="pending-count">-</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-600 text-sm">Servicios Activos</p>
              <p className="text-3xl font-bold text-gray-800" id="services-count">-</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-600 text-sm">Calificación Promedio</p>
              <p className="text-3xl font-bold text-gray-800" id="rating-avg">-</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const EmergenciasEntidad = () => {
  const { userProfile, user } = useAuth()
  const [emergencias, setEmergencias] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedEmergencia, setSelectedEmergencia] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [seguimiento, setSeguimiento] = useState('')

  useEffect(() => {
    fetchEmergencias()
  }, [])

  const fetchEmergencias = async () => {
    try {
      // Get entity ID from entidades table
      const { data: entidadData, error: entidadError } = await supabase
        .from('entidades')
        .select('id')
        .eq('usuario_id', user.id)
        .single()

      if (entidadError && entidadError.code !== 'PGRST116') {
        throw entidadError
      }

      if (entidadData) {
        // Fetch assigned emergencias
        const { data, error } = await supabase
          .from('emergencias')
          .select('*, usuarios(nombre, email)')
          .eq('entidad_id', entidadData.id)
          .eq('estado', 'ASIGNADA')
          .order('created_at', { ascending: false })

        if (error) throw error
        setEmergencias(data || [])
      } else {
        setEmergencias([])
      }
    } catch (error) {
      console.error('Error fetching emergencias:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAtender = async (id) => {
    try {
      const { error } = await supabase
        .from('emergencias')
        .update({ 
          estado: 'ATENDIDA',
          fecha_atencion: new Date().toISOString()
        })
        .eq('id', id)

      if (error) throw error

      toast.success('Emergencia marcada como atendida')
      fetchEmergencias()
    } catch (error) {
      toast.error(error.message || 'Error al atender emergencia')
    }
  }

  const handleActualizarSeguimiento = async (e) => {
    e.preventDefault()
    try {
      const { error } = await supabase
        .from('emergencias')
        .update({ seguimiento })
        .eq('id', selectedEmergencia.id)

      if (error) throw error

      toast.success('Seguimiento actualizado')
      setShowDetailModal(false)
      setSelectedEmergencia(null)
      setSeguimiento('')
      fetchEmergencias()
    } catch (error) {
      toast.error(error.message || 'Error al actualizar seguimiento')
    }
  }

  const openDetailModal = (emergencia) => {
    setSelectedEmergencia(emergencia)
    setSeguimiento(emergencia.seguimiento || '')
    setShowDetailModal(true)
  }

  const getEstadoColor = (estado) => {
    const colors = {
      'PENDIENTE': 'bg-yellow-100 text-yellow-800',
      'ASIGNADA': 'bg-blue-100 text-blue-800',
      'ATENDIDA': 'bg-green-100 text-green-800',
      'CANCELADA': 'bg-red-100 text-red-800'
    }
    return colors[estado] || 'bg-gray-100 text-gray-800'
  }

  const getPrioridadColor = (prioridad) => {
    const colors = {
      'BAJA': 'bg-gray-100 text-gray-800',
      'NORMAL': 'bg-blue-100 text-blue-800',
      'ALTA': 'bg-orange-100 text-orange-800',
      'URGENTE': 'bg-red-100 text-red-800'
    }
    return colors[prioridad] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-8">Emergencias Asignadas</h1>
        
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-md p-4">
            <p className="text-gray-600 text-sm">Asignadas</p>
            <p className="text-2xl font-bold text-blue-600">{emergencias.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4">
            <p className="text-gray-600 text-sm">Urgentes</p>
            <p className="text-2xl font-bold text-red-600">
              {emergencias.filter(e => e.prioridad === 'URGENTE').length}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4">
            <p className="text-gray-600 text-sm">Con Seguimiento</p>
            <p className="text-2xl font-bold text-green-600">
              {emergencias.filter(e => e.seguimiento).length}
            </p>
          </div>
        </div>

        {emergencias.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <p className="text-gray-600">No tienes emergencias asignadas.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {emergencias.map(emergencia => (
              <div key={emergencia.id} className="bg-white rounded-xl shadow-md p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="bg-red-100 text-red-800 text-sm font-medium px-2 py-0.5 rounded">
                        {emergencia.tipo}
                      </span>
                      <span className={`text-sm font-medium px-2 py-0.5 rounded ${getEstadoColor(emergencia.estado)}`}>
                        {emergencia.estado}
                      </span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded ${getPrioridadColor(emergencia.prioridad)}`}>
                        {emergencia.prioridad}
                      </span>
                    </div>
                    <p className="text-gray-800">{emergencia.descripcion}</p>
                    {emergencia.direccion && (
                      <p className="text-gray-600 text-sm mt-2">📍 {emergencia.direccion}</p>
                    )}
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">Solicitante:</p>
                      <p className="font-medium">{emergencia.usuarios?.nombre}</p>
                      <p className="text-sm text-gray-500">{emergencia.usuarios?.email}</p>
                    </div>
                    {emergencia.seguimiento && (
                      <div className="mt-3 p-3 bg-yellow-50 rounded-lg">
                        <p className="text-sm text-gray-600">Seguimiento:</p>
                        <p className="text-gray-800">{emergencia.seguimiento}</p>
                      </div>
                    )}
                    <p className="text-gray-500 text-sm mt-2">
                      Asignada: {new Date(emergencia.fecha_asignacion || emergencia.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => openDetailModal(emergencia)}
                      className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 text-sm"
                    >
                      Seguimiento
                    </button>
                    <button
                      onClick={() => handleAtender(emergencia.id)}
                      className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 text-sm"
                    >
                      Atendida
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedEmergencia && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Actualizar Seguimiento</h2>
            <div className="mb-4">
              <p className="text-sm text-gray-600">Emergencia:</p>
              <p className="font-medium">{selectedEmergencia.descripcion}</p>
            </div>
            <form onSubmit={handleActualizarSeguimiento} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Seguimiento / Notas</label>
                <textarea
                  value={seguimiento}
                  onChange={(e) => setSeguimiento(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="Agregar notas de seguimiento..."
                />
              </div>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setShowDetailModal(false)}
                  className="flex-1 bg-gray-300 text-gray-800 py-2 rounded-lg hover:bg-gray-400"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

const ServiciosEntidad = () => {
  const { userProfile, user } = useAuth()
  const [servicios, setServicios] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [newServicio, setNewServicio] = useState({
    nombre: '',
    descripcion: '',
    tipo: 'SALUD'
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchServicios()
  }, [])

  const fetchServicios = async () => {
    try {
      const { data, error } = await supabase
        .from('servicios_entidad')
        .select('*')
        .eq('entidad_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setServicios(data || [])
    } catch (error) {
      console.error('Error fetching servicios:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const { error } = await supabase
        .from('servicios_entidad')
        .insert([{
          entidad_id: user.id,
          nombre: newServicio.nombre,
          descripcion: newServicio.descripcion,
          tipo: newServicio.tipo,
          habilitado: true
        }])

      if (error) throw error

      toast.success('Servicio agregado exitosamente')
      setShowForm(false)
      setNewServicio({ nombre: '', descripcion: '', tipo: 'SALUD' })
      fetchServicios()
    } catch (error) {
      toast.error(error.message || 'Error al agregar servicio')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Mis Servicios</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            {showForm ? 'Cancelar' : '+ Agregar Servicio'}
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <h2 className="text-lg font-semibold mb-4">Nuevo Servicio</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
                <input
                  type="text"
                  value={newServicio.nombre}
                  onChange={(e) => setNewServicio({ ...newServicio, nombre: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
                <select
                  value={newServicio.tipo}
                  onChange={(e) => setNewServicio({ ...newServicio, tipo: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="SALUD">Salud</option>
                  <option value="EDUCACION">Educación</option>
                  <option value="LEGAL">Asesoría Legal</option>
                  <option value="VIVIENDA">Vivienda</option>
                  <option value="EMPLEO">Empleo</option>
                  <option value="ALIMENTACION">Alimentación</option>
                  <option value="OTROS">Otros</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
                <textarea
                  value={newServicio.descripcion}
                  onChange={(e) => setNewServicio({ ...newServicio, descripcion: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {submitting ? 'Guardando...' : 'Guardar Servicio'}
              </button>
            </form>
          </div>
        )}

        {servicios.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <p className="text-gray-600">No tienes servicios agregados.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {servicios.map(servicio => (
              <div key={servicio.id} className="bg-white rounded-xl shadow-md p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-800">{servicio.nombre}</h3>
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded">
                    {servicio.tipo}
                  </span>
                </div>
                <p className="text-gray-600">{servicio.descripcion}</p>
                <p className="text-gray-500 text-sm mt-2">
                  {servicio.habilitado ? '✅ Activo' : '❌ Inhabilitado'}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const EvaluacionesEntidad = () => {
  const { user } = useAuth()
  const [calificaciones, setCalificaciones] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCalificaciones()
  }, [])

  const fetchCalificaciones = async () => {
    try {
      const { data, error } = await supabase
        .from('calificaciones')
        .select('*, usuarios(nombre), entidades(nombre)')
        .eq('entidad_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setCalificaciones(data || [])
    } catch (error) {
      console.error('Error fetching calificaciones:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  const promedio = calificaciones.length > 0
    ? (calificaciones.reduce((acc, c) => acc + c.calificacion, 0) / calificaciones.length).toFixed(1)
    : 'N/A'

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Calificación Promedio</h2>
          <p className="text-4xl font-bold text-yellow-500">{promedio} ⭐</p>
          <p className="text-gray-600">{calificaciones.length} evaluaciones</p>
        </div>

        <h1 className="text-2xl font-bold text-gray-800 mb-8">Evaluaciones Recibidas</h1>

        {calificaciones.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <p className="text-gray-600">No hay evaluaciones todavía.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {calificaciones.map(calif => (
              <div key={calif.id} className="bg-white rounded-xl shadow-md p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="font-medium text-gray-800">{calif.usuarios?.nombre}</span>
                      <span className="text-yellow-500">{'★'.repeat(calif.calificacion)}</span>
                    </div>
                    <p className="text-gray-600">{calif.comentario}</p>
                    <p className="text-gray-500 text-sm mt-2">
                      {new Date(calif.created_at).toLocaleDateString()}
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

// Componente para mostrar Novedades (todas)
const NovedadesPage = () => {
  const [novedades, setNovedades] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNovedades()
  }, [])

  const fetchNovedades = async () => {
    try {
      const { data, error } = await supabase
        .from('novedades')
        .select('*')
        .eq('activa', true)
        .order('created_at', { ascending: false })

      if (error) throw error
      setNovedades(data || [])
    } catch (error) {
      console.error('Error fetching novedades:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">📋 Todas las Novedades</h1>
        
        {novedades.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <p className="text-gray-600">No hay novedades disponibles</p>
          </div>
        ) : (
          <div className="space-y-4">
            {novedades.map(novedad => (
              <div key={novedad.id} className={`bg-white rounded-xl shadow-md p-6 border-l-4 ${
                novedad.tipo === 'ALERTA' ? 'border-red-500' :
                novedad.tipo === 'EVENTO' ? 'border-green-500' :
                'border-blue-500'
              }`}>
                <div className="flex items-center space-x-2 mb-3">
                  <span className={`text-xs font-medium px-3 py-1 rounded-full ${
                    novedad.tipo === 'ALERTA' ? 'bg-red-100 text-red-800' :
                    novedad.tipo === 'EVENTO' ? 'bg-green-100 text-green-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {novedad.tipo}
                  </span>
                  <span className="text-gray-500 text-sm">
                    {new Date(novedad.created_at).toLocaleDateString()}
                  </span>
                </div>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">{novedad.titulo}</h2>
                <p className="text-gray-600">{novedad.contenido}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export { DashboardEntidad as default, EmergenciasEntidad, ServiciosEntidad, EvaluacionesEntidad, NovedadesEntidad }
