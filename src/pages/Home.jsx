import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Home = () => {
  const { user, userProfile } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-blue-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Bienvenido DON MIGRANTE
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-blue-100">
            La plataforma que conecta migrantes con servicios y oportunidades en Colombia
          </p>
          {!user && (
            <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
              <Link
                to="/register"
                className="bg-white text-blue-600 px-6 py-3 rounded-lg text-lg font-semibold hover:bg-blue-50"
              >
                Registrarse
              </Link>
              <Link
                to="/login"
                className="border-2 border-white text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700"
              >
                Iniciar Sesión
              </Link>
            </div>
          )}
          {user && userProfile?.tipo === 'MIGRANTE' && (
            <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4 mt-6">
              <Link
                to="/migrante/emergencias"
                className="bg-red-500 text-white px-6 py-4 rounded-lg text-lg font-semibold hover:bg-red-600 flex items-center justify-center space-x-2 shadow-lg uppercase"
              >
                <span>🚨</span>
                <span>Reportar Emergencia</span>
              </Link>
              <Link
                to="/migrante/novedades"
                className="bg-white text-blue-600 px-6 py-4 rounded-lg text-lg font-semibold hover:bg-blue-50 flex items-center justify-center space-x-2 shadow-lg uppercase"
              >
                <span>📋</span>
                <span>Ver Novedades</span>
              </Link>
            </div>
          )}
          {user && userProfile?.tipo === 'ENTIDAD' && (
            <Link
              to="/entidad/emergencias"
              className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-50 uppercase"
            >
              Ir a mi Panel
            </Link>
          )}
          {user && userProfile?.tipo === 'GERENCIA' && (
            <Link
              to="/gerencia"
              className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-50 uppercase"
            >
              Ir a mi Panel
            </Link>
          )}
        </div>
      </section>


      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-4">
              <div className="text-2xl md:text-4xl font-bold text-blue-600 mb-2">150+</div>
              <div className="text-gray-600 text-sm">Entidades Registradas</div>
            </div>
            <div className="p-4">
              <div className="text-2xl md:text-4xl font-bold text-green-600 mb-2">500+</div>
              <div className="text-gray-600 text-sm">Migrantes Apoyados</div>
            </div>
            <div className="p-4">
              <div className="text-2xl md:text-4xl font-bold text-yellow-600 mb-2">200+</div>
              <div className="text-gray-600 text-sm">Emergencias Resueltas</div>
            </div>
            <div className="p-4">
              <div className="text-2xl md:text-4xl font-bold text-purple-600 mb-2">50+</div>
              <div className="text-gray-600 text-sm">Ciudades Cobertas</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4 uppercase">DON MIGRANTE</h3>
              <p className="text-gray-400">
                Plataforma para la integración de migrantes en Colombia. Conectamos personas con oportunidades.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4 uppercase">ENLACES RÁPIDOS</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/entidades" className="hover:text-white uppercase">Entidades</Link></li>
                <li><Link to="/evaluanos" className="hover:text-white uppercase">Experiencia</Link></li>
                {!user && (
                  <>
                    <li><Link to="/login" className="hover:text-white uppercase">Iniciar Sesión</Link></li>
                    <li><Link to="/register" className="hover:text-white uppercase">Registrarse</Link></li>
                  </>
                )}
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4 uppercase">CONTACTO</h3>
              <ul className="space-y-2 text-gray-400">
                <li>📧 info@e-migrante.com</li>
                <li>📞 +57 300 123 4567</li>
                <li>📍 Colombia</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center">
            <p className="text-gray-400 uppercase">
              © 2026 DON MIGRANTE. Todos los derechos reservados.
            </p>
            <p className="text-gray-500 mt-2 uppercase">
              Plataforma para la integración de migrantes en Colombia
            </p>
            <p className="text-gray-400 mt-4 uppercase"><a href="https://adevadrian.netlify.app" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">Made with ❤️ by Adrian</a></p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Home
