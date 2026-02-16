import { useState, useEffect } from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'

const DashboardGerencia = () => {
  const { userProfile } = useAuth()
  const [stats, setStats] = useState({
    totalUsuarios: 0,
    totalEntidades: 0,
    emergenciasActivas: 0,
    totalEvaluaciones: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      // Total usuarios
      const { count: usuariosCount } = await supabase
        .from('usuarios')
        .select('*', { count: 'exact', head: true })

      // Total entidades
      const { count: entidadesCount } = await supabase
        .from('entidades')
        .select('*', { count: 'exact', head: true })

      // Emergencias activas (no canceladas ni atendidas)
      const { count: emergenciasCount } = await supabase
        .from('emergencias')
        .select('*', { count: 'exact', head: true })
        .in('estado', ['PENDIENTE', 'ASIGNADA'])

      // Total evaluaciones
      const { count: evaluacionesCount } = await supabase
        .from('calificaciones')
        .select('*', { count: 'exact', head: true })

      setStats({
        totalUsuarios: usuariosCount || 0,
        totalEntidades: entidadesCount || 0,
        emergenciasActivas: emergenciasCount || 0,
        totalEvaluaciones: evaluacionesCount || 0
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <div className="bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 text-white py-8 shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl font-bold uppercase tracking-wide">
            PANEL DE GERENCIA
          </h1>
          <p className="text-purple-100 mt-2">
            Administración y supervisión de la plataforma
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Link to="usuarios" className="bg-white rounded-xl shadow-md p-4 sm:p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-xl sm:text-2xl">👥</span>
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-gray-800 text-sm sm:text-base truncate uppercase tracking-wide">Usuarios</h3>
                <p className="text-gray-600 text-xs sm:text-sm truncate">Gestionar usuarios</p>
              </div>
            </div>
          </Link>

          <Link to="emergencias" className="bg-white rounded-xl shadow-md p-4 sm:p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-xl sm:text-2xl">🚨</span>
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-gray-800 text-sm sm:text-base truncate uppercase tracking-wide">Emergencias</h3>
                <p className="text-gray-600 text-xs sm:text-sm truncate">Ver emergencias</p>
              </div>
            </div>
          </Link>

          <Link to="evaluaciones" className="bg-white rounded-xl shadow-md p-4 sm:p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-xl sm:text-2xl">⭐</span>
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-gray-800 text-sm sm:text-base truncate uppercase tracking-wide">Evaluaciones</h3>
                <p className="text-gray-600 text-xs sm:text-sm truncate">Ver calificaciones</p>
              </div>
            </div>
          </Link>

          <Link to="novedades" className="bg-white rounded-xl shadow-md p-4 sm:p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-xl sm:text-2xl">📋</span>
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-gray-800 text-sm sm:text-base truncate uppercase tracking-wide">Novedades</h3>
                <p className="text-gray-600 text-xs sm:text-sm truncate">Gestionar noticias</p>
              </div>
            </div>
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 uppercase tracking-wide">RESUMEN GENERAL</h2>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-3 sm:p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-600 text-xs sm:text-sm uppercase tracking-wide">Total Usuarios</p>
              <p className="text-2xl sm:text-3xl font-bold text-blue-600">{stats.totalUsuarios}</p>
            </div>
            <div className="p-3 sm:p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-600 text-xs sm:text-sm uppercase tracking-wide">Entidades</p>
              <p className="text-2xl sm:text-3xl font-bold text-green-600">{stats.totalEntidades}</p>
            </div>
            <div className="p-3 sm:p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-600 text-xs sm:text-sm uppercase tracking-wide">Emergencias</p>
              <p className="text-2xl sm:text-3xl font-bold text-red-600">{stats.emergenciasActivas}</p>
            </div>
            <div className="p-3 sm:p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-600 text-xs sm:text-sm uppercase tracking-wide">Evaluaciones</p>
              <p className="text-2xl sm:text-3xl font-bold text-yellow-600">{stats.totalEvaluaciones}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const UsuariosAdmin = () => {
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUsuarios()
  }, [])

  const fetchUsuarios = async () => {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setUsuarios(data || [])
    } catch (error) {
      console.error('Error fetching usuarios:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRoleLabel = (tipo) => {
    const labels = {
      'MIGRANTE': 'Migrante',
      'ENTIDAD': 'Entidad',
      'GERENCIA': 'Gerencia'
    }
    return labels[tipo] || tipo
  }

  const getRoleColor = (tipo) => {
    const colors = {
      'MIGRANTE': 'bg-blue-100 text-blue-800',
      'ENTIDAD': 'bg-green-100 text-green-800',
      'GERENCIA': 'bg-purple-100 text-purple-800'
    }
    return colors[tipo] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center mb-6">
          <Link to="/gerencia" className="flex items-center text-purple-600 hover:text-purple-800 transition-colors">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver al Panel
          </Link>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6 sm:mb-8">Gestión de Usuarios</h1>

        {/* Mobile Card View */}
        <div className="lg:hidden space-y-4">
          {usuarios.map(usuario => (
            <div key={usuario.id} className="bg-white rounded-xl shadow-md p-4">
              <div className="flex flex-col items-center mb-2">
                <p className="font-semibold text-gray-800 text-sm">{usuario.nombre}</p>
                <p className="text-sm text-gray-600 mb-1">{usuario.email}</p>
              </div>
              <div className="flex justify-center mb-2">
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${getRoleColor(usuario.tipo)}`}>
                  {getRoleLabel(usuario.tipo)}
                </span>
              </div>
              <p className="text-xs text-gray-500 text-center">{new Date(usuario.created_at).toLocaleDateString()}</p>
            </div>
          ))}
          {usuarios.length === 0 && (
            <p className="text-center text-gray-600">No hay usuarios registrados</p>
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {usuarios.map(usuario => (
                  <tr key={usuario.id}>
                    <td className="px-4 py-3 text-sm font-medium text-gray-800 truncate max-w-[150px]">
                      {usuario.nombre}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 truncate max-w-[200px]">
                      {usuario.email}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${getRoleColor(usuario.tipo)}`}>
                        {getRoleLabel(usuario.tipo)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(usuario.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

const EmergenciasAdmin = () => {
  const [emergencias, setEmergencias] = useState([])
  const [entidades, setEntidades] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedEmergencia, setSelectedEmergencia] = useState(null)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [asignarData, setAsignarData] = useState({
    entidad_id: '',
    prioridad: 'NORMAL',
    seguimiento: ''
  })

  useEffect(() => {
    fetchEmergencias()
    fetchEntidades()
  }, [])

  const fetchEmergencias = async () => {
    try {
      const { data, error } = await supabase
        .from('emergencias')
        .select('*, usuarios(nombre, email), entidades(nombre)')
        .order('created_at', { ascending: false })

      if (error) throw error
      setEmergencias(data || [])
    } catch (error) {
      console.error('Error fetching emergencias:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchEntidades = async () => {
    try {
      const { data, error } = await supabase
        .from('entidades')
        .select('id, nombre')
        .eq('habilitado', true)
        .order('nombre')

      if (error) throw error
      setEntidades(data || [])
    } catch (error) {
      console.error('Error fetching entidades:', error)
    }
  }

  const handleAsignar = async (e) => {
    e.preventDefault()
    try {
      const { error } = await supabase
        .from('emergencias')
        .update({
          entidad_id: asignarData.entidad_id,
          prioridad: asignarData.prioridad,
          seguimiento: asignarData.seguimiento,
          estado: 'ASIGNADA',
          fecha_asignacion: new Date().toISOString()
        })
        .eq('id', selectedEmergencia.id)

      if (error) throw error

      toast.success('Emergencia asignada correctamente')
      setShowAssignModal(false)
      setSelectedEmergencia(null)
      setAsignarData({ entidad_id: '', prioridad: 'NORMAL', seguimiento: '' })
      fetchEmergencias()
    } catch (error) {
      toast.error(error.message || 'Error al asignar emergencia')
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
      toast.error(error.message || 'Error al actualizar emergencia')
    }
  }

  const handleEliminar = async (id) => {
    if (!confirm('¿Estás seguro de eliminar esta emergencia? Esta acción no se puede deshacer.')) return
    
    try {
      const { error } = await supabase
        .from('emergencias')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast.success('Emergencia eliminada')
      fetchEmergencias()
    } catch (error) {
      toast.error(error.message || 'Error al eliminar emergencia')
    }
  }

  const openAssignModal = (emergencia) => {
    setSelectedEmergencia(emergencia)
    setAsignarData({
      entidad_id: emergencia.entidad_id || '',
      prioridad: emergencia.prioridad || 'NORMAL',
      seguimiento: emergencia.seguimiento || ''
    })
    setShowAssignModal(true)
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center mb-6">
          <Link to="/gerencia" className="flex items-center text-purple-600 hover:text-purple-800 transition-colors">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver al Panel
          </Link>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6 sm:mb-8">Gestión de Emergencias</h1>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="bg-white rounded-xl shadow-md p-3 sm:p-4">
            <p className="text-gray-600 text-xs sm:text-sm">Pendientes</p>
            <p className="text-xl sm:text-2xl font-bold text-yellow-600">
              {emergencias.filter(e => e.estado === 'PENDIENTE').length}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-3 sm:p-4">
            <p className="text-gray-600 text-xs sm:text-sm">Asignadas</p>
            <p className="text-xl sm:text-2xl font-bold text-blue-600">
              {emergencias.filter(e => e.estado === 'ASIGNADA').length}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-3 sm:p-4">
            <p className="text-gray-600 text-xs sm:text-sm">Atendidas</p>
            <p className="text-xl sm:text-2xl font-bold text-green-600">
              {emergencias.filter(e => e.estado === 'ATENDIDA').length}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-3 sm:p-4">
            <p className="text-gray-600 text-xs sm:text-sm">Urgentes</p>
            <p className="text-xl sm:text-2xl font-bold text-red-600">
              {emergencias.filter(e => e.prioridad === 'URGENTE').length}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {emergencias.map(emergencia => (
            <div key={emergencia.id} className="bg-white rounded-xl shadow-md p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div className="flex-1 w-full">
                  <div className="flex flex-wrap gap-2 mb-2">
                    <span className="bg-red-100 text-red-800 text-xs sm:text-sm font-medium px-2 py-0.5 rounded">
                      {emergencia.tipo}
                    </span>
                    <span className={`text-xs sm:text-sm font-medium px-2 py-0.5 rounded ${getEstadoColor(emergencia.estado)}`}>
                      {emergencia.estado}
                    </span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${getPrioridadColor(emergencia.prioridad)}`}>
                      {emergencia.prioridad}
                    </span>
                  </div>
                  <p className="text-gray-800 text-sm sm:text-base break-words">{emergencia.descripcion}</p>
                  {emergencia.direccion && (
                    <p className="text-gray-600 text-xs sm:text-sm mt-2">📍 {emergencia.direccion}</p>
                  )}
                  
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs sm:text-sm text-gray-600">Reportado por:</p>
                      <p className="font-medium text-sm sm:text-base break-words">{emergencia.usuarios?.nombre}</p>
                      <p className="text-xs sm:text-sm text-gray-500 break-words">{emergencia.usuarios?.email}</p>
                    </div>
                    {emergencia.entidades && (
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-xs sm:text-sm text-gray-600">Asignada a:</p>
                        <p className="font-medium text-blue-800 text-sm sm:text-base break-words">{emergencia.entidades.nombre}</p>
                      </div>
                    )}
                  </div>
                  
                  {emergencia.seguimiento && (
                    <div className="mt-3 p-3 bg-yellow-50 rounded-lg">
                      <p className="text-xs sm:text-sm text-gray-600">Seguimiento:</p>
                      <p className="text-gray-800 text-sm break-words">{emergencia.seguimiento}</p>
                    </div>
                  )}
                  
                  <p className="text-gray-500 text-xs sm:text-sm mt-2">
                    {new Date(emergencia.created_at).toLocaleString()}
                  </p>
                </div>
                
                <div className="flex sm:flex-col space-x-2 sm:space-x-0 sm:space-y-2 w-full sm:w-auto flex-shrink-0">
                  <button
                    onClick={() => openAssignModal(emergencia)}
                    className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 text-xs sm:text-sm flex-1 sm:flex-none"
                  >
                    Asignar
                  </button>
                  {emergencia.estado !== 'ATENDIDA' && (
                    <button
                      onClick={() => handleAtender(emergencia.id)}
                      className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 text-xs sm:text-sm flex-1 sm:flex-none"
                    >
                      Atendida
                    </button>
                  )}
                  <button
                    onClick={() => handleEliminar(emergencia.id)}
                    className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 text-xs sm:text-sm flex-1 sm:flex-none"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Assign Modal */}
      {showAssignModal && selectedEmergencia && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Asignar Emergencia</h2>
            <form onSubmit={handleAsignar} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Entidad Asignada</label>
                <select
                  value={asignarData.entidad_id}
                  onChange={(e) => setAsignarData({ ...asignarData, entidad_id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  required
                >
                  <option value="">Seleccionar entidad...</option>
                  {entidades.map(entidad => (
                    <option key={entidad.id} value={entidad.id}>{entidad.nombre}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Prioridad</label>
                <select
                  value={asignarData.prioridad}
                  onChange={(e) => setAsignarData({ ...asignarData, prioridad: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="BAJA">Baja</option>
                  <option value="NORMAL">Normal</option>
                  <option value="ALTA">Alta</option>
                  <option value="URGENTE">Urgente</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Seguimiento / Notas</label>
                <textarea
                  value={asignarData.seguimiento}
                  onChange={(e) => setAsignarData({ ...asignarData, seguimiento: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="Agregar notas de seguimiento..."
                />
              </div>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
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

const EvaluacionesAdmin = () => {
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center mb-6">
          <Link to="/gerencia" className="flex items-center text-blue-600 hover:text-blue-800 transition-colors uppercase tracking-wide font-medium">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver al Panel
          </Link>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-blue-600 mb-6 sm:mb-8 uppercase tracking-wide">Todas las Evaluaciones</h1>

        {/* Mobile Card View */}
        <div className="lg:hidden space-y-4">
          {calificaciones.map(calif => (
            <div key={calif.id} className="bg-white rounded-xl shadow-md p-4">
              <div className="flex flex-col items-center mb-3">
                <p className="font-semibold text-gray-800 text-sm">{calif.usuarios?.nombre}</p>
                <p className="text-xs text-gray-500">{calif.entidades?.nombre}</p>
              </div>
              <div className="flex justify-center mb-3">
                <span className="text-yellow-500 text-lg">{['★'.repeat(calif.calificacion)]}</span>
              </div>
              <p className="text-sm text-gray-600 mb-3 text-center">{calif.comentario}</p>
              <p className="text-xs text-gray-500 text-center">{new Date(calif.created_at).toLocaleDateString()}</p>
            </div>
          ))}
          {calificaciones.length === 0 && (
            <p className="text-center text-gray-600">No hay evaluaciones registradas</p>
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuario</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entidad</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Calificación</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Comentario</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {calificaciones.map(calif => (
                  <tr key={calif.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                      {calif.usuarios?.nombre}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {calif.entidades?.nombre}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-yellow-500">{'★'.repeat(calif.calificacion)}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                      {calif.comentario}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(calif.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

const NovedadesAdmin = () => {
  const [novedades, setNovedades] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [newNovedad, setNewNovedad] = useState({
    titulo: '',
    contenido: '',
    tipo: 'INFORMACION',
    activa: true
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchNovedades()
  }, [])

  const fetchNovedades = async () => {
    try {
      const { data, error } = await supabase
        .from('novedades')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setNovedades(data || [])
    } catch (error) {
      console.error('Error fetching novedades:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      if (editingId) {
        // Update existing
        const { error } = await supabase
          .from('novedades')
          .update({
            titulo: newNovedad.titulo,
            contenido: newNovedad.contenido,
            tipo: newNovedad.tipo,
            activa: newNovedad.activa
          })
          .eq('id', editingId)

        if (error) throw error
        toast.success('Novedad actualizada correctamente')
      } else {
        // Insert new
        const { error } = await supabase
          .from('novedades')
          .insert([{
            titulo: newNovedad.titulo,
            contenido: newNovedad.contenido,
            tipo: newNovedad.tipo,
            activa: newNovedad.activa
          }])

        if (error) throw error
        toast.success('Novedad publicada exitosamente')
      }

      setShowForm(false)
      setEditingId(null)
      setNewNovedad({ titulo: '', contenido: '', tipo: 'INFORMACION', activa: true })
      fetchNovedades()
    } catch (error) {
      toast.error(error.message || 'Error al guardar novedad')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (novedad) => {
    setEditingId(novedad.id)
    setNewNovedad({
      titulo: novedad.titulo,
      contenido: novedad.contenido,
      tipo: novedad.tipo,
      activa: novedad.activa
    })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta novedad?')) return

    try {
      const { error } = await supabase
        .from('novedades')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast.success('Novedad eliminada correctamente')
      fetchNovedades()
    } catch (error) {
      toast.error(error.message || 'Error al eliminar novedad')
    }
  }

  const handleToggleActive = async (novedad) => {
    try {
      const { error } = await supabase
        .from('novedades')
        .update({ activa: !novedad.activa })
        .eq('id', novedad.id)

      if (error) throw error
      toast.success(novedad.activa ? 'Novedad desactivada' : 'Novedad activada')
      fetchNovedades()
    } catch (error) {
      toast.error(error.message || 'Error al actualizar novedad')
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingId(null)
    setNewNovedad({ titulo: '', contenido: '', tipo: 'INFORMACION', activa: true })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center mb-6">
          <Link to="/gerencia" className="flex items-center text-purple-600 hover:text-purple-800 transition-colors">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver al Panel
          </Link>
        </div>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Gestión de Novedades</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
          >
            {showForm ? 'Cancelar' : '+ Publicar Novedad'}
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <h2 className="text-lg font-semibold mb-4">
              {editingId ? 'Editar Novedad' : 'Nueva Novedad'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Título</label>
                <input
                  type="text"
                  value={newNovedad.titulo}
                  onChange={(e) => setNewNovedad({ ...newNovedad, titulo: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="Título de la novedad"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
                  <select
                    value={newNovedad.tipo}
                    onChange={(e) => setNewNovedad({ ...newNovedad, tipo: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="INFORMACION">Información</option>
                    <option value="ALERTA">Alerta</option>
                    <option value="EVENTO">Evento</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                  <select
                    value={newNovedad.activa ? 'activa' : 'inactiva'}
                    onChange={(e) => setNewNovedad({ ...newNovedad, activa: e.target.value === 'activa' })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="activa">Activa</option>
                    <option value="inactiva">Inactiva</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contenido</label>
                <textarea
                  value={newNovedad.contenido}
                  onChange={(e) => setNewNovedad({ ...newNovedad, contenido: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="Contenido de la novedad..."
                  required
                />
              </div>
              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  {submitting ? (editingId ? 'Actualizando...' : 'Publicando...') : (editingId ? 'Actualizar' : 'Publicar')}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="space-y-4">
          {novedades.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-8 text-center">
              <p className="text-gray-600">No hay novedades publicadas.</p>
            </div>
          ) : (
            novedades.map(novedad => (
              <div key={novedad.id} className={`bg-white rounded-xl shadow-md p-6 border-l-4 ${
                !novedad.activa ? 'border-gray-300 opacity-60' :
                novedad.tipo === 'ALERTA' ? 'border-red-500' :
                novedad.tipo === 'EVENTO' ? 'border-green-500' :
                'border-blue-500'
              }`}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-semibold text-gray-800">{novedad.titulo}</h3>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                        novedad.tipo === 'ALERTA' ? 'bg-red-100 text-red-800' :
                        novedad.tipo === 'EVENTO' ? 'bg-green-100 text-green-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {novedad.tipo}
                      </span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                        novedad.activa ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {novedad.activa ? 'Activa' : 'Inactiva'}
                      </span>
                    </div>
                    <p className="text-gray-600">{novedad.contenido}</p>
                    <p className="text-gray-500 text-sm mt-2">
                      {new Date(novedad.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => handleToggleActive(novedad)}
                      className={`p-2 rounded-lg ${
                        novedad.activa 
                          ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' 
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                      title={novedad.activa ? 'Desactivar' : 'Activar'}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleEdit(novedad)}
                      className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                      title="Editar"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(novedad.id)}
                      className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                      title="Eliminar"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

const GerenciaRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<DashboardGerencia />} />
      <Route path="usuarios" element={<UsuariosAdmin />} />
      <Route path="emergencias" element={<EmergenciasAdmin />} />
      <Route path="evaluaciones" element={<EvaluacionesAdmin />} />
      <Route path="novedades" element={<NovedadesAdmin />} />
    </Routes>
  )
}

export default GerenciaRoutes
