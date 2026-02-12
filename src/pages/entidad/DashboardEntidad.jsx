import { useState, useEffect } from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'

const DashboardEntidad = () => {
  const { userProfile } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-green-600 text-white py-8">
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
        <div className="grid md:grid-cols-4 gap-6 mb-8">
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
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Estadísticas Rápidas</h2>
          <div className="grid md:grid-cols-3 gap-4">
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
  const { userProfile } = useAuth()
  const [emergencias, setEmergencias] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEmergencias()
  }, [])

  const fetchEmergencias = async () => {
    try {
      const { data, error } = await supabase
        .from('emergencias')
        .select('*, usuarios(nombre, email)')
        .eq('estado', 'PENDIENTE')
        .order('created_at', { ascending: false })

      if (error) throw error
      setEmergencias(data || [])
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
        .update({ estado: 'ATENDIDA' })
        .eq('id', id)

      if (error) throw error

      toast.success('Emergencia marcada como atendida')
      fetchEmergencias()
    } catch (error) {
      toast.error(error.message || 'Error al atender emergencia')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-8">Emergencias Pendientes</h1>

        {emergencias.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <p className="text-gray-600">No hay emergencias pendientes en este momento.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {emergencias.map(emergencia => (
              <div key={emergencia.id} className="bg-white rounded-xl shadow-md p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="bg-red-100 text-red-800 text-sm font-medium px-2 py-0.5 rounded">
                        {emergencia.tipo}
                      </span>
                      <span className="bg-yellow-100 text-yellow-800 text-sm font-medium px-2 py-0.5 rounded">
                        {emergencia.estado}
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
                    <p className="text-gray-500 text-sm mt-2">
                      Reportada el {new Date(emergencia.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleAtender(emergencia.id)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                  >
                    Atendida
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  const promedio = calificaciones.length > 0
    ? (calificaciones.reduce((acc, c) => acc + c.calificacion, 0) / calificaciones.length).toFixed(1)
    : 'N/A'

  return (
    <div className="min-h-screen bg-gray-50 py-8">
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

const EntidadRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<DashboardEntidad />} />
      <Route path="emergencias" element={<EmergenciasEntidad />} />
      <Route path="servicios" element={<ServiciosEntidad />} />
      <Route path="evaluaciones" element={<EvaluacionesEntidad />} />
    </Routes>
  )
}

export default EntidadRoutes
