import { useState, useEffect } from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'

const DashboardGerencia = () => {
  const { userProfile } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-purple-600 text-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl font-bold">
            Panel de Gerencia
          </h1>
          <p className="text-purple-100 mt-2">
            Administración y supervisión de la plataforma
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Link to="usuarios" className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">👥</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Usuarios</h3>
                <p className="text-gray-600 text-sm">Gestionar usuarios</p>
              </div>
            </div>
          </Link>

          <Link to="emergencias" className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">🚨</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Emergencias</h3>
                <p className="text-gray-600 text-sm">Ver todas las emergencias</p>
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

          <Link to="novedades" className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">📋</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Novedades</h3>
                <p className="text-gray-600 text-sm">Gestionar noticias</p>
              </div>
            </div>
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Resumen General</h2>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-600 text-sm">Total Usuarios</p>
              <p className="text-3xl font-bold text-gray-800" id="total-users">-</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-600 text-sm">Entidades</p>
              <p className="text-3xl font-bold text-gray-800" id="total-entities">-</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-600 text-sm">Emergencias Activas</p>
              <p className="text-3xl font-bold text-gray-800" id="active-emergencies">-</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-600 text-sm">Evaluaciones</p>
              <p className="text-3xl font-bold text-gray-800" id="total-evaluations">-</p>
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-8">Gestión de Usuarios</h1>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {usuarios.map(usuario => (
                <tr key={usuario.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                    {usuario.nombre}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {usuario.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${getRoleColor(usuario.tipo)}`}>
                      {getRoleLabel(usuario.tipo)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {new Date(usuario.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

const EmergenciasAdmin = () => {
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
        .order('created_at', { ascending: false })

      if (error) throw error
      setEmergencias(data || [])
    } catch (error) {
      console.error('Error fetching emergencias:', error)
    } finally {
      setLoading(false)
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-8">Todas las Emergencias</h1>

        <div className="space-y-4">
          {emergencias.map(emergencia => (
            <div key={emergencia.id} className="bg-white rounded-xl shadow-md p-6">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="bg-red-100 text-red-800 text-sm font-medium px-2 py-0.5 rounded">
                      {emergencia.tipo}
                    </span>
                    <span className={`text-sm font-medium px-2 py-0.5 rounded ${getEstadoColor(emergencia.estado)}`}>
                      {emergencia.estado}
                    </span>
                  </div>
                  <p className="text-gray-800">{emergencia.descripcion}</p>
                  {emergencia.direccion && (
                    <p className="text-gray-600 text-sm mt-2">📍 {emergencia.direccion}</p>
                  )}
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Reportado por:</p>
                    <p className="font-medium">{emergencia.usuarios?.nombre}</p>
                    <p className="text-sm text-gray-500">{emergencia.usuarios?.email}</p>
                  </div>
                  <p className="text-gray-500 text-sm mt-2">
                    {new Date(emergencia.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-8">Todas las Evaluaciones</h1>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <table className="w-full">
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
  )
}

const NovedadesAdmin = () => {
  const [novedades, setNovedades] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [newNovedad, setNewNovedad] = useState({
    titulo: '',
    contenido: '',
    tipo: 'INFORMACION'
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
      const { error } = await supabase
        .from('novedades')
        .insert([{
          titulo: newNovedad.titulo,
          contenido: newNovedad.contenido,
          tipo: newNovedad.tipo,
          activa: true
        }])

      if (error) throw error

      toast.success('Novedad publicada exitosamente')
      setShowForm(false)
      setNewNovedad({ titulo: '', contenido: '', tipo: 'INFORMACION' })
      fetchNovedades()
    } catch (error) {
      toast.error(error.message || 'Error al publicar novedad')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
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
            <h2 className="text-lg font-semibold mb-4">Nueva Novedad</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Título</label>
                <input
                  type="text"
                  value={newNovedad.titulo}
                  onChange={(e) => setNewNovedad({ ...newNovedad, titulo: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Contenido</label>
                <textarea
                  value={newNovedad.contenido}
                  onChange={(e) => setNewNovedad({ ...newNovedad, contenido: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                {submitting ? 'Publicando...' : 'Publicar'}
              </button>
            </form>
          </div>
        )}

        <div className="space-y-4">
          {novedades.map(novedad => (
            <div key={novedad.id} className="bg-white rounded-xl shadow-md p-6">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="font-semibold text-gray-800">{novedad.titulo}</h3>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                      novedad.tipo === 'ALERTA' ? 'bg-red-100 text-red-800' :
                      novedad.tipo === 'EVENTO' ? 'bg-green-100 text-green-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {novedad.tipo}
                    </span>
                  </div>
                  <p className="text-gray-600">{novedad.contenido}</p>
                  <p className="text-gray-500 text-sm mt-2">
                    {new Date(novedad.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
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
