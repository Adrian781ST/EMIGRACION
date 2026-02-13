import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'

// Agregar estilos de animación globalmente
const globalStyles = `
  @keyframes twinkle {
    0%, 100% { opacity: 0.3; transform: scale(1); }
    50% { opacity: 0.8; transform: scale(1.1); }
  }
`

// Componente de fondo con campo de estrellas tipo nubes
const StarFieldBackground = () => {
  const [stars] = useState(() => {
    const starCount = 50
    return Array.from({ length: starCount }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: Math.random() * 20 + 10,
      animationDuration: Math.random() * 10 + 10,
      animationDelay: Math.random() * 10,
      opacity: Math.random() * 0.5 + 0.3
    }))
  })

  return (
    <>
      <style>{globalStyles}</style>
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{
        background: 'linear-gradient(180deg, #87CEEB 0%, #B0E0E6 50%, #E0F6FF 100%)',
        zIndex: 0
      }}>
        {stars.map((star) => (
          <div
            key={star.id}
            className="absolute rounded-full blur-sm"
            style={{
              left: `${star.left}%`,
              top: `${star.top}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              opacity: star.opacity,
              animation: `twinkle ${star.animationDuration}s ease-in-out infinite`,
              animationDelay: `${star.animationDelay}s`,
              boxShadow: `0 0 ${star.size * 2}px rgba(255, 255, 255, 0.5)`
            }}
          />
        ))}
        {/* Nubes adicionales para efecto más suave */}
        <div className="absolute bottom-10 left-10 w-40 h-20 bg-white/30 rounded-full blur-xl animate-pulse" />
        <div className="absolute top-20 right-20 w-60 h-24 bg-white/20 rounded-full blur-xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-1/3 right-10 w-32 h-16 bg-white/25 rounded-full blur-xl animate-pulse" style={{ animationDelay: '4s' }} />
      </div>
    </>
  )
}

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
    <div className="min-h-screen relative">
      <StarFieldBackground />
      
      {/* Overlay semitransparente para legibilidad */}
      <div className="absolute inset-0 bg-white/70 pointer-events-none z-10" />
      
      {/* Sector Banner */}
      <div className="relative z-20">
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
  const [loading, setLoading] = useState(true)
  const [mode, setMode] = useState('loading') // 'loading', 'setup', 'services'
  
  // Institution profile state
  const [institutionProfile, setInstitutionProfile] = useState({
    nombre: '',
    codigo_institucion: '',
    descripcion: '',
    tipo: 'SALUD',
    direccion: '',
    telefono: '',
    email: '',
    website: ''
  })
  const [savingProfile, setSavingProfile] = useState(false)
  
  // Services state
  const [servicios, setServicios] = useState([])
  const [showServiceForm, setShowServiceForm] = useState(false)
  const [newServicio, setNewServicio] = useState({
    nombre: '',
    descripcion: '',
    tipo: 'SALUD'
  })
  const [submittingService, setSubmittingService] = useState(false)

  useEffect(() => {
    checkInstitutionProfile()
  }, [])

  const checkInstitutionProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('entidades')
        .select('*')
        .eq('usuario_id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      if (data) {
        setInstitutionProfile({
          nombre: data.nombre || '',
          codigo_institucion: data.codigo_institucion || '',
          descripcion: data.descripcion || '',
          tipo: data.tipo || 'SALUD',
          direccion: data.direccion || '',
          telefono: data.telefono || '',
          email: data.email || '',
          website: data.website || ''
        })
        // Check if profile is complete (has nombre and tipo)
        if (data.nombre && data.tipo) {
          setMode('services')
          fetchServicios()
        } else {
          setMode('setup')
        }
      } else {
        setMode('setup')
      }
    } catch (error) {
      console.error('Error checking institution profile:', error)
      setMode('setup')
    } finally {
      setLoading(false)
    }
  }

  const generateCodigoInstitucion = () => {
    const prefix = institutionProfile.tipo?.substring(0, 3) || 'INS'
    const randomNum = Math.floor(1000 + Math.random() * 9000)
    const year = new Date().getFullYear()
    return `${prefix}-${year}-${randomNum}`
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setSavingProfile(true)

    try {
      const codigo = institutionProfile.codigo_institucion || generateCodigoInstitucion()
      
      const { data: existingData } = await supabase
        .from('entidades')
        .select('id')
        .eq('usuario_id', user.id)
        .single()

      let error
      if (existingData) {
        // Update existing
        const { error: updateError } = await supabase
          .from('entidades')
          .update({
            nombre: institutionProfile.nombre,
            codigo_institucion: codigo,
            descripcion: institutionProfile.descripcion,
            tipo: institutionProfile.tipo,
            direccion: institutionProfile.direccion,
            telefono: institutionProfile.telefono,
            email: institutionProfile.email,
            website: institutionProfile.website,
            habilitado: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingData.id)
        error = updateError
      } else {
        // Insert new
        const { error: insertError } = await supabase
          .from('entidades')
          .insert({
            usuario_id: user.id,
            nombre: institutionProfile.nombre,
            codigo_institucion: codigo,
            descripcion: institutionProfile.descripcion,
            tipo: institutionProfile.tipo,
            direccion: institutionProfile.direccion,
            telefono: institutionProfile.telefono,
            email: institutionProfile.email,
            website: institutionProfile.website,
            habilitado: true
          })
        error = insertError
      }

      if (error) throw error

      toast.success('¡Perfil de institución guardado exitosamente!')
      setMode('services')
      fetchServicios()
    } catch (error) {
      toast.error(error.message || 'Error al guardar el perfil')
    } finally {
      setSavingProfile(false)
    }
  }

  const fetchServicios = async () => {
    try {
      // First get the entidad ID
      const { data: entidadData } = await supabase
        .from('entidades')
        .select('id')
        .eq('usuario_id', user.id)
        .single()

      if (!entidadData) {
        setServicios([])
        return
      }

      const { data, error } = await supabase
        .from('servicios_entidad')
        .select('*')
        .eq('entidad_id', entidadData.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setServicios(data || [])
    } catch (error) {
      console.error('Error fetching servicios:', error)
    }
  }

  const handleAddServicio = async (e) => {
    e.preventDefault()
    setSubmittingService(true)

    try {
      const { data: entidadData } = await supabase
        .from('entidades')
        .select('id')
        .eq('usuario_id', user.id)
        .single()

      if (!entidadData) {
        toast.error('Primero completa el perfil de tu institución')
        setMode('setup')
        return
      }

      const { error } = await supabase
        .from('servicios_entidad')
        .insert([{
          entidad_id: entidadData.id,
          nombre: newServicio.nombre,
          descripcion: newServicio.descripcion,
          tipo: newServicio.tipo,
          habilitado: true
        }])

      if (error) throw error

      toast.success('Servicio agregado exitosamente')
      setShowServiceForm(false)
      setNewServicio({ nombre: '', descripcion: '', tipo: 'SALUD' })
      fetchServicios()
    } catch (error) {
      toast.error(error.message || 'Error al agregar servicio')
    } finally {
      setSubmittingService(false)
    }
  }

  const handleDeleteServicio = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este servicio?')) return
    
    try {
      const { error } = await supabase
        .from('servicios_entidad')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast.success('Servicio eliminado')
      fetchServicios()
    } catch (error) {
      toast.error(error.message || 'Error al eliminar servicio')
    }
  }

  const getSectorColor = (tipo) => {
    const colors = {
      'SALUD': 'from-red-500 to-red-600',
      'EDUCACION': 'from-blue-500 to-blue-600',
      'LEGAL': 'from-gray-600 to-gray-700',
      'VIVIENDA': 'from-orange-500 to-orange-600',
      'EMPLEO': 'from-green-500 to-green-600',
      'ALIMENTACION': 'from-yellow-500 to-yellow-600',
      'OTROS': 'from-purple-500 to-purple-600'
    }
    return colors[tipo] || 'from-gray-500 to-gray-600'
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  // Setup Mode - Institution Registration Form
  if (mode === 'setup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-4xl">🏛️</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-800">Registro de Institución</h1>
            <p className="text-gray-600 mt-2">Completa los datos de tu organización para comenzar a ofrecer servicios</p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className={`h-2 bg-gradient-to-r ${getSectorColor(institutionProfile.tipo)}`}></div>
            <form onSubmit={handleSaveProfile} className="p-8 space-y-6">
              {/* Sector Selection */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  <span className="flex items-center gap-2">
                    <span>🎯</span> Sector de tu Institución
                  </span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { value: 'SALUD', icon: '🏥', label: 'Salud' },
                    { value: 'EDUCACION', icon: '📚', label: 'Educación' },
                    { value: 'LEGAL', icon: '⚖️', label: 'Legal' },
                    { value: 'VIVIENDA', icon: '🏠', label: 'Vivienda' },
                    { value: 'EMPLEO', icon: '💼', label: 'Empleo' },
                    { value: 'ALIMENTACION', icon: '🍽️', label: 'Alimentación' },
                    { value: 'OTROS', icon: '📋', label: 'Otros' }
                  ].map((sector) => (
                    <button
                      key={sector.value}
                      type="button"
                      onClick={() => setInstitutionProfile({ ...institutionProfile, tipo: sector.value })}
                      className={`p-3 rounded-xl border-2 transition-all duration-200 ${
                        institutionProfile.tipo === sector.value
                          ? 'border-green-500 bg-green-50 shadow-md'
                          : 'border-gray-200 hover:border-green-300 hover:bg-gray-50'
                      }`}
                    >
                      <span className="text-2xl block text-center">{sector.icon}</span>
                      <span className="text-xs font-medium text-gray-700 block text-center mt-1">{sector.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Basic Info */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <span className="flex items-center gap-2">
                      <span>🏛️</span> Nombre de la Institución *
                    </span>
                  </label>
                  <input
                    type="text"
                    value={institutionProfile.nombre}
                    onChange={(e) => setInstitutionProfile({ ...institutionProfile, nombre: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Ej: Hospital Central de Bogotá"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <span className="flex items-center gap-2">
                      <span>🏷️</span> Código de Institución
                    </span>
                    <span className="text-gray-400 text-xs font-normal ml-2">(Se generará automáticamente si lo dejas en blanco)</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={institutionProfile.codigo_institucion}
                      onChange={(e) => setInstitutionProfile({ ...institutionProfile, codigo_institucion: e.target.value })}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono"
                      placeholder="Ej: SAL-2024-1234"
                    />
                    <button
                      type="button"
                      onClick={() => setInstitutionProfile({ ...institutionProfile, codigo_institucion: generateCodigoInstitucion() })}
                      className="px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-md"
                    >
                      🎲 Generar
                    </button>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <span className="flex items-center gap-2">
                      <span>📝</span> Descripción
                    </span>
                  </label>
                  <textarea
                    value={institutionProfile.descripcion}
                    onChange={(e) => setInstitutionProfile({ ...institutionProfile, descripcion: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Describe los servicios que ofrece tu institución..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <span className="flex items-center gap-2">
                      <span>📍</span> Dirección
                    </span>
                  </label>
                  <input
                    type="text"
                    value={institutionProfile.direccion}
                    onChange={(e) => setInstitutionProfile({ ...institutionProfile, direccion: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Calle 123, Bogotá"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <span className="flex items-center gap-2">
                      <span>📞</span> Teléfono
                    </span>
                  </label>
                  <input
                    type="tel"
                    value={institutionProfile.telefono}
                    onChange={(e) => setInstitutionProfile({ ...institutionProfile, telefono: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="+57 300 123 4567"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <span className="flex items-center gap-2">
                      <span>📧</span> Email de Contacto
                    </span>
                  </label>
                  <input
                    type="email"
                    value={institutionProfile.email}
                    onChange={(e) => setInstitutionProfile({ ...institutionProfile, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="contacto@institucion.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <span className="flex items-center gap-2">
                      <span>🌐</span> Sitio Web
                    </span>
                  </label>
                  <input
                    type="url"
                    value={institutionProfile.website}
                    onChange={(e) => setInstitutionProfile({ ...institutionProfile, website: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="https://www.institucion.com"
                  />
                </div>
              </div>

              {/* Info Banner */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                <span className="text-2xl">💡</span>
                <div>
                  <p className="text-sm font-medium text-amber-800">Importante</p>
                  <p className="text-sm text-amber-700 mt-1">
                    Una vez completado este registro, tu institución aparecerá en la lista de entidades disponibles para los migrantes. Podrás gestionar tus servicios y recibir solicitudes de emergencia.
                  </p>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={savingProfile}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-xl font-semibold hover:from-green-600 hover:to-green-700 disabled:opacity-50 transition-all shadow-lg flex items-center justify-center gap-2"
              >
                {savingProfile ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Guardando...
                  </>
                ) : (
                  <>
                    <span>✓</span> Completar Registro
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  // Services Management Mode
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 bg-gradient-to-br ${getSectorColor(institutionProfile.tipo)} rounded-2xl flex items-center justify-center shadow-lg`}>
              <span className="text-3xl">{getSectorIcon(institutionProfile.tipo)}</span>
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-800">{institutionProfile.nombre}</h1>
              <p className="text-gray-600">{institutionProfile.codigo_institucion && `Código: ${institutionProfile.codigo_institucion}`}</p>
            </div>
            <button
              onClick={() => setMode('setup')}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all"
            >
              ✏️ Editar Perfil
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-md p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">🛠️</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{servicios.length}</p>
              <p className="text-sm text-gray-600">Servicios Activos</p>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">✅</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{servicios.filter(s => s.habilitado).length}</p>
              <p className="text-sm text-gray-600">Habilitados</p>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">📋</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{institutionProfile.tipo}</p>
              <p className="text-sm text-gray-600">Sector</p>
            </div>
          </div>
        </div>

        {/* Add Service Form */}
        {showServiceForm && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <span>➕</span> Agregar Nuevo Servicio
              </h2>
              <button
                onClick={() => setShowServiceForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleAddServicio} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del Servicio</label>
                  <input
                    type="text"
                    value={newServicio.nombre}
                    onChange={(e) => setNewServicio({ ...newServicio, nombre: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Ej: Consulta Médica General"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Servicio</label>
                  <select
                    value={newServicio.tipo}
                    onChange={(e) => setNewServicio({ ...newServicio, tipo: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
                <textarea
                  value={newServicio.descripcion}
                  onChange={(e) => setNewServicio({ ...newServicio, descripcion: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Describe detalladamente el servicio que ofreces..."
                  required
                />
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={submittingService}
                  className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-xl font-semibold hover:from-green-600 hover:to-green-700 disabled:opacity-50 transition-all"
                >
                  {submittingService ? 'Guardando...' : '💾 Guardar Servicio'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowServiceForm(false)}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Services List */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <span>🛠️</span> Mis Servicios
            </h2>
            <button
              onClick={() => setShowServiceForm(true)}
              className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all shadow-md flex items-center gap-2"
            >
              <span>+</span> Agregar Servicio
            </button>
          </div>

          {servicios.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">📭</span>
              </div>
              <p className="text-gray-600 mb-4">No tienes servicios registrados aún</p>
              <button
                onClick={() => setShowServiceForm(true)}
                className="text-green-600 font-semibold hover:text-green-700"
              >
                + Agregar tu primer servicio
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {servicios.map((servicio) => (
                <div key={servicio.id} className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 bg-gradient-to-br ${getSectorColor(servicio.tipo)} rounded-lg flex items-center justify-center`}>
                        <span className="text-lg">{getSectorIcon(servicio.tipo)}</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">{servicio.nombre}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          servicio.habilitado ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {servicio.habilitado ? '✅ Activo' : '❌ Inhabilitado'}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteServicio(servicio.id)}
                      className="text-red-400 hover:text-red-600 transition-colors"
                      title="Eliminar servicio"
                    >
                      🗑️
                    </button>
                  </div>
                  <p className="text-gray-600 text-sm">{servicio.descripcion}</p>
                  <p className="text-gray-400 text-xs mt-3">
                    Registrado: {new Date(servicio.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
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
