import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

// Cuentas de prueba disponibles
const TEST_ACCOUNTS = [
  { email: 'DON@ADMIN.CO', role: 'Administrador', color: 'from-purple-500 to-purple-600' },
  { email: 'DON@ENTIDAD.CO', role: 'Entidad', color: 'from-green-500 to-green-600' },
  { email: 'DON@MIGRANTE.CO', role: 'Migrante', color: 'from-blue-500 to-blue-600' },
]

const TestAccountsModal = ({ onClose }) => {
  const [copied, setCopied] = useState(null)

  const copyToClipboard = async (email) => {
    try {
      await navigator.clipboard.writeText(email)
      setCopied(email)
      toast.success('¡Correo copiado!', { duration: 1500 })
      
      // Close modal after copying
      setTimeout(() => {
        onClose()
      }, 1000)
    } catch (error) {
      toast.error('Error al copiar')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-blue-50 via-white to-blue-100 rounded-2xl shadow-2xl max-w-md w-full animate-scale-in border-4 border-blue-200">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-blue-600 uppercase tracking-wide text-center flex-1">CUENTAS DE PRUEBA</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors ml-4"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <p className="text-gray-600 mb-4 text-center">
            Haz clic en una cuenta para copiar el correo. La contraseña para todas es: <span className="font-mono font-bold text-gray-800">123456</span>
          </p>

          <div className="space-y-3">
            {TEST_ACCOUNTS.map((account) => (
              <button
                key={account.email}
                onClick={() => copyToClipboard(account.email)}
                className={`w-full p-4 rounded-xl text-left transition-all hover:scale-105 hover:shadow-lg bg-gradient-to-r ${account.color} text-white flex items-center`}
              >
                <div className="flex-1">
                  <p className="font-semibold">{account.role}</p>
                </div>
                <div className="flex-1 text-center">
                  <p className="text-sm opacity-90">{account.email}</p>
                </div>
                <div className="flex-1 flex justify-end">
                  <div className="bg-white/20 rounded-full p-2">
                    {copied === account.email ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scale-in {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
    </div>
  )
}

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showTestAccounts, setShowTestAccounts] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const from = location.state?.from?.pathname || '/'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const result = await signIn(email, password)

    if (result.success) {
      toast.success('¡Bienvenido de nuevo!')
      navigate(from, { replace: true })
    } else {
      toast.error(result.error || 'Error al iniciar sesión')
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center py-12 px-4">
      {showTestAccounts && (
        <TestAccountsModal onClose={() => setShowTestAccounts(false)} />
      )}
      
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🔐</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-800">Iniciar Sesión</h1>
            <p className="text-gray-600 mt-2">
              Accede a tu cuenta DON MIGRANTE
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Correo Electrónico
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="tu@email.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 disabled:opacity50 disabled:cursor-not-allowed transition-all shadow-md"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Iniciando sesión...
                </span>
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setShowTestAccounts(true)}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center justify-center gap-2 mx-auto uppercase tracking-wide"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Ver Cuentas de Prueba
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              ¿No tienes una cuenta?{' '}
              <Link to="/register" className="text-blue-600 font-semibold hover:text-blue-700 uppercase tracking-wide">
                Regístrate
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
