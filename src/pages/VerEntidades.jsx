import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Link } from 'react-router-dom'

const VerEntidades = () => {
  const [entidades, setEntidades] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterTipo, setFilterTipo] = useState('all')

  useEffect(() => {
    fetchEntidades()
  }, [])

  const fetchEntidades = async () => {
    try {
      const { data, error } = await supabase
        .from('entidades')
        .select('*')
        .eq('habilitado', true)
        .order('nombre')

      if (error) throw error
      setEntidades(data || [])
    } catch (error) {
      console.error('Error fetching entidades:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredEntidades = entidades.filter(entidad => {
    const matchesSearch = entidad.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entidad.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTipo = filterTipo === 'all' || entidad.tipo === filterTipo
    return matchesSearch && matchesTipo
  })

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
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

        {/* Results */}
        {filteredEntidades.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">
              No se encontraron entidades que coincidan con tu búsqueda.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEntidades.map(entidad => (
              <div key={entidad.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-semibold text-gray-800">
                      {entidad.nombre}
                    </h3>
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                      {getTipoLabel(entidad.tipo)}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {entidad.descripcion}
                  </p>
                  
                  {entidad.direccion && (
                    <p className="text-sm text-gray-500 mb-2">
                      📍 {entidad.direccion}
                    </p>
                  )}
                  
                  {entidad.telefono && (
                    <p className="text-sm text-gray-500 mb-2">
                      📞 {entidad.telefono}
                    </p>
                  )}
                  
                  {entidad.email && (
                    <p className="text-sm text-gray-500 mb-4">
                      ✉️ {entidad.email}
                    </p>
                  )}
                  
                  <Link
                    to={`/evaluanos?entidad=${entidad.id}`}
                    className="block w-full text-center bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Evaluar esta Entidad
                  </Link>
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
