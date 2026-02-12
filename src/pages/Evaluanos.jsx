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
    return (
      <div className="flex space-x-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setCalificacion(star)}
            className={`text-3xl transition-colors ${
              star <= calificacion ? 'text-yellow-400' : 'text-gray-300'
            }`}
          >
            ★
          </button>
        ))}
      </div>
    )
  }

  if (loadingEntidades) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Evalúa tu Experiencia
            </h1>
            <p className="text-gray-600">
              Tu opinión nos ayuda a mejorar los servicios para toda la comunidad
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="entidad" className="block text-sm font-medium text-gray-700 mb-2">
                Selecciona la Entidad
              </label>
              <select
                id="entidad"
                value={selectedEntidad}
                onChange={(e) => setSelectedEntidad(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Calificación
              </label>
              <div className="flex items-center space-x-4">
                {renderStars()}
                <span className="text-gray-600">
                  {calificacion} de 5 estrellas
                </span>
              </div>
            </div>

            <div>
              <label htmlFor="comentario" className="block text-sm font-medium text-gray-700 mb-2">
                Tu Comentario
              </label>
              <textarea
                id="comentario"
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Cuéntanos tu experiencia con esta entidad..."
                required
              />
            </div>

            {!user && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800 text-sm">
                  ⚠️ Debes <a href="/login" className="underline font-semibold">iniciar sesión</a> para poder evaluar.
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !user}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
  )
}

export default Evaluanos
