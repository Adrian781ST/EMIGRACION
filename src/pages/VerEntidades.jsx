import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const VerEntidades = () => {
  const { user } = useAuth()
  const [entidades, setEntidades] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterTipo, setFilterTipo] = useState('all')
  const [ratings, setRatings] = useState({})

  useEffect(() => {
    fetchEntidades()
  }, [])

  const fetchEntidades = async () => {
    try {
      // Fetch entidades
      const { data: entidadesData, error: entidadesError } = await supabase
        .from('entidades')
        .select('*')
        .eq('habilitado', true)
        .order('tipo')
        .order('nombre')

      if (entidadesError) throw entidadesError
      setEntidades(entidadesData || [])

      // Fetch ratings for all entities
      const { data: ratingsData, error: ratingsError } = await supabase
        .from('calificaciones')
        .select('entidad_id, calificacion')

      if (ratingsError) {
        console.error('Error fetching ratings:', ratingsError)
      } else if (ratingsData) {
        // Calculate average rating per entity
        const ratingsMap = {}
        ratingsData.forEach(r => {
          if (!ratingsMap[r.entidad_id]) {
            ratingsMap[r.entidad_id] = { total: 0, count: 0 }
          }
          ratingsMap[r.entidad_id].total += r.calificacion
          ratingsMap[r.entidad_id].count += 1
        })
        setRatings(ratingsMap)
      }
    } catch (error) {
      console.error('Error fetching entidades:', error)
    } finally {
      setLoading(false)
    }
  }

  const getAverageRating = (entidadId) => {
    const rating = ratings[entidadId]
    if (!rating || rating.count === 0) return null
    return {
      average: Math.round(rating.total / rating.count),
      count: rating.count
    }
  }

  const renderRatingStars = (rating, size = 'sm') => {
    const starSize = size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'
    return (
      <div className="flex items-center space-x-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`${starSize} ${star <= rating ? 'text-amber-400' : 'text-gray-300'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    )
  }

  const getTipoLabel = (tipo) => {
    const labels = {
      'SALUD': 'Salud',
      'EDUCACION': 'Educación',
      'LEGAL': 'Asesoría Legal',
      'VIVIENDA': 'Vivienda',
      'EMPLEO': 'Empleo',
      'ALIMENTACION': 'Alimentación',
      'OTROS': 'Otros'
    }
    return labels[tipo] || tipo
  }

  const getTipoIcon = (tipo) => {
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

  const getTipoColor = (tipo) => {
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

  // Group entidades by type
  const groupedEntidades = entidades.reduce((acc, entidad) => {
    if (!acc[entidad.tipo]) {
      acc[entidad.tipo] = []
    }
    acc[entidad.tipo].push(entidad)
    return acc
  }, {})

  const filteredGroupedEntidades = Object.entries(groupedEntidades).map(([tipo, ents]) => ({
    tipo,
    entidades: ents.filter(entidad => {
      const matchesSearch = entidad.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           entidad.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesTipo = filterTipo === 'all' || entidad.tipo === filterTipo
      return matchesSearch && matchesTipo
    })
  })).filter(group => group.entidades.length > 0)

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Entidades de Servicio
          </h1>
          <p className="text-xl text-gray-600">
            Encuentra organizaciones que ofrecen ayuda a migrantes en Colombia
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nombre o descripción..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Servicio
              </label>
              <select
                value={filterTipo}
                onChange={(e) => setFilterTipo(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todos los tipos</option>
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
        </div>

        {/* Results grouped by type */}
        {filteredGroupedEntidades.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">
              No se encontraron entidades que coincidan con tu búsqueda.
            </p>
          </div>
        ) : (
          <div className="space-y-12">
            {filteredGroupedEntidades.map(({ tipo, entidades }) => (
              <div key={tipo} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                {/* Section Header */}
                <div className={`bg-gradient-to-r ${getTipoColor(tipo)} text-white p-6`}>
                  <div className="flex items-center space-x-4">
                    <span className="text-4xl">{getTipoIcon(tipo)}</span>
                    <div>
                      <h2 className="text-2xl font-bold">{getTipoLabel(tipo)}</h2>
                      <p className="text-white/80">{entidades.length} entidad{entidades.length !== 1 ? 'es' : ''}</p>
                    </div>
                  </div>
                </div>
                
                {/* Entity Cards */}
                <div className="p-6">
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {entidades.map(entidad => (
                      <div key={entidad.id} className="bg-gray-50 rounded-xl p-5 hover:shadow-md transition-shadow border border-gray-100 text-center">
                        <div className="flex flex-col items-center mb-3">
                          <h3 className="text-lg font-semibold text-gray-800">
                            {entidad.nombre}
                          </h3>
                          {user && getAverageRating(entidad.id) && (
                            <div className="flex items-center space-x-2 bg-gradient-to-r from-amber-400 to-orange-400 px-3 py-1 rounded-full shadow-sm mt-2">
                              {renderRatingStars(getAverageRating(entidad.id).average)}
                              <div className="flex flex-col items-start">
                                <span className="text-white font-bold text-sm leading-none">
                                  {getAverageRating(entidad.id).average}
                                </span>
                              </div>
                              <span className="text-white/80 text-xs">
                                ({getAverageRating(entidad.id).count})
                              </span>
                            </div>
                          )}
                        </div>
                        
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {entidad.descripcion}
                        </p>
                        
                        {entidad.direccion && (
                          <p className="text-sm text-gray-500 mb-1">
                            📍 {entidad.direccion}
                          </p>
                        )}
                        
                        {entidad.telefono && (
                          <p className="text-sm text-gray-500 mb-1">
                            📞 {entidad.telefono}
                          </p>
                        )}
                        
                        {entidad.email && (
                          <p className="text-sm text-gray-500 mb-3">
                            ✉️ {entidad.email}
                          </p>
                        )}
                        
                        <Link
                          to={`/evaluanos?entidad=${entidad.id}`}
                          className="mt-4 block w-full text-center bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2.5 rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                        >
                          <span className="flex items-center justify-center space-x-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                            <span>Evaluar Servicio</span>
                          </span>
                        </Link>
                      </div>
                    ))}
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

export default VerEntidades
