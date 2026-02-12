import { useAuth } from '../context/AuthContext'

const Perfil = () => {
  const { user, userProfile } = useAuth()

  const getRoleLabel = (tipo) => {
    const labels = {
      'MIGRANTE': 'Migrante',
      'ENTIDAD': 'Entidad de Servicio',
      'GERENCIA': 'Gerencia'
    }
    return labels[tipo] || tipo
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-blue-600 h-32"></div>
          <div className="px-8 pb-8">
            <div className="relative -mt-16 mb-6">
              <div className="w-32 h-32 bg-blue-600 rounded-full flex items-center justify-center border-4 border-white mx-auto">
                <span className="text-4xl font-bold text-white">
                  {userProfile?.nombre?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase()}
                </span>
              </div>
            </div>

            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-800">
                {userProfile?.nombre || 'Usuario'}
              </h1>
              <p className="text-gray-600">{user?.email}</p>
              <span className="inline-block mt-2 bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                {getRoleLabel(userProfile?.tipo)}
              </span>
            </div>

            <div className="border-t pt-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Información de la Cuenta</h2>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Tipo de Usuario</span>
                  <span className="font-medium">{getRoleLabel(userProfile?.tipo)}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Correo</span>
                  <span className="font-medium">{user?.email}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">ID de Usuario</span>
                  <span className="font-medium text-sm">{user?.id}</span>
                </div>
              </div>
            </div>

            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">Acceso rápido</h3>
              <p className="text-sm text-blue-700">
                {userProfile?.tipo === 'MIGRANTE' && 'Accede a tu panel de migrante para gestionar emergencias y más.'}
                {userProfile?.tipo === 'ENTIDAD' && 'Accede al panel de tu entidad para gestionar servicios y emergencias.'}
                {userProfile?.tipo === 'GERENCIA' && 'Accede al panel de gerencia para administrar la plataforma.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Perfil
