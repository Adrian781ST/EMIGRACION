import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'

const DashboardMigrante = () => {
  const { userProfile, user } = useAuth()

  // States for modals
  const [showEmergenciasModal, setShowEmergenciasModal] = useState(false)
  const [showServiciosModal, setShowServiciosModal] = useState(false)
  const [showPerfilModal, setShowPerfilModal] = useState(false)
  const [showEvaluacionesModal, setShowEvaluacionesModal] = useState(false)

  // States for data
  const [misEmergencias, setMisEmergencias] = useState([])
  const [serviciosData, setServiciosData] = useState([])
  const [perfilData, setPerfilData] = useState(null)
  const [evaluacionesData, setEvaluacionesData] = useState([])
  const [loading, setLoading] = useState(true)
  const [editandoPerfil, setEditandoPerfil] = useState(false)
  const [perfilForm, setPerfilForm] = useState({})

  // Estados para emergencias
  const [selectedEmergencia, setSelectedEmergencia] = useState(null)
  const [mensajes, setMensajes] = useState([])
  const [nuevoMensaje, setNuevoMensaje] = useState('')
  const mensajesEndRef = useRef(null)
  const chatContainerRef = useRef(null)
  const [novedades, setNovedades] = useState([])

  // Auto-scroll to bottom when mensajes change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [mensajes])
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
                // Scroll al final cuando llega un nuevo mensaje
                setTimeout(() => {
                  mensajesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
                }, 100)
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
  const [showNuevaEmergencia, setShowNuevaEmergencia] = useState(false)
  const [nuevaEmergencia, setNuevaEmergencia] = useState({ tipo: 'SALUD', entidad_id: '', descripcion: '', direccion: '' })

  // Estados para evaluaciones
  const [showNuevaEvaluacion, setShowNuevaEvaluacion] = useState(false)
  const [nuevaEvaluacion, setNuevaEvaluacion] = useState({ entidad_id: '', calificacion: 5, comentario: '' })
  const [entidades, setEntidades] = useState([])

  // Fetch all data on mount
  useEffect(() => {
    fetchAllData()
  }, [user])

  // Real-time subscription for emergencia status updates
  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel('emergencias_updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'emergencias',
          filter: `usuario_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Emergencia actualizada:', payload)
          // Update the emergencia in the list
          setMisEmergencias(prev => 
            prev.map(emp => emp.id === payload.new.id ? { ...emp, ...payload.new } : emp)
          )
          // Show notification based on new status
          if (payload.new.estado === 'ATENDIDA') {
            toast.success('Tu emergencia ha sido atendida!')
          } else if (payload.new.estado === 'EN_REVISION') {
            toast.info('Tu emergencia está siendo revisada')
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
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
      // Get user profile data
      const { data: usuarioData } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', user.id)
        .single()
      
      setPerfilData(usuarioData)
      setPerfilForm(usuarioData || {})

      // Fetch mis emergencias
      const { data: emergencias } = await supabase
        .from('emergencias')
        .select('*, entidades(nombre)')
        .eq('usuario_id', user.id)
        .order('created_at', { ascending: false })
      setMisEmergencias(emergencias || [])

      // Fetch all servicios from all entities
      const { data: servicios } = await supabase
        .from('servicios_entidad')
        .select('*, entidades(nombre)')
        .eq('habilitado', true)
      setServiciosData(servicios || [])

      // Fetch news/novedades
      const { data: news } = await supabase
        .from('novedades')
        .select('*')
        .eq('activa', true)
        .order('created_at', { ascending: false })
        .limit(5)
      setNovedades(news || [])

      // Fetch my evaluaciones
      const { data: evaluaciones } = await supabase
        .from('calificaciones')
        .select('*, entidades(nombre)')
        .eq('usuario_id', user.id)
      setEvaluacionesData(evaluaciones || [])

      // Fetch entidades for emergency and evaluation
      const { data: ents } = await supabase
        .from('entidades')
        .select('id, nombre, tipo')
        .eq('habilitado', true)
      setEntidades(ents || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Guardar perfil
  const handleGuardarPerfil = async () => {
    try {
      const { error } = await supabase
        .from('usuarios')
        .update(perfilForm)
        .eq('id', user.id)
       
      if (error) throw error
      setPerfilData(perfilForm)
      setEditandoPerfil(false)
      toast.success('Perfil actualizado correctamente')
    } catch (error) {
      toast.error('Error al actualizar perfil')
    }
  }

  // Crear emergencia
  const handleCrearEmergencia = async () => {
    if (!nuevaEmergencia.descripcion.trim()) {
      toast.error('Describe tu emergencia')
      return
    }
    if (!nuevaEmergencia.entidad_id) {
      toast.error('Selecciona una entidad')
      return
    }
    try {
      const { error } = await supabase
        .from('emergencias')
        .insert({
          usuario_id: user.id,
          entidad_id: nuevaEmergencia.entidad_id,
          tipo: nuevaEmergencia.tipo,
          descripcion: nuevaEmergencia.descripcion,
          direccion: nuevaEmergencia.direccion,
          estado: 'PENDIENTE'
        })
       
      if (error) throw error
      toast.success('Emergencia reportada correctamente')
      setShowNuevaEmergencia(false)
      setNuevaEmergencia({ tipo: 'SALUD', entidad_id: '', descripcion: '', direccion: '' })
      fetchAllData()
    } catch (error) {
      toast.error('Error al reportar emergencia')
    }
  }

  // Abrir chat de una emergencia
  const handleAbrirChat = async (emergencia) => {
    setSelectedEmergencia(emergencia)
    setLoadingMensajes(true)
    try {
      const { data } = await supabase
        .from('mensajes_emergencia')
        .select('*, usuarios(nombre)')
        .eq('emergencia_id', emergencia.id)
        .order('created_at', { ascending: true })
      setMensajes(data || [])
      // Scroll al final cuando se abre el chat
      setTimeout(() => {
        mensajesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 150)
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
      const { error } = await supabase
        .from('mensajes_emergencia')
        .insert({
          emergencia_id: selectedEmergencia.id,
          usuario_id: user.id,
          mensaje: nuevoMensaje,
          emisor: 'MIGRANTE'
        })
      
      if (error) throw error
      setNuevoMensaje('')
      // Scroll al final después de enviar mensaje
      setTimeout(() => {
        mensajesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    } catch (error) {
      toast.error('Error al enviar mensaje')
    }
  }

  // Enviar evaluación
  const handleEnviarEvaluacion = async () => {
    if (!nuevaEvaluacion.entidad_id || !nuevaEvaluacion.comentario.trim()) {
      toast.error('Selecciona una entidad y escribe un comentario')
      return
    }
    try {
      const { error } = await supabase
        .from('calificaciones')
        .insert({
          usuario_id: user.id,
          entidad_id: nuevaEvaluacion.entidad_id,
          calificacion: nuevaEvaluacion.calificacion,
          comentario: nuevaEvaluacion.comentario
        })
      
      if (error) throw error
      toast.success('Evaluación enviada')
      setShowNuevaEvaluacion(false)
      setNuevaEvaluacion({ entidad_id: '', calificacion: 5, comentario: '' })
      fetchAllData()
    } catch (error) {
      toast.error('Error al enviar evaluación')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-blue-700 text-white py-8 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold uppercase">
            PANEL DE {userProfile?.nombre?.toUpperCase() || 'MIGRANTE'}
          </h1>
          <p className="text-blue-100 mt-2 uppercase">
            Gestiona tus emergencias y servicios
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {/* Botón Emergencias */}
          <div onClick={() => setShowEmergenciasModal(true)} className="bg-white rounded-xl shadow-md p-4 sm:p-6 hover:shadow-lg transition-shadow text-center cursor-pointer">
            <div className="flex flex-col items-center">
              <div className="w-12 sm:w-16 h-12 sm:h-16 bg-red-100 rounded-full flex items-center justify-center mb-3">
                <span className="text-2xl sm:text-3xl">🚨</span>
              </div>
              <div>
                <h3 className="font-semibold text-blue-600 uppercase text-sm sm:text-base">Emergencias</h3>
                <p className="text-gray-600 text-xs sm:text-sm">Mis reportes</p>
              </div>
            </div>
          </div>

          {/* Botón Servicios */}
          <div onClick={() => setShowServiciosModal(true)} className="bg-white rounded-xl shadow-md p-4 sm:p-6 hover:shadow-lg transition-shadow text-center cursor-pointer">
            <div className="flex flex-col items-center">
              <div className="w-12 sm:w-16 h-12 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mb-3">
                <span className="text-2xl sm:text-3xl">🏢</span>
              </div>
              <div>
                <h3 className="font-semibold text-blue-600 uppercase text-sm sm:text-base">Servicios</h3>
                <p className="text-gray-600 text-xs sm:text-sm">Disponibles</p>
              </div>
            </div>
          </div>

          {/* Botón Evaluaciones */}
          <div onClick={() => setShowEvaluacionesModal(true)} className="bg-white rounded-xl shadow-md p-4 sm:p-6 hover:shadow-lg transition-shadow text-center cursor-pointer">
            <div className="flex flex-col items-center">
              <div className="w-12 sm:w-16 h-12 sm:h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-3">
                <span className="text-2xl sm:text-3xl">⭐</span>
              </div>
              <div>
                <h3 className="font-semibold text-blue-600 uppercase text-sm sm:text-base">Evaluaciones</h3>
                <p className="text-gray-600 text-xs sm:text-sm">Calificar</p>
              </div>
            </div>
          </div>

          {/* Botón Perfil */}
          <div onClick={() => setShowPerfilModal(true)} className="bg-white rounded-xl shadow-md p-4 sm:p-6 hover:shadow-lg transition-shadow text-center cursor-pointer">
            <div className="flex flex-col items-center">
              <div className="w-12 sm:w-16 h-12 sm:h-16 bg-purple-100 rounded-full flex items-center justify-center mb-3">
                <span className="text-2xl sm:text-3xl">👤</span>
              </div>
              <div>
                <h3 className="font-semibold text-blue-600 uppercase text-sm sm:text-base">Perfil</h3>
                <p className="text-gray-600 text-xs sm:text-sm">Información</p>
              </div>
            </div>
          </div>
        </div>

        {/* Novedades/Noticias */}
        {novedades.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 mt-6">
            <h2 className="text-lg font-bold text-green-600 mb-4">📰 Últimas Noticias</h2>
            <div className="space-y-3">
              {novedades.map(novedad => (
                <div key={novedad.id} className={`p-3 rounded-lg border-l-4 ${novedad.tipo === 'ALERTA' ? 'bg-red-50 border-red-500' : novedad.tipo === 'EVENTO' ? 'bg-blue-50 border-blue-500' : 'bg-gray-50 border-green-500'}`}>
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-gray-800">{novedad.titulo}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded ${novedad.tipo === 'ALERTA' ? 'bg-red-200 text-red-800' : novedad.tipo === 'EVENTO' ? 'bg-blue-200 text-blue-800' : 'bg-green-200 text-green-800'}`}>
                      {novedad.tipo}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{novedad.contenido}</p>
                  <p className="text-xs text-gray-400 mt-2">{new Date(novedad.created_at).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Estadísticas */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Resumen</h2>
          <div className="grid grid-cols-3 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-600 text-sm">Emergencias</p>
              <p className="text-3xl font-bold text-gray-800">{misEmergencias.length}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-600 text-sm">Servicios</p>
              <p className="text-3xl font-bold text-gray-800">{serviciosData.length}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-600 text-sm">Evaluaciones</p>
              <p className="text-3xl font-bold text-gray-800">{evaluacionesData.length}</p>
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
              <h2 className="text-xl font-bold text-red-600">🚨 Mis Emergencias</h2>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => {
                    // Refresh emergencias
                    supabase
                      .from('emergencias')
                      .select('*, entidades(nombre)')
                      .eq('usuario_id', user.id)
                      .order('created_at', { ascending: false })
                      .then(({ data }) => setMisEmergencias(data || []))
                  }} 
                  className="text-gray-500 hover:text-gray-700 text-xl"
                  title="Actualizar"
                >
                  🔄
                </button>
                <button onClick={() => { setShowEmergenciasModal(false); setSelectedEmergencia(null); }} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
              </div>
            </div>

            {/* Botón nueva emergencia */}
            {!showNuevaEmergencia && !selectedEmergencia && (
              <button onClick={() => setShowNuevaEmergencia(true)} className="w-full bg-red-500 text-white px-4 py-2 rounded mb-4 hover:bg-red-600">
                + Reportar Nueva Emergencia
              </button>
            )}

            {/* Formulario nueva emergencia */}
            {showNuevaEmergencia && (
              <div className="border rounded-lg p-4 mb-4 bg-red-50">
                <h3 className="font-medium mb-3">Reportar Emergencia</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-gray-600">Tipo de Emergencia</label>
                    <select value={nuevaEmergencia.tipo} onChange={e => setNuevaEmergencia({...nuevaEmergencia, tipo: e.target.value, entidad_id: ''})} className="w-full border rounded p-2">
                      <option value="">Selecciona el tipo</option>
                      <option value="SALUD">Salud</option>
                      <option value="LEGAL">Legal</option>
                      <option value="VIVIENDA">Vivienda</option>
                      <option value="ALIMENTACION">Alimentación</option>
                      <option value="EMPLEO">Empleo</option>
                      <option value="OTROS">Otros</option>
                    </select>
                  </div>
                  
                  {nuevaEmergencia.tipo && (
                    <div>
                      <label className="block text-sm text-gray-600">Entidad (relacionada al tipo)</label>
                      <select value={nuevaEmergencia.entidad_id} onChange={e => setNuevaEmergencia({...nuevaEmergencia, entidad_id: e.target.value})} className="w-full border rounded p-2">
                        <option value="">Selecciona una entidad</option>
                        {entidades.filter(ent => ent.tipo === nuevaEmergencia.tipo).map(ent => (
                          <option key={ent.id} value={ent.id}>{ent.nombre}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm text-gray-600">Descripción</label>
                    <textarea value={nuevaEmergencia.descripcion} onChange={e => setNuevaEmergencia({...nuevaEmergencia, descripcion: e.target.value})} className="w-full border rounded p-2" rows="3" placeholder="Describe tu emergencia..."></textarea>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600">Dirección (opcional)</label>
                    <input type="text" value={nuevaEmergencia.direccion} onChange={e => setNuevaEmergencia({...nuevaEmergencia, direccion: e.target.value})} className="w-full border rounded p-2" placeholder="Tu ubicación" />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleCrearEmergencia} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">Enviar</button>
                    <button onClick={() => setShowNuevaEmergencia(false)} className="bg-gray-500 text-white px-4 py-2 rounded">Cancelar</button>
                  </div>
                </div>
              </div>
            )}

            {/* Chat */}
            {selectedEmergencia ? (
              <div className="border rounded-lg mb-4">
                <div className="bg-gray-100 p-2 flex justify-between items-center">
                  <span className="font-medium">Chat con Entidad</span>
                  <button onClick={() => setSelectedEmergencia(null)} className="text-sm text-blue-600">← Volver</button>
                </div>
                                <div ref={chatContainerRef} className="p-3 space-y-2 bg-white overflow-y-auto" style={{maxHeight: '300px'}}>
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
                        <div key={msg.id} className={`p-2 rounded-lg ${msg.emisor === 'MIGRANTE' ? 'bg-blue-100 ml-8' : 'bg-gray-100 mr-8'}`}>
                          <p className="text-sm">{msg.mensaje}</p>
                          <p className="text-xs text-gray-500">{new Date(msg.created_at).toLocaleString()}</p>
                        </div>
                      )
                    ))
                  )}
                  <div ref={mensajesEndRef} />
                </div>
                <div className="p-2 border-t flex gap-2">
                  <input type="text" value={nuevoMensaje} onChange={e => setNuevoMensaje(e.target.value)} placeholder="Escribe un mensaje..." className="flex-1 border rounded px-3 py-1 text-sm" onKeyPress={e => e.key === 'Enter' && handleEnviarMensaje()} />
                  <button onClick={handleEnviarMensaje} className="bg-blue-500 text-white px-3 py-1 rounded text-sm">Enviar</button>
                </div>
              </div>
            ) : (
              /* Lista de emergencias */
              <>
                {loading ? <p>Cargando...</p> : misEmergencias.length === 0 ? (
                  <p className="text-gray-600">No tienes emergencias reportadas.</p>
                ) : (
                  <div className="space-y-3">
                    {misEmergencias.map(emp => (
                      <div key={emp.id} className={`border rounded-lg p-3 ${emp.estado === 'ATENDIDA' ? 'bg-green-50' : emp.estado === 'EN_REVISION' ? 'bg-yellow-50' : 'bg-red-50'}`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{emp.descripcion}</p>
                            <p className="text-sm text-gray-500">Tipo: {emp.tipo}</p>
                            <p className="text-sm text-gray-500">Estado: <span className={`font-medium ${emp.estado === 'ATENDIDA' ? 'text-green-600' : emp.estado === 'EN_REVISION' ? 'text-yellow-600' : emp.estado === 'ASIGNADA' ? 'text-blue-600' : 'text-red-600'}`}>{emp.estado}</span></p>
                            <p className="text-sm text-gray-500">Fecha: {new Date(emp.created_at).toLocaleDateString()}</p>
                            {emp.entidades && <p className="text-sm text-gray-500">Entidad: {emp.entidades.nombre}</p>}
                          </div>
                          {(emp.estado === 'EN_REVISION' || emp.estado === 'ASIGNADA' || emp.estado === 'ATENDIDA') && (
                            <button onClick={() => handleAbrirChat(emp)} className="bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600">
                              💬 Chat
                            </button>
                          )}
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
              <h2 className="text-xl font-bold text-green-600">🏢 Servicios Disponibles</h2>
              <button onClick={() => setShowServiciosModal(false)} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
            </div>
            {loading ? <p>Cargando...</p> : serviciosData.length === 0 ? (
              <p className="text-gray-600">No hay servicios disponibles.</p>
            ) : (
              <div className="space-y-3">
                {serviciosData.map(serv => (
                  <div key={serv.id} className="border rounded-lg p-3 bg-green-50">
                    <p className="font-medium">{serv.nombre}</p>
                    <p className="text-sm text-gray-600">{serv.descripcion}</p>
                    <p className="text-sm text-gray-500">Tipo: {serv.tipo}</p>
                    <p className="text-sm text-gray-500">Entidad: {serv.entidades?.nombre}</p>
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
              <h2 className="text-xl font-bold text-yellow-600">⭐ Mis Evaluaciones</h2>
              <button onClick={() => setShowEvaluacionesModal(false)} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
            </div>

            {/* Botón nueva evaluación */}
            {!showNuevaEvaluacion && (
              <button onClick={() => setShowNuevaEvaluacion(true)} className="w-full bg-yellow-500 text-white px-4 py-2 rounded mb-4 hover:bg-yellow-600">
                + Nueva Evaluación
              </button>
            )}

            {/* Formulario nueva evaluación */}
            {showNuevaEvaluacion && (
              <div className="border rounded-lg p-4 mb-4 bg-yellow-50">
                <h3 className="font-medium mb-3">Nueva Evaluación</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-gray-600">Entidad</label>
                    <select value={nuevaEvaluacion.entidad_id} onChange={e => setNuevaEvaluacion({...nuevaEvaluacion, entidad_id: e.target.value})} className="w-full border rounded p-2">
                      <option value="">Selecciona una entidad</option>
                      {entidades.map(ent => (
                        <option key={ent.id} value={ent.id}>{ent.nombre}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600">Calificación</label>
                    <div className="flex gap-2">
                      {[1,2,3,4,5].map(num => (
                        <button key={num} onClick={() => setNuevaEvaluacion({...nuevaEvaluacion, calificacion: num})} className={`text-2xl ${nuevaEvaluacion.calificacion >= num ? 'text-yellow-500' : 'text-gray-300'}`}>★</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600">Comentario</label>
                    <textarea value={nuevaEvaluacion.comentario} onChange={e => setNuevaEvaluacion({...nuevaEvaluacion, comentario: e.target.value})} className="w-full border rounded p-2" rows="3" placeholder="Tu experiencia..."></textarea>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleEnviarEvaluacion} className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600">Enviar</button>
                    <button onClick={() => setShowNuevaEvaluacion(false)} className="bg-gray-500 text-white px-4 py-2 rounded">Cancelar</button>
                  </div>
                </div>
              </div>
            )}

            {/* Lista de evaluaciones */}
            {loading ? <p>Cargando...</p> : evaluacionesData.length === 0 ? (
              <p className="text-gray-600">No has evaluado ninguna entidad.</p>
            ) : (
              <div className="space-y-3">
                {evaluacionesData.map(eval_ => (
                  <div key={eval_.id} className="border rounded-lg p-3 bg-yellow-50">
                    <div className="flex justify-between">
                      <p className="font-medium">{eval_.entidades?.nombre}</p>
                      <p className="font-medium text-yellow-600">{eval_.calificacion}/5 ⭐</p>
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

      {/* Modal Perfil */}
      {showPerfilModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowPerfilModal(false)}>
          <div className="bg-white rounded-xl max-w-lg w-full p-6 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-purple-600">👤 Mi Perfil</h2>
              <button onClick={() => setShowPerfilModal(false)} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
            </div>
            
            {loading ? (
              <p>Cargando...</p>
            ) : editandoPerfil ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nombre</label>
                  <input type="text" value={perfilForm?.nombre || ''} onChange={e => setPerfilForm({...perfilForm, nombre: e.target.value})} className="mt-1 block w-full border rounded-md p-2" />
                </div>
                <div className="flex gap-2 pt-2">
                  <button onClick={handleGuardarPerfil} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">Guardar</button>
                  <button onClick={() => setEditandoPerfil(false)} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">Cancelar</button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-3 bg-gray-50 rounded">
                  <p className="text-sm text-gray-500">Nombre</p>
                  <p className="font-medium">{perfilData?.nombre || 'No definido'}</p>
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

export default DashboardMigrante
