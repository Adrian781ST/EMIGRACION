import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Navbar = () => {
  const { user, userProfile, signOut } = useAuth()
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const getDashboardPath = () => {
    switch (userProfile?.tipo) {
      case 'MIGRANTE': return '/migrante'
      case 'ENTIDAD': return '/entidad'
      case 'GERENCIA': return '/gerencia'
      default: return '/perfil'
    }
  }

  return (
    <nav className="bg-blue-600 shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-white text-xl font-bold">E-Migrante</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/entidades" className="text-white hover:text-blue-200">
              Entidades
            </Link>
            <Link to="/evaluanos" className="text-white hover:text-blue-200">
              Evalúanos
            </Link>
            
            {user ? (
              <div className="flex items-center space-x-4">
                <Link 
                  to={getDashboardPath()} 
                  className="text-white hover:text-blue-200"
                >
                  {userProfile?.tipo === 'GERENCIA' ? 'Gerencia' : 
                   userProfile?.tipo === 'ENTIDAD' ? 'Mi Entidad' : 'Mi Panel'}
                </Link>
                <Link to="/perfil" className="text-white hover:text-blue-200">
                  Perfil
                </Link>
                <button
                  onClick={handleSignOut}
                  className="bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800"
                >
                  Cerrar Sesión
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-white hover:text-blue-200"
                >
                  Iniciar Sesión
                </Link>
                <Link
                  to="/register"
                  className="bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50"
                >
                  Registrarse
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-white p-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-blue-500">
            <div className="flex flex-col space-y-3">
              <Link to="/entidades" className="text-white hover:text-blue-200 py-2">
                Entidades
              </Link>
              <Link to="/evaluanos" className="text-white hover:text-blue-200 py-2">
                Evalúanos
              </Link>
              {user ? (
                <>
                  <Link to={getDashboardPath()} className="text-white hover:text-blue-200 py-2">
                    {userProfile?.tipo === 'GERENCIA' ? 'Gerencia' : 
                     userProfile?.tipo === 'ENTIDAD' ? 'Mi Entidad' : 'Mi Panel'}
                  </Link>
                  <Link to="/perfil" className="text-white hover:text-blue-200 py-2">
                    Perfil
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800 text-left"
                  >
                    Cerrar Sesión
                  </button>
                </>
              ) : (
                <div className="flex flex-col space-y-2 pt-2">
                  <Link
                    to="/login"
                    className="text-white hover:text-blue-200 py-2"
                  >
                    Iniciar Sesión
                  </Link>
                  <Link
                    to="/register"
                    className="bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 text-center"
                  >
                    Registrarse
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
