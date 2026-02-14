import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const Navbar = () => {
  const { user, userProfile, signOut } = useAuth()
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    toast.success('¡Hasta pronto! Gracias por visitarnos.')
    navigate('/')
    setIsMenuOpen(false)
  }

  const handleLinkClick = () => {
    setIsMenuOpen(false)
  }

  const NavLink = ({ to, children }) => (
    <Link 
      to={to} 
      onClick={handleLinkClick}
      className="text-white/90 hover:text-white text-sm font-medium uppercase tracking-wide px-3 py-2 rounded-lg hover:bg-white/10 transition-colors duration-200"
    >
      {children}
    </Link>
  )

  return (
    <nav className="bg-gradient-to-r from-blue-700 via-blue-600 to-blue-700 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <span className="text-2xl font-bold text-white tracking-wider group-hover:scale-105 transition-transform duration-200">
              DON MIGRANTE
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-2">
            {/* Public links - visible for everyone */}
            <NavLink to="/entidades">ENTIDADES</NavLink>
            
            {/* Show user-specific links when logged in */}
            {user && (
              <>
                <div className="border-l border-white/20 h-8 mx-2"></div>
                
                {/* Role-based links */}
                {userProfile?.tipo === 'MIGRANTE' && (
                  <>
                    <NavLink to="/migrante/emergencias">EMERGENCIAS</NavLink>
                    <NavLink to="/evaluanos">EXPERIENCIA</NavLink>
                    <NavLink to="/migrante/novedades">NOVEDADES</NavLink>
                  </>
                )}
                {userProfile?.tipo === 'ENTIDAD' && (
                  <>
                    <NavLink to="/entidad" state={{ tab: 'emergencias' }}>EMERGENCIAS</NavLink>
                    <NavLink to="/entidad" state={{ tab: 'servicios' }}>SERVICIOS</NavLink>
                    <NavLink to="/entidad/novedades">NOVEDADES</NavLink>
                  </>
                )}
                {userProfile?.tipo === 'GERENCIA' && (
                  <NavLink to="/gerencia">GERENCIA</NavLink>
                )}
                
                {/* User actions */}
                <div className="flex items-center space-x-2 ml-4">
                  <Link 
                    to="/perfil" 
                    onClick={handleLinkClick}
                    className="flex items-center space-x-2 text-white/90 hover:text-white px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold">
                        {userProfile?.nombre?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase()}
                      </span>
                    </div>
                    <span className="text-sm font-medium">{userProfile?.nombre?.split(' ')[0] || 'Usuario'}</span>
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium uppercase tracking-wide transition-all duration-200"
                  >
                    CERRAR SESIÓN
                  </button>
                </div>
              </>
            )}
            
            {/* Show login/register when NOT logged in */}
            {!user && (
              <div className="flex items-center space-x-3 ml-4">
                <Link
                  to="/login"
                  onClick={handleLinkClick}
                  className="bg-white text-blue-600 px-5 py-2 rounded-lg text-sm font-bold uppercase tracking-wide hover:bg-blue-50 transition-all duration-200 shadow-md"
                >
                  INICIAR SESIÓN
                </Link>
                <Link
                  to="/register"
                  onClick={handleLinkClick}
                  className="bg-white/10 hover:bg-white/20 text-white border border-white/30 px-5 py-2 rounded-lg text-sm font-bold uppercase tracking-wide transition-all duration-200"
                >
                  REGISTRARSE
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
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
          <div className="md:hidden py-4 border-t border-white/20">
            <div className="flex flex-col space-y-1">
              <Link to="/entidades" onClick={handleLinkClick} className="text-white/90 hover:text-white py-3 px-4 rounded-lg hover:bg-white/10 transition-colors font-medium uppercase text-sm">
                Entidades
              </Link>
              {user ? (
                <>
                  {userProfile?.tipo === 'MIGRANTE' && (
                    <>
                      <Link to="/migrante/emergencias" onClick={handleLinkClick} className="text-white/90 hover:text-white py-3 px-4 rounded-lg hover:bg-white/10 transition-colors font-medium uppercase text-sm">
                        Emergencias
                      </Link>
                      <Link to="/evaluanos" onClick={handleLinkClick} className="text-white/90 hover:text-white py-3 px-4 rounded-lg hover:bg-white/10 transition-colors font-medium uppercase text-sm">
                        Experiencia
                      </Link>
                      <Link to="/migrante/novedades" onClick={handleLinkClick} className="text-white/90 hover:text-white py-3 px-4 rounded-lg hover:bg-white/10 transition-colors font-medium uppercase text-sm">
                        Novedades
                      </Link>
                    </>
                  )}
                  {userProfile?.tipo === 'ENTIDAD' && (
                    <>
                      <Link to="/entidad" state={{ tab: 'emergencias' }} onClick={handleLinkClick} className="text-white/90 hover:text-white py-3 px-4 rounded-lg hover:bg-white/10 transition-colors font-medium uppercase text-sm">
                        Emergencias
                      </Link>
                      <Link to="/entidad" state={{ tab: 'servicios' }} onClick={handleLinkClick} className="text-white/90 hover:text-white py-3 px-4 rounded-lg hover:bg-white/10 transition-colors font-medium uppercase text-sm">
                        Servicios
                      </Link>
                      <Link to="/entidad/novedades" onClick={handleLinkClick} className="text-white/90 hover:text-white py-3 px-4 rounded-lg hover:bg-white/10 transition-colors font-medium uppercase text-sm">
                        Novedades
                      </Link>
                    </>
                  )}
                  {userProfile?.tipo === 'GERENCIA' && (
                    <Link to="/gerencia" onClick={handleLinkClick} className="text-white/90 hover:text-white py-3 px-4 rounded-lg hover:bg-white/10 transition-colors font-medium uppercase text-sm">
                      Panel de Gerencia
                    </Link>
                  )}
                  <Link to="/perfil" onClick={handleLinkClick} className="text-white/90 hover:text-white py-3 px-4 rounded-lg hover:bg-white/10 transition-colors font-medium uppercase text-sm">
                    Mi Perfil
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="bg-white/10 text-white py-3 px-4 rounded-lg hover:bg-white/20 transition-colors font-medium uppercase text-sm text-left mt-2"
                  >
                    Cerrar Sesión
                  </button>
                </>
              ) : (
                <div className="flex flex-col space-y-2 pt-2">
                  <Link
                    to="/login"
                    onClick={handleLinkClick}
                    className="bg-white text-blue-600 py-3 px-4 rounded-lg hover:bg-blue-50 transition-colors font-bold uppercase text-sm text-center"
                  >
                    Iniciar Sesión
                  </Link>
                  <Link
                    to="/register"
                    onClick={handleLinkClick}
                    className="bg-white/10 hover:bg-white/20 text-white border border-white/30 py-3 px-4 rounded-lg transition-colors font-bold uppercase text-sm text-center"
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
