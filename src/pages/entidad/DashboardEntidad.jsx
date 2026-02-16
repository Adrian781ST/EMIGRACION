import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
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
const NovedadesEntidad = ({ hideVolver = false }) => {
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
        {!hideVolver && (
          <Link to="/entidad" className="text-blue-600 hover:text-blue-800 text-sm font-medium uppercase">← VOLVER</Link>
        )}
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
  const { userProfile, user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  // States for modals
  const [showServiciosModal, setShowServiciosModal] = useState(false)
  const [showEvaluacionesModal, setShowEvaluacionesModal] = useState(false)
  const [showPerfilModal, setShowPerfilModal] = useState(false)
  const [showEmergenciasModal, setShowEmergenciasModal] = useState(false)
  const [showNovedadesModal, setShowNovedadesModal] = useState(false)

  // States for data
  const [perfilData, setPerfilData] = useState(null)
  const [serviciosData, setServiciosData] = useState([])
  const [emergenciasData, setEmergenciasData] = useState([])
  const [evaluacionesData, setEvaluacionesData] = useState([])
  const [novedadesData, setNovedadesData] = useState([])
  const [loading, setLoading] = useState(true)
  const [editandoPerfil, setEditandoPerfil] = useState(false)
  const [perfilForm, setPerfilForm] = useState({})
  
  // Estados para chat de emergencias
  const [selectedEmergencia, setSelectedEmergencia] = useState(null)
  const [mensajes, setMensajes] = useState([])
  const [nuevoMensaje, setNuevoMensaje] = useState('')
  const chatContainerRef = useRef(null)

  // Auto-scroll to bottom when mensajes change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [mensajes])

  // Real-time subscription for messages
  useEffect(() => {
    if (!selectedEmergencia) return

    const channel = supabase
      .channel('mensajes_emergencia')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'mensajes_emergencia',
          filter: `emergencia_id=eq.${selectedEmergencia.id}`
        },
        (payload) => {
          // Fetch the complete message with usuario info
          supabase
            .from('mensajes_emergencia')
            .select('*, usuarios(nombre)')
            .eq('id', payload.new.id)
            .single()
            .then(({ data }) => {
              if (data) {
                setMensajes(prev => [...prev, data])
              }
            })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [selectedEmergencia])
  const [loadingMensajes, setLoadingMensajes] = useState(false)

  // Fetch all data on mount
  useEffect(() => {
    fetchAllData()
  }, [user])

  // Real-time subscription for new emergencias
  useEffect(() => {
    let channel

    const setupChannel = async () => {
      if (!user) return
      
      // Get entity ID
      const { data: entidadData } = await supabase
        .from('entidades')
        .select('id')
        .eq('usuario_id', user.id)
        .single()

      if (!entidadData?.id) return

      channel = supabase
        .channel('emergencias_nuevas')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'emergencias',
            filter: `entidad_id=eq.${entidadData.id}`
          },
          async (payload) => {
            // Fetch complete emergencia with usuario info
            const { data } = await supabase
              .from('emergencias')
              .select('*, usuarios(nombre, email)')
              .eq('id', payload.new.id)
              .single()
            
            if (data) {
              setEmergenciasData(prev => [data, ...prev])
              toast.success('🚨 Nueva emergencia recibida!', { 
                duration: 5000,
                style: { background: '#DC2626', color: '#fff' }
              })
            }
          }
        )
        .subscribe()
    }

    setupChannel()

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [user])

  // Refresh data when window gains focus
  useEffect(() => {
    const handleFocus = () => {
      if (user) {
        fetchAllData()
      }
    }
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [user])

  const fetchAllData = async () => {
    if (!user) return
    setLoading(true)
    try {
      // Get entity data
      const { data: entidadData } = await supabase
        .from('entidades')
        .select('*')
        .eq('usuario_id', user.id)
        .single()
      
      setPerfilData(entidadData)
      setPerfilForm(entidadData || {})

      if (entidadData) {
        // Fetch servicios (tabla: servicios_entidad)
        const { data: servicios } = await supabase
          .from('servicios_entidad')
          .select('*')
          .eq('entidad_id', entidadData.id)
          .eq('habilitado', true)
        setServiciosData(servicios || [])

        // Fetch emergencias - todas, sin filtro de estado
        const { data: emergencias } = await supabase
          .from('emergencias')
          .select('*, usuarios(nombre, email)')
          .eq('entidad_id', entidadData.id)
          .order('created_at', { ascending: false })
        setEmergenciasData(emergencias || [])

        // Fetch calificaciones (tabla correcta)
        const { data: calificaciones } = await supabase
          .from('calificaciones')
          .select('*, usuarios(nombre)')
          .eq('entidad_id', entidadData.id)
        setEvaluacionesData(calificaciones || [])
      }

      // Fetch Novedades (general, not entity-specific)
      const { data: novedades } = await supabase
        .from('novedades')
        .select('*')
        .eq('activa', true)
        .order('created_at', { ascending: false })
        .limit(20)
      setNovedadesData(novedades || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGuardarPerfil = async () => {
    try {
      const { error } = await supabase
        .from('entidades')
        .update(perfilForm)
        .eq('id', perfilData.id)
       
      if (error) throw error
      setPerfilData(perfilForm)
      setEditandoPerfil(false)
      toast.success('Perfil actualizado correctamente')
    } catch (error) {
      toast.error('Error al actualizar perfil')
    }
  }

  // Atender emergencia - cambiar estado a EN_REVISION primero, luego a ATENDIDA
  const handleAtenderEmergencia = async (emergenciaId, estadoActual) => {
    try {
      let nuevoEstado
      if (estadoActual === 'PENDIENTE') {
        nuevoEstado = 'EN_REVISION'
      } else if (estadoActual === 'EN_REVISION') {
        nuevoEstado = 'ATENDIDA'
      } else {
        return // No action for other states
      }
      
      const { error } = await supabase
        .from('emergencias')
        .update({ 
          estado: nuevoEstado,
          fecha_atencion: nuevoEstado === 'ATENDIDA' ? new Date().toISOString() : null
        })
        .eq('id', emergenciaId)
      
      if (error) throw error
      toast.success(nuevoEstado === 'EN_REVISION' ? 'Emergencia en revisión' : 'Emergencia marcada como atendida')
      fetchAllData() // Recargar datos
    } catch (error) {
      toast.error('Error al actualizar emergencia')
    }
  }

  // Abrir chat de una emergencia
  const handleAbrirChat = async (emergencia) => {
    setSelectedEmergencia(emergencia)
    setLoadingMensajes(true)
    try {
      // Obtener el estado más reciente de la emergencia
      const { data: emergenciaActual } = await supabase
        .from('emergencias')
        .select('estado')
        .eq('id', emergencia.id)
        .single()
      
      const estadoActual = emergenciaActual?.estado || emergencia.estado
      
      // Si la emergencia está pendiente o asignada, cambiar a EN_REVISION
      if (estadoActual === 'PENDIENTE' || estadoActual === 'ASIGNADA') {
        await supabase
          .from('emergencias')
          .update({ estado: 'EN_REVISION' })
          .eq('id', emergencia.id)
        
        // Enviar mensaje automático de notificación
        await supabase.from('mensajes_emergencia').insert({
          emergencia_id: emergencia.id,
          usuario_id: user.id,
          mensaje: '💬 La entidad ha iniciado la atención de tu emergencia. Estamos revisando tu caso.',
          emisor: 'ENTIDAD',
          es_notificacion: true
        })
        
        toast.info('Emergencia ahora en revisión')
        
        // Actualizar el estado local
        setSelectedEmergencia({...emergencia, estado: 'EN_REVISION'})
      }
      
      const { data } = await supabase
        .from('mensajes_emergencia')
        .select('*, usuarios(nombre)')
        .eq('emergencia_id', emergencia.id)
        .order('created_at', { ascending: true })
      setMensajes(data || [])
    } catch (error) {
      console.error('Error fetching mensajes:', error)
    } finally {
      setLoadingMensajes(false)
    }
  }

  // Enviar mensaje
  const handleEnviarMensaje = async () => {
    if (!nuevoMensaje.trim() || !selectedEmergencia) return
    try {
      // Obtener el estado más reciente de la emergencia
      const { data: emergenciaActual } = await supabase
        .from('emergencias')
        .select('estado')
        .eq('id', selectedEmergencia.id)
        .single()
      
      const estadoActual = emergenciaActual?.estado || selectedEmergencia.estado
      
      // Si la emergencia está pendiente o asignada, cambiar a EN_REVISION
      if (estadoActual === 'PENDIENTE' || estadoActual === 'ASIGNADA') {
        await supabase
          .from('emergencias')
          .update({ estado: 'EN_REVISION' })
          .eq('id', selectedEmergencia.id)
        
        // Enviar mensaje automático de notificación
        await supabase.from('mensajes_emergencia').insert({
          emergencia_id: selectedEmergencia.id,
          usuario_id: user.id,
          mensaje: '💬 La entidad ha iniciado la atención de tu emergencia. Estamos revisando tu caso.',
          emisor: 'ENTIDAD',
          es_notificacion: true
        })
      }
      
      const { error } = await supabase
        .from('mensajes_emergencia')
        .insert({
          emergencia_id: selectedEmergencia.id,
          usuario_id: user.id,
          mensaje: nuevoMensaje,
          emisor: 'ENTIDAD'
        })
      
      if (error) throw error
      setNuevoMensaje('')
      // No necesitamos llamar handleAbrirChat porque el realtime subscription añade el mensaje automáticamente
    } catch (error) {
      toast.error('Error al enviar mensaje')
    }
  }

  return (
    <div className="min-h-screen relative">
      {/* Overlay semitransparente para legibilidad */}
      <div className="absolute inset-0 bg-white/70 pointer-events-none z-10" />
      
      {/* Sector Banner */}
      <div className="relative z-20">
        <div className="bg-gradient-to-r from-green-600 via-green-500 to-teal-600 text-white py-8 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h1 className="text-3xl font-bold uppercase">
              PANEL DE {userProfile?.nombre?.toUpperCase() || 'ENTIDAD'}
            </h1>
            <p className="text-green-100 mt-2 uppercase">
              Gestiona tus servicios y emergencias
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <div onClick={() => setShowEmergenciasModal(true)} className="bg-white rounded-xl shadow-md p-4 sm:p-6 hover:shadow-lg transition-shadow text-center cursor-pointer">
            <div className="flex flex-col items-center">
              <div className="w-12 sm:w-16 h-12 sm:h-16 bg-red-100 rounded-full flex items-center justify-center mb-3">
                <span className="text-2xl sm:text-3xl">🚨</span>
              </div>
              <div>
                <h3 className="font-semibold text-green-600 uppercase text-sm sm:text-base">Emergencias</h3>
                <p className="text-gray-600 text-xs sm:text-sm">Pendientes</p>
              </div>
            </div>
          </div>

          <div onClick={() => setShowServiciosModal(true)} className="bg-white rounded-xl shadow-md p-4 sm:p-6 hover:shadow-lg transition-shadow text-center cursor-pointer">
            <div className="flex flex-col items-center">
              <div className="w-12 sm:w-16 h-12 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                <span className="text-2xl sm:text-3xl">🛠️</span>
              </div>
              <div>
                <h3 className="font-semibold text-green-600 uppercase text-sm sm:text-base">Servicios</h3>
                <p className="text-gray-600 text-xs sm:text-sm">Activos</p>
              </div>
            </div>
          </div>

          <div onClick={() => setShowEvaluacionesModal(true)} className="bg-white rounded-xl shadow-md p-4 sm:p-6 hover:shadow-lg transition-shadow text-center cursor-pointer">
            <div className="flex flex-col items-center">
              <div className="w-12 sm:w-16 h-12 sm:h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-3">
                <span className="text-2xl sm:text-3xl">⭐</span>
              </div>
              <div>
                <h3 className="font-semibold text-green-600 uppercase text-sm sm:text-base">Evaluaciones</h3>
                <p className="text-gray-600 text-xs sm:text-sm">Calificaciones</p>
              </div>
            </div>
          </div>

          <div onClick={() => setShowPerfilModal(true)} className="bg-white rounded-xl shadow-md p-4 sm:p-6 hover:shadow-lg transition-shadow text-center cursor-pointer">
            <div className="flex flex-col items-center">
              <div className="w-12 sm:w-16 h-12 sm:h-16 bg-purple-100 rounded-full flex items-center justify-center mb-3">
                <span className="text-2xl sm:text-3xl">👤</span>
              </div>
              <div>
                <h3 className="font-semibold text-green-600 uppercase text-sm sm:text-base">Perfil</h3>
                <p className="text-gray-600 text-xs sm:text-sm">Información</p>
              </div>
            </div>
          </div>
        </div>

        {/* Novedades Section - Always visible in main panel */}
        <div className="mb-8">
          <NovedadesEntidad hideVolver={true} />
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Estadísticas Rápidas</h2>
          <div className="grid grid-cols-3 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-600 text-sm">Emergencias</p>
              <p className="text-3xl font-bold text-gray-800">{emergenciasData.length}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-600 text-sm">Servicios</p>
              <p className="text-3xl font-bold text-gray-800">{serviciosData.length}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-600 text-sm">Calificación</p>
              <p className="text-3xl font-bold text-gray-800">{evaluacionesData.length > 0 ? (evaluacionesData.reduce((a, b) => a + b.calificacion, 0) / evaluacionesData.length).toFixed(1) : '0'} ⭐</p>
            </div>
          </div>
        </div>
        </div>
      </div>

      {/* ==================== MODALES ==================== */}
      
      {/* Modal Emergencias */}
      {showEmergenciasModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => { setShowEmergenciasModal(false); setSelectedEmergencia(null); }}>
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-red-600">🚨 Emergencias</h2>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => {
                    // Refresh emergencias
                    supabase
                      .from('emergencias')
                      .select('*, usuarios(nombre, email)')
                      .eq('entidad_id', userProfile?.id)
                      .order('created_at', { ascending: false })
                      .then(({ data }) => setEmergenciasData(data || []))
                  }} 
                  className="text-gray-500 hover:text-gray-700 text-xl"
                  title="Actualizar"
                >
                  🔄
                </button>
                <button onClick={() => { setShowEmergenciasModal(false); setSelectedEmergencia(null); }} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
              </div>
            </div>
            
            {/* Chat - si hay emergencia seleccionada */}
            {selectedEmergencia ? (
              <div className="border rounded-lg mb-4">
                <div className="bg-gray-100 p-2 flex justify-between items-center">
                  <span className="font-medium">Chat con Migrante</span>
                  <button onClick={() => setSelectedEmergencia(null)} className="text-sm text-blue-600">← Volver</button>
                </div>
                <div ref={chatContainerRef} className="h-48 overflow-y-auto p-3 space-y-2 bg-white">
                  {loadingMensajes ? (
                    <p className="text-center text-gray-500">Cargando...</p>
                  ) : mensajes.length === 0 ? (
                    <p className="text-center text-gray-500">No hay mensajes. Inicia la conversación.</p>
                  ) : (
                    mensajes.map(msg => (
                      msg.es_notificacion ? (
                        <div key={msg.id} className="p-3 rounded-lg bg-yellow-50 border border-yellow-200 text-center my-2">
                          <p className="text-sm text-yellow-800">{msg.mensaje}</p>
                          <p className="text-xs text-yellow-600">{new Date(msg.created_at).toLocaleString()}</p>
                        </div>
                      ) : (
                        <div key={msg.id} className={`p-2 rounded-lg ${msg.emisor === 'ENTIDAD' ? 'bg-blue-100 ml-8' : 'bg-gray-100 mr-8'}`}>
                          <p className="text-sm">{msg.mensaje}</p>
                          <p className="text-xs text-gray-500">{new Date(msg.created_at).toLocaleString()}</p>
                        </div>
                      )
                    ))
                  )}
                </div>
                <div className="p-2 border-t flex gap-2">
                  <input
                    type="text"
                    value={nuevoMensaje}
                    onChange={e => setNuevoMensaje(e.target.value)}
                    placeholder="Escribe un mensaje..."
                    className="flex-1 border rounded px-3 py-1 text-sm"
                    onKeyPress={e => e.key === 'Enter' && handleEnviarMensaje()}
                  />
                  <button onClick={handleEnviarMensaje} className="bg-blue-500 text-white px-3 py-1 rounded text-sm">Enviar</button>
                </div>
              </div>
            ) : (
              /* Lista de emergencias */
              <>
                {loading ? <p>Cargando...</p> : emergenciasData.length === 0 ? (
                  <p className="text-gray-600">No hay emergencias registradas.</p>
                ) : (
                  <div className="space-y-3">
                    {emergenciasData.map(emp => (
                      <div key={emp.id} className={`border rounded-lg p-3 ${emp.estado === 'ATENDIDA' ? 'bg-green-50' : emp.estado === 'EN_REVISION' ? 'bg-yellow-50' : 'bg-red-50'}`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{emp.descripcion}</p>
                            <p className="text-sm text-gray-500">Tipo: {emp.tipo}</p>
                            <p className="text-sm text-gray-500">Estado: <span className={`font-medium ${emp.estado === 'ATENDIDA' ? 'text-green-600' : emp.estado === 'EN_REVISION' ? 'text-yellow-600' : 'text-red-600'}`}>{emp.estado}</span></p>
                            <p className="text-sm text-gray-500">Fecha: {new Date(emp.created_at).toLocaleDateString()}</p>
                            {emp.usuarios && <p className="text-sm text-gray-500">Migrante: {emp.usuarios.nombre}</p>}
                          </div>
                          <div className="flex flex-col gap-2">
                            {emp.estado !== 'ATENDIDA' && (
                              <button 
                                onClick={() => handleAtenderEmergencia(emp.id, emp.estado)}
                                className="bg-green-500 text-white px-3 py-1 rounded text-xs hover:bg-green-600"
                              >
                                {emp.estado === 'EN_REVISION' ? '✓ Finalizar' : '✓ Atender'}
                              </button>
                            )}
                            <button 
                              onClick={() => handleAbrirChat(emp)}
                              className="bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600"
                            >
                              💬 Chat
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Modal Servicios */}
      {showServiciosModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowServiciosModal(false)}>
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-blue-600">🛠️ Servicios</h2>
              <button onClick={() => setShowServiciosModal(false)} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
            </div>
            {loading ? <p>Cargando...</p> : serviciosData.length === 0 ? (
              <p className="text-gray-600">No hay servicios activos.</p>
            ) : (
              <div className="space-y-3">
                {serviciosData.map(serv => (
                  <div key={serv.id} className="border rounded-lg p-3 bg-blue-50">
                    <p className="font-medium">{serv.nombre}</p>
                    <p className="text-sm text-gray-600">{serv.descripcion}</p>
                    <p className="text-sm text-gray-500">Estado: {serv.estado}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Evaluaciones */}
      {showEvaluacionesModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowEvaluacionesModal(false)}>
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-yellow-600">⭐ Evaluaciones</h2>
              <button onClick={() => setShowEvaluacionesModal(false)} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
            </div>
            {loading ? <p>Cargando...</p> : evaluacionesData.length === 0 ? (
              <p className="text-gray-600">No hay evaluaciones.</p>
            ) : (
              <div className="space-y-3">
                {evaluacionesData.map(eval_ => (
                  <div key={eval_.id} className="border rounded-lg p-3 bg-yellow-50">
                    <div className="flex justify-between">
                      <p className="font-medium">Calificación: {eval_.calificacion}/5 ⭐</p>
                    </div>
                    <p className="text-sm text-gray-600">{eval_.comentario}</p>
                    <p className="text-xs text-gray-500">{new Date(eval_.created_at).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Novedades */}
      {showNovedadesModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowNovedadesModal(false)}>
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-cyan-600">📋 Novedades</h2>
              <button onClick={() => setShowNovedadesModal(false)} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
            </div>
            {loading ? <p>Cargando...</p> : novedadesData.length === 0 ? (
              <p className="text-gray-600">No hay novedades.</p>
            ) : (
              <div className="space-y-3">
                {novedadesData.map(novedad => (
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
        </div>
      )}

      {/* Modal Perfil */}
      {showPerfilModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowPerfilModal(false)}>
          <div className="bg-white rounded-xl max-w-lg w-full p-6 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-purple-600">👤 Perfil</h2>
              <button onClick={() => setShowPerfilModal(false)} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
            </div>
            
            {loading ? (
              <p>Cargando...</p>
            ) : editandoPerfil ? (
              // Modo edición
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nombre</label>
                  <input
                    type="text"
                    value={perfilForm?.nombre || ''}
                    onChange={e => setPerfilForm({...perfilForm, nombre: e.target.value})}
                    className="mt-1 block w-full border rounded-md p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tipo</label>
                  <input
                    type="text"
                    value={perfilForm?.tipo || ''}
                    onChange={e => setPerfilForm({...perfilForm, tipo: e.target.value})}
                    className="mt-1 block w-full border rounded-md p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Dirección</label>
                  <input
                    type="text"
                    value={perfilForm?.direccion || ''}
                    onChange={e => setPerfilForm({...perfilForm, direccion: e.target.value})}
                    className="mt-1 block w-full border rounded-md p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                  <input
                    type="text"
                    value={perfilForm?.telefono || ''}
                    onChange={e => setPerfilForm({...perfilForm, telefono: e.target.value})}
                    className="mt-1 block w-full border rounded-md p-2"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button onClick={handleGuardarPerfil} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">Guardar</button>
                  <button onClick={() => setEditandoPerfil(false)} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">Cancelar</button>
                </div>
              </div>
            ) : (
              // Modo visualización
              <div className="space-y-3">
                <div className="p-3 bg-gray-50 rounded">
                  <p className="text-sm text-gray-500">Nombre</p>
                  <p className="font-medium">{perfilData?.nombre || 'No definido'}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded">
                  <p className="text-sm text-gray-500">Tipo</p>
                  <p className="font-medium">{perfilData?.tipo || 'No definido'}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded">
                  <p className="text-sm text-gray-500">Dirección</p>
                  <p className="font-medium">{perfilData?.direccion || 'No definido'}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded">
                  <p className="text-sm text-gray-500">Teléfono</p>
                  <p className="font-medium">{perfilData?.telefono || 'No definido'}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded">
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{user?.email}</p>
                </div>
                <button onClick={() => setEditandoPerfil(true)} className="w-full bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 mt-2">
                  ✏️ Editar Perfil
                </button>
              </div>
            )}
          </div>
        </div>
      )}

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

  const handleAtender = async (id, estadoActual) => {
    try {
      let nuevoEstado
      if (estadoActual === 'PENDIENTE') {
        nuevoEstado = 'EN_REVISION'
      } else if (estadoActual === 'EN_REVISION') {
        nuevoEstado = 'ATENDIDA'
      } else {
        return
      }
      
      const { error } = await supabase
        .from('emergencias')
        .update({ 
          estado: nuevoEstado,
          fecha_atencion: nuevoEstado === 'ATENDIDA' ? new Date().toISOString() : null
        })
        .eq('id', id)

      if (error) throw error

      toast.success(nuevoEstado === 'EN_REVISION' ? 'Emergencia en revisión' : 'Emergencia marcada como atendida')
      fetchEmergencias()
    } catch (error) {
      toast.error(error.message || 'Error al actualizar emergencia')
    }
  }

  const handleAtenderDesdeModal = async (id, estadoActual) => {
    try {
      let nuevoEstado
      if (estadoActual === 'PENDIENTE') {
        nuevoEstado = 'EN_REVISION'
      } else if (estadoActual === 'EN_REVISION') {
        nuevoEstado = 'ATENDIDA'
      } else {
        return
      }
      
      const { error } = await supabase
        .from('emergencias')
        .update({ 
          estado: nuevoEstado,
          fecha_atencion: nuevoEstado === 'ATENDIDA' ? new Date().toISOString() : null
        })
        .eq('id', id)

      if (error) throw error

      toast.success(nuevoEstado === 'EN_REVISION' ? 'Emergencia en revisión' : 'Emergencia marcada como atendida')
      fetchTodasEmergencias()
    } catch (error) {
      toast.error(error.message || 'Error al actualizar emergencia')
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
        <div className="flex items-center mb-6">
          <Link to="/entidad" className="flex items-center text-blue-600 hover:text-blue-800 transition-colors">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            VOLVER
          </Link>
        </div>
        <h1 className="text-2xl font-bold text-green-600 mb-8">EMERGENCIAS ASIGNADAS</h1>
        
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
                      onClick={() => handleAtender(emergencia.id, emergencia.estado)}
                      className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 text-sm"
                    >
                      {emergencia.estado === 'EN_REVISION' ? 'Finalizar' : 'Atender'}
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
  
  // Emergencias state
  const [emergenciasAsignadas, setEmergenciasAsignadas] = useState([])
  const [loadingEmergencias, setLoadingEmergencias] = useState(true)
  const [showEvaluacionesModal, setShowEvaluacionesModal] = useState(false)
  const [showPerfilModal, setShowPerfilModal] = useState(false)
  const [showEmergenciasModal, setShowEmergenciasModal] = useState(false)
  const [showServiciosModal, setShowServiciosModal] = useState(false)
  const [evaluaciones, setEvaluaciones] = useState([])
  const [todasEmergencias, setTodasEmergencias] = useState([])
  const [mostrarTodasEmergencias, setMostrarTodasEmergencias] = useState(false)
  const [activeTab, setActiveTab] = useState('inicio') // 'inicio', 'servicios' or 'emergencias'
  const navigate = useNavigate()

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
          fetchEmergenciasAsignadas()
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

  const fetchEmergenciasAsignadas = async () => {
    try {
      const { data: entidadData } = await supabase
        .from('entidades')
        .select('id')
        .eq('usuario_id', user.id)
        .single()

      if (entidadData) {
        const { data, error } = await supabase
          .from('emergencias')
          .select('*, usuarios(nombre, email)')
          .eq('entidad_id', entidadData.id)
          .neq('estado', 'ATENDIDA')
          .order('created_at', { ascending: false })

        if (error) throw error
        setEmergenciasAsignadas(data || [])
      }
    } catch (error) {
      console.error('Error fetching emergencias asignadas:', error)
    } finally {
      setLoadingEmergencias(false)
    }
  }

  const fetchEvaluaciones = async () => {
    try {
      const { data: entidadData } = await supabase
        .from('entidades')
        .select('id')
        .eq('usuario_id', user.id)
        .single()

      if (entidadData) {
        const { data, error } = await supabase
          .from('calificaciones')
          .select('*, usuarios(nombre)')
          .eq('entidad_id', entidadData.id)
          .order('created_at', { ascending: false })

        if (error) throw error
        setEvaluaciones(data || [])
      }
    } catch (error) {
      console.error('Error fetching evaluaciones:', error)
    }
  }

  const fetchTodasEmergencias = async () => {
    try {
      const { data: entidadData } = await supabase
        .from('entidades')
        .select('id')
        .eq('usuario_id', user.id)
        .single()

      if (entidadData) {
        const { data, error } = await supabase
          .from('emergencias')
          .select('*, usuarios(nombre, email)')
          .eq('entidad_id', entidadData.id)
          .order('created_at', { ascending: false })

        if (error) throw error
        setTodasEmergencias(data || [])
      }
    } catch (error) {
      console.error('Error fetching emergencias:', error)
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 py-4 sm:py-8">
      <div className="max-w-7xl mx-auto px-3 sm:px-4">
        {/* Header */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <div className={`w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br ${getSectorColor(institutionProfile.tipo)} rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0`}>
              <span className="text-2xl sm:text-3xl">{getSectorIcon(institutionProfile.tipo)}</span>
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800 truncate">{institutionProfile.nombre}</h1>
              <p className="text-gray-600 text-sm">{institutionProfile.codigo_institucion && `Código: ${institutionProfile.codigo_institucion}`}</p>
            </div>
          </div>
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-8">
          <Link to="/entidad" state={{ tab: 'emergencias' }} onClick={(e) => { e.preventDefault(); setActiveTab('emergencias'); }} className={`bg-white rounded-lg sm:rounded-xl shadow-md p-3 sm:p-4 hover:shadow-lg transition-shadow cursor-pointer ${activeTab === 'emergencias' ? 'ring-2 ring-blue-500' : ''}`}>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-xl sm:text-2xl">🚨</span>
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-blue-600 text-xs sm:text-sm uppercase tracking-wide break-words">Emergencias</h3>
                <p className="text-gray-600 text-xs break-words">{emergenciasAsignadas?.length || 0} pendientes</p>
              </div>
            </div>
          </Link>

          <Link to="/entidad" state={{ tab: 'servicios' }} onClick={(e) => { e.preventDefault(); setActiveTab('servicios'); }} className={`bg-white rounded-lg sm:rounded-xl shadow-md p-3 sm:p-4 hover:shadow-lg transition-shadow cursor-pointer ${activeTab === 'servicios' ? 'ring-2 ring-green-500' : ''}`}>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-xl sm:text-2xl">🛠️</span>
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-blue-600 text-xs sm:text-sm uppercase tracking-wide break-words">Servicios</h3>
                <p className="text-gray-600 text-xs break-words">{servicios?.length || 0} activos</p>
              </div>
            </div>
          </Link>

          <Link to="/entidad/evaluaciones" onClick={(e) => { e.preventDefault(); fetchEvaluaciones(); setShowEvaluacionesModal(true); }} className="bg-white rounded-lg sm:rounded-xl shadow-md p-3 sm:p-4 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-xl sm:text-2xl">⭐</span>
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-blue-600 text-xs sm:text-sm uppercase tracking-wide break-words">Evaluaciones</h3>
                <p className="text-gray-600 text-xs break-words">Ver todas</p>
              </div>
            </div>
          </Link>

          <Link to="/perfil" onClick={(e) => { e.preventDefault(); setShowPerfilModal(true); }} className="bg-white rounded-lg sm:rounded-xl shadow-md p-3 sm:p-4 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-xl sm:text-2xl">👤</span>
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-blue-600 text-xs sm:text-sm uppercase tracking-wide break-words">Perfil</h3>
                <p className="text-gray-600 text-xs break-words">Editar</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Emergencias Asignadas Section */}
        {emergenciasAsignadas?.length > 0 && (
          <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl shadow-lg p-4 mb-4 sm:mb-8">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg sm:text-xl font-bold text-green-600 uppercase flex items-center gap-2">
                <span>🚨</span> EMERGENCIAS ASIGNADAS
              </h2>
              <div className="flex items-center gap-2">
                <Link to="/entidad" className="text-white/80 hover:text-white text-xs sm:text-sm">
                  VER TODAS →
                </Link>
              </div>
            </div>
            <div className="grid gap-2">
              {emergenciasAsignadas?.slice(0, 3).map((emergencia) => (
                <div key={emergencia.id} className="bg-white/10 backdrop-blur-sm rounded-lg p-3 flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-sm truncate">{emergencia.usuarios?.nombre}</p>
                    <p className="text-white/70 text-xs truncate">{emergencia.descripcion}</p>
                  </div>
                  <span className="text-white/80 text-xs ml-2 flex-shrink-0">
                    {new Date(emergencia.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-8">
          <Link to="/entidad" state={{ tab: 'servicios' }} onClick={(e) => { e.preventDefault(); setActiveTab('servicios'); }}
            className="bg-white rounded-lg sm:rounded-xl shadow-md p-3 sm:p-4 flex items-center gap-2 sm:gap-3 cursor-pointer hover:shadow-lg transition-shadow"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-xl sm:text-2xl">🛠️</span>
            </div>
            <div className="min-w-0">
              <p className="text-xl sm:text-2xl font-bold text-gray-800">{servicios?.length || 0}</p>
              <p className="text-gray-600 text-xs sm:text-sm truncate">Servicios</p>
            </div>
          </Link>
          <Link to="/entidad" state={{ tab: 'emergencias' }} onClick={(e) => { e.preventDefault(); setActiveTab('emergencias'); }}
            className="bg-white rounded-lg sm:rounded-xl shadow-md p-3 sm:p-4 flex items-center gap-2 sm:gap-3 cursor-pointer hover:shadow-lg transition-shadow"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-xl sm:text-2xl">🚨</span>
            </div>
            <div className="min-w-0">
              <p className="text-xl sm:text-2xl font-bold text-gray-800">{emergenciasAsignadas?.length || 0}</p>
              <p className="text-gray-600 text-xs sm:text-sm truncate">Emergencias</p>
            </div>
          </Link>
          <div className="bg-white rounded-lg sm:rounded-xl shadow-md p-3 sm:p-4 flex items-center gap-2 sm:gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-xl sm:text-2xl">📋</span>
            </div>
            <div className="min-w-0">
              <p className="text-xl sm:text-2xl font-bold text-gray-800">{institutionProfile.tipo}</p>
              <p className="text-gray-600 text-xs sm:text-sm truncate">Sector</p>
            </div>
          </div>
        </div>

        {/* Evaluaciones Modal */}
        {showEvaluacionesModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-green-600 uppercase tracking-wide">MIS EVALUACIONES</h2>
                  <button onClick={() => setShowEvaluacionesModal(false)} className="text-gray-400 hover:text-gray-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                {evaluaciones.length === 0 ? (
                  <p className="text-gray-600 text-center py-8">No hay evaluaciones aún</p>
                ) : (
                  <div className="space-y-3">
                    {evaluaciones.map((evaluacion) => (
                      <div key={evaluacion.id} className="border border-gray-200 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-gray-800">{evaluacion.usuarios?.nombre}</span>
                          <span className="text-yellow-500">{'★'.repeat(evaluacion.calificacion)}</span>
                        </div>
                        <p className="text-gray-600 text-sm">{evaluacion.comentario}</p>
                        <p className="text-gray-400 text-xs mt-2">{new Date(evaluacion.created_at).toLocaleDateString()}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Emergencias Modal */}
        {showEmergenciasModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-green-600 uppercase tracking-wide">MIS EMERGENCIAS</h2>
                  <button onClick={() => setShowEmergenciasModal(false)} className="text-gray-400 hover:text-gray-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                {todasEmergencias.length === 0 ? (
                  <p className="text-gray-600 text-center py-8">No hay emergencias registradas</p>
                ) : (
                  <div className="space-y-3">
                    {todasEmergencias.map((emergencia) => (
                      <div key={emergencia.id} className={`border-2 rounded-lg p-3 ${emergencia.prioridad === 'URGENTE' ? 'border-red-500 bg-red-50' : emergencia.prioridad === 'NORMAL' ? 'border-gray-300 bg-gray-50' : 'border-blue-200 bg-blue-50'}`}>
                        <div className="flex items-center justify-between mb-2 flex-wrap gap-1">
                          <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-0.5 rounded">{emergencia.tipo}</span>
                          <span className={`text-xs font-medium px-2 py-0.5 rounded ${emergencia.estado === 'ATENDIDA' ? 'bg-green-100 text-green-800' : emergencia.estado === 'EN_REVISION' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>{emergencia.estado}</span>
                          <span className={`text-xs font-medium px-2 py-0.5 rounded ${emergencia.prioridad === 'URGENTE' ? 'bg-red-600 text-white' : emergencia.prioridad === 'NORMAL' ? 'bg-gray-500 text-white' : 'bg-blue-500 text-white'}`}>{emergencia.prioridad}</span>
                        </div>
                        <p className="text-gray-800 text-sm mb-2">{emergencia.descripcion}</p>
                        {emergencia.direccion && (
                          <p className="text-gray-600 text-xs mb-2">📍 {emergencia.direccion}</p>
                        )}
                        <div className="border-t border-gray-200 pt-2 mt-2">
                          <p className="text-xs text-gray-500">Solicitante: {emergencia.usuarios?.nombre}</p>
                          <p className="text-xs text-gray-400">{new Date(emergencia.created_at).toLocaleString()}</p>
                        </div>
                        {emergencia.estado !== 'ATENDIDA' && (
                          <button
                            onClick={() => handleAtenderDesdeModal(emergencia.id)}
                            className="mt-3 w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                          >
                            ✅ Marcar como atendida
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Perfil Modal */}
        {showPerfilModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-green-600 uppercase tracking-wide">MI PERFIL</h2>
                  <button onClick={() => setShowPerfilModal(false)} className="text-gray-400 hover:text-gray-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 bg-gradient-to-br ${getSectorColor(institutionProfile.tipo)} rounded-2xl flex items-center justify-center`}>
                      <span className="text-3xl">{getSectorIcon(institutionProfile.tipo)}</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">{institutionProfile.nombre}</h3>
                      <p className="text-gray-600">{institutionProfile.codigo_institucion}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-gray-500 text-xs uppercase">Sector</p>
                      <p className="font-semibold">{institutionProfile.tipo}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs uppercase">Teléfono</p>
                      <p className="font-semibold">{institutionProfile.telefono || 'No registrado'}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-gray-500 text-xs uppercase">Email</p>
                      <p className="font-semibold">{institutionProfile.email || 'No registrado'}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-gray-500 text-xs uppercase">Dirección</p>
                      <p className="font-semibold">{institutionProfile.direccion || 'No registrada'}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => { setShowPerfilModal(false); setMode('setup'); }}
                    className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all"
                  >
                    EDITAR PERFIL
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Servicios Modal */}
        {showServiciosModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-green-600 uppercase tracking-wide">MIS SERVICIOS</h2>
                  <button onClick={() => setShowServiciosModal(false)} className="text-gray-400 hover:text-gray-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <button
                  onClick={() => { setShowServiciosModal(false); setShowServiceForm(true); }}
                  className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition-all mb-4"
                >
                  ➕ AGREGAR SERVICIO
                </button>
                {servicios.length === 0 ? (
                  <p className="text-gray-600 text-center py-8">No hay servicios registrados</p>
                ) : (
                  <div className="space-y-3">
                    {servicios.map((servicio) => (
                      <div key={servicio.id} className="border border-gray-200 rounded-lg p-3 flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg">{getTipoServicioIcon(servicio.tipo)}</span>
                            <span className="font-semibold text-gray-800">{servicio.nombre}</span>
                          </div>
                          <p className="text-gray-600 text-sm">{servicio.descripcion}</p>
                          <p className="text-gray-500 text-xs mt-1">{servicio.tipo}</p>
                        </div>
                        <button
                          onClick={() => handleDeleteServicio(servicio.id)}
                          className="text-red-500 hover:text-red-700 p-2"
                          title="Eliminar servicio"
                        >
                          🗑️
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Add Service Form */}
        {showServiceForm && (
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 mb-4 sm:mb-8 animate-fade-in">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-green-600 flex items-center gap-2">
                <span>➕</span> AGREGAR SERVICIO
              </h2>
              <button
                onClick={() => setShowServiceForm(false)}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleAddServicio} className="space-y-3 sm:space-y-4">
              <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">Nombre</label>
                  <input
                    type="text"
                    value={newServicio.nombre}
                    onChange={(e) => setNewServicio({ ...newServicio, nombre: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
                    placeholder="Ej: Consulta Médica"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">Tipo</label>
                  <select
                    value={newServicio.tipo}
                    onChange={(e) => setNewServicio({ ...newServicio, tipo: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
                  >
                    <option value="SALUD">Salud</option>
                    <option value="EDUCACION">Educación</option>
                    <option value="LEGAL">Legal</option>
                    <option value="VIVIENDA">Vivienda</option>
                    <option value="EMPLEO">Empleo</option>
                    <option value="ALIMENTACION">Alimentación</option>
                    <option value="OTROS">Otros</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">Descripción</label>
                <textarea
                  value={newServicio.descripcion}
                  onChange={(e) => setNewServicio({ ...newServicio, descripcion: e.target.value })}
                  rows={2}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
                  placeholder="Describe el servicio..."
                  required
                />
              </div>
              <div className="flex gap-2 sm:gap-4">
                <button
                  type="submit"
                  disabled={submittingService}
                  className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-2 sm:py-3 rounded-lg sm:rounded-xl font-semibold hover:from-green-600 hover:to-green-700 disabled:opacity-50 transition-all text-sm sm:text-base"
                >
                  {submittingService ? 'Guardando...' : '💾 GUARDAR'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowServiceForm(false)}
                  className="px-4 sm:px-6 py-2 sm:py-3 bg-gray-100 text-gray-700 rounded-lg sm:rounded-xl font-semibold hover:bg-gray-200 transition-all text-sm sm:text-base"
                >
                  CANCELAR
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Contenido basado en la pestaña activa */}
        {activeTab === 'inicio' && (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Bienvenido al Panel de Entidad</h2>
            <p className="text-gray-600 mb-6">Selecciona una opción del menú superior o haz clic en las tarjetas para ver tus servicios y emergencias.</p>
            <div className="flex justify-center gap-4">
              <div onClick={() => setActiveTab('servicios')} className="bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors cursor-pointer">
                Ver Servicios
              </div>
              <div onClick={() => setActiveTab('emergencias')} className="bg-red-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors cursor-pointer">
                Ver Emergencias
              </div>
            </div>
          </div>
        )}
        {activeTab === 'servicios' && (
          <>
          {/* Services List */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-semibold text-green-600 flex items-center gap-2">
              <span>🛠️</span> MIS SERVICIOS
            </h2>
            <button
              onClick={() => setShowServiceForm(true)}
              className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg sm:rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all shadow-md flex items-center gap-2 text-sm sm:text-base"
            >
              <span>+</span> AGREGAR
            </button>
          </div>

          {servicios?.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <span className="text-3xl sm:text-4xl">📭</span>
              </div>
              <p className="text-gray-600 mb-3 sm:mb-4 text-sm sm:text-base">No tienes servicios registrados</p>
              <button
                onClick={() => setShowServiceForm(true)}
                className="text-green-600 font-semibold hover:text-green-700 text-sm sm:text-base"
              >
                + AGREGAR TU PRIMER SERVICIO
              </button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
              {servicios.map((servicio) => (
                <div key={servicio.id} className="border border-gray-200 rounded-lg sm:rounded-xl p-3 sm:p-5 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2 sm:mb-3">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className={`w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br ${getSectorColor(servicio.tipo)} rounded-lg flex items-center justify-center flex-shrink-0`}>
                        <span className="text-sm sm:text-lg">{getSectorIcon(servicio.tipo)}</span>
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-800 text-sm sm:text-base truncate">{servicio.nombre}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full inline-block ${servicio.habilitado ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {servicio.habilitado ? '✅ ACTIVO' : '❌ INHABILITADO'}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteServicio(servicio.id)}
                      className="text-red-400 hover:text-red-600 transition-colors flex-shrink-0"
                      title="Eliminar"
                    >
                      🗑️
                    </button>
                  </div>
                  <p className="text-gray-600 text-xs sm:text-sm line-clamp-2">{servicio.descripcion}</p>
                  <p className="text-gray-400 text-xs mt-2">
                    {new Date(servicio.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
        </>
        )}

        {/* Todas las Emergencias - Vista completa como MIS SERVICIOS */}
        {mostrarTodasEmergencias && (
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-green-600 flex items-center gap-2">
                <span>🚨</span> MIS EMERGENCIAS
              </h2>
              <button
                onClick={() => setMostrarTodasEmergencias(false)}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-all text-sm"
              >
                ← VOLVER
              </button>
            </div>

            {todasEmergencias.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <span className="text-3xl sm:text-4xl">✅</span>
                </div>
                <p className="text-gray-600 mb-3 sm:mb-4 text-sm sm:text-base">No tienes emergencias asignadas</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                {todasEmergencias.map((emergencia) => (
                  <div key={emergencia.id} className={`border-2 rounded-lg sm:rounded-xl p-3 sm:p-5 ${emergencia.prioridad === 'URGENTE' ? 'border-red-500 bg-red-50' : emergencia.prioridad === 'NORMAL' ? 'border-gray-300 bg-gray-50' : 'border-blue-200 bg-blue-50'}`}>
                    <div className="flex justify-between items-start mb-2 sm:mb-3">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${emergencia.prioridad === 'URGENTE' ? 'bg-red-500' : emergencia.prioridad === 'NORMAL' ? 'bg-gray-400' : 'bg-blue-400'}`}>
                          <span className="text-sm sm:text-lg">🚨</span>
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-gray-800 text-sm sm:text-base truncate">{emergencia.tipo}</h3>
                          <div className="flex flex-wrap gap-1 mt-1">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${emergencia.estado === 'ATENDIDA' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                              {emergencia.estado}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${emergencia.prioridad === 'URGENTE' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-800'}`}>
                              {emergencia.prioridad}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-600 text-xs sm:text-sm line-clamp-2 mb-2">{emergencia.descripcion}</p>
                    {emergencia.direccion && (
                      <p className="text-gray-500 text-xs sm:text-sm mb-2">📍 {emergencia.direccion}</p>
                    )}
                    <div className="border-t border-gray-200 pt-2 mt-2">
                      <p className="text-xs text-gray-500">Solicitante: {emergencia.usuarios?.nombre}</p>
                      <p className="text-gray-400 text-xs">
                        {new Date(emergencia.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'emergencias' && (
          <>
          {/* Emergencias List */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-green-600 flex items-center gap-2">
                <span>🚨</span> MIS EMERGENCIAS
              </h2>
            </div>

            {emergenciasAsignadas?.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <span className="text-3xl sm:text-4xl">✅</span>
                </div>
                <p className="text-gray-600 mb-3 sm:mb-4 text-sm sm:text-base">No tienes emergencias asignadas</p>
              </div>
            ) : (
              <div className="space-y-3">
                {emergenciasAsignadas?.map((emergencia) => (
                  <div key={emergencia.id} className={`border-2 rounded-lg sm:rounded-xl p-3 sm:p-5 ${emergencia.prioridad === 'URGENTE' ? 'border-red-500 bg-red-50' : emergencia.prioridad === 'NORMAL' ? 'border-gray-300 bg-gray-50' : 'border-blue-200 bg-blue-50'}`}>
                    <div className="flex justify-between items-start mb-2 sm:mb-3 flex-wrap gap-2">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${emergencia.prioridad === 'URGENTE' ? 'bg-red-500' : emergencia.prioridad === 'NORMAL' ? 'bg-gray-400' : 'bg-blue-400'}`}>
                          <span className="text-sm sm:text-lg">🚨</span>
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-gray-800 text-sm sm:text-base truncate">{emergencia.tipo}</h3>
                          <div className="flex flex-wrap gap-1 mt-1">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${emergencia.estado === 'ATENDIDA' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                              {emergencia.estado}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${emergencia.prioridad === 'URGENTE' ? 'bg-red-600 text-white' : emergencia.prioridad === 'NORMAL' ? 'bg-gray-500 text-white' : 'bg-blue-500 text-white'}`}>
                              {emergencia.prioridad}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-600 text-xs sm:text-sm line-clamp-2 mb-2">{emergencia.descripcion}</p>
                    {emergencia.direccion && (
                      <p className="text-gray-500 text-xs sm:text-sm mb-2">📍 {emergencia.direccion}</p>
                    )}
                    <div className="border-t border-gray-200 pt-2 mt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div>
                        <p className="text-xs text-gray-500">Solicitante: {emergencia.usuarios?.nombre}</p>
                        <p className="text-gray-400 text-xs">
                          {new Date(emergencia.created_at).toLocaleString()}
                        </p>
                      </div>
                      {emergencia.estado !== 'ATENDIDA' && (
                        <button
                          onClick={() => handleAtender(emergencia.id, emergencia.estado)}
                          className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 text-sm"
                        >
                          {emergencia.estado === 'EN_REVISION' ? '✅ FINALIZAR' : '✅ ATENDER'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          </>
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
          <p className="text-4xl font-bold text-yellow-500">{promedio || 0} ⭐</p>
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
