import { useState, useEffect } from 'react'
import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'

// Componente para mostrar Novedades
const NovedadesMigrante = () => {
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
        <Link to="novedades" className="text-blue-600 text-sm hover:underline">Volver atrás</Link>
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

const DashboardMigrante = () => {
  const { userProfile } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-blue-700 text-white py-8 shadow-lg">
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
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
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

          <Link to="novedades" className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">📋</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Novedades</h3>
                <p className="text-gray-600 text-sm">Ver todas las noticias</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Novedades Section */}
        <div className="mb-8">
          <NovedadesMigrante />
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Acciones Rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
  const [entidades, setEntidades] = useState([])
  const [filteredEntidades, setFilteredEntidades] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [newEmergencia, setNewEmergencia] = useState({
    tipo: 'SALUD',
    descripcion: '',
    direccion: '',
    entidad_id: '',
    prioridad: 'NORMAL'
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchEmergencias()
    fetchEntidades()
  }, [])

  const fetchEmergencias = async () => {
    try {
      const { data, error } = await supabase
        .from('emergencias')
        .select('*, entidades(nombre)')
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

  const fetchEntidades = async () => {
    try {
      const { data, error } = await supabase
        .from('entidades')
        .select('id, nombre, tipo')
        .eq('habilitado', true)
        .order('nombre')

      if (error) throw error
      setEntidades(data || [])
      setFilteredEntidades(data || [])
    } catch (error) {
      console.error('Error fetching entidades:', error)
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
          entidad_id: newEmergencia.entidad_id || null,
          prioridad: newEmergencia.prioridad,
          estado: 'PENDIENTE'
        }])

      if (error) throw error

      toast.success('Emergencia reportada exitosamente')
      setShowForm(false)
      setNewEmergencia({ tipo: 'SALUD', descripcion: '', direccion: '', entidad_id: '', prioridad: 'NORMAL' })
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 py-8">
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
                  onChange={(e) => {
                    const tipo = e.target.value
                    setNewEmergencia({ ...newEmergencia, tipo, entidad_id: '' })
                    // Filtrar entidades por tipo
                    if (tipo) {
                      const filtered = entidades.filter(ent => ent.tipo === tipo)
                      setFilteredEntidades(filtered)
                    } else {
                      setFilteredEntidades(entidades)
                    }
                  }}
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Entidad {newEmergencia.tipo ? `de ${newEmergencia.tipo.toLowerCase()}` : '(Opcional)'}
                </label>
                <select
                  value={newEmergencia.entidad_id}
                  onChange={(e) => setNewEmergencia({ ...newEmergencia, entidad_id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  disabled={!newEmergencia.tipo}
                >
                  <option value="">
                    {newEmergencia.tipo ? 'Seleccionar entidad...' : 'Primero selecciona un tipo'}
                  </option>
                  {filteredEntidades.map(entidad => (
                    <option key={entidad.id} value={entidad.id}>{entidad.nombre}</option>
                  ))}
                </select>
                {newEmergencia.tipo && filteredEntidades.length === 0 && (
                  <p className="text-sm text-yellow-600 mt-1">No hay entidades disponibles de este tipo</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Prioridad</label>
                <select
                  value={newEmergencia.prioridad}
                  onChange={(e) => setNewEmergencia({ ...newEmergencia, prioridad: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="BAJA">Baja</option>
                  <option value="NORMAL">Normal</option>
                  <option value="ALTA">Alta</option>
                  <option value="URGENTE">Urgente</option>
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
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2 py-0.5 rounded">
                        {getTipoLabel(emergencia.tipo)}
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
                    
                    {emergencia.entidades && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-gray-600">Asignada a:</p>
                        <p className="font-medium text-blue-800">{emergencia.entidades.nombre}</p>
                      </div>
                    )}
                    
                    {emergencia.seguimiento && (
                      <div className="mt-3 p-3 bg-yellow-50 rounded-lg">
                        <p className="text-sm text-gray-600">Seguimiento:</p>
                        <p className="text-gray-800">{emergencia.seguimiento}</p>
                      </div>
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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

export { DashboardMigrante as default, EmergenciasMigrante, NovedadesMigrante as NovedadesPage }
