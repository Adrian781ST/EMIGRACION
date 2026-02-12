import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const Evaluanos = () => {
  const [searchParams] = useSearchParams()
  const entidadId = searchParams.get('entidad')
  const { user } = useAuth()
  
  const [entidades, setEntidades] = useState([])
  const [selectedEntidad, setSelectedEntidad] = useState(entidadId || '')
  const [calificacion, setCalificacion] = useState(5)
  const [comentario, setComentario] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingEntidades, setLoadingEntidades] = useState(true)

  useEffect(() => {
    fetchEntidades()
  }, [])

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
    } finally {
      setLoadingEntidades(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!user) {
      toast.error('Debes iniciar sesión para evaluar')
      return
    }

    if (!selectedEntidad) {
      toast.error('Por favor selecciona una entidad')
      return
    }

    if (!comentario.trim()) {
      toast.error('Por favor ingresa un comentario')
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase
        .from('calificaciones')
        .insert([{
          entidad_id: selectedEntidad,
          usuario_id: user.id,
          calificacion,
          comentario: comentario.trim()
        }])

      if (error) throw error

      toast.success('¡Gracias por tu evaluación!')
      setComentario('')
      setCalificacion(5)
    } catch (error) {
      console.error('Error submitting evaluation:', error)
      toast.error(error.message || 'Error al enviar la evaluación')
    } finally {
      setLoading(false)
    }
  }

  const renderStars = () => {
    const labels = ['Muy Malo', 'Malo', 'Regular', 'Bueno', 'Excelente']
    return (
      <div className="flex flex-col items-center">
        <div className="flex items-center space-x-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setCalificacion(star)}
              className={`transform transition-all duration-200 hover:scale-110 focus:outline-none ${
                star <= calificacion 
                  ? 'text-amber-400 drop-shadow-md' 
                  : 'text-gray-300'
              }`}
            >
              <svg 
                className={`w-12 h-12 ${
                  star <= calificacion ? 'scale-110' : ''
                } transition-transform duration-200`} 
                fill="currentColor" 
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </button>
          ))}
        </div>
        <span className="mt-2 text-sm font-medium text-gray-600 uppercase tracking-wide">
          {labels[calificacion - 1]}
        </span>
      </div>
    )
  }

  if (loadingEntidades) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-8 text-center">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">⭐</span>
            </div>
            <h1 className="text-3xl font-bold mb-2">
              Evalúa tu Experiencia
            </h1>
            <p className="text-blue-100">
              Tu opinión nos ayuda a mejorar los servicios para toda la comunidad
            </p>
          </div>

          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="entidad" className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                  Selecciona la Entidad
                </label>
                <select
                  id="entidad"
                  value={selectedEntidad}
                  onChange={(e) => setSelectedEntidad(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  required
                >
                  <option value="">Selecciona una entidad...</option>
                  {entidades.map(entidad => (
                    <option key={entidad.id} value={entidad.id}>
                      {entidad.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
                <label className="block text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide text-center">
                  Tu Calificación
                </label>
                {renderStars()}
              </div>

              <div>
                <label htmlFor="comentario" className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                  Tu Comentario
                </label>
                <textarea
                  id="comentario"
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Cuéntanos tu experiencia con esta entidad..."
                  required
                />
              </div>

              {!user && (
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-800 text-sm">
                    ⚠️ Debes <a href="/login" className="underline font-semibold">iniciar sesión</a> para poder evaluar.
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !user}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white-lg font-semibold py-3 rounded hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Enviando...
                  </span>
                ) : (
                  'Enviar Evaluación'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Evaluanos
