import { Outlet, useLocation } from 'react-router-dom'
import './App.css'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import { AuthProvide } from './context/AuthContext'

function App() {
  const location = useLocation(); // Konum bilgisini alıyoruz

  return (
    <>
      <AuthProvide>
        {/* Eğer kullanıcı /login veya /register sayfasında değilse Navbar'ı göster */}
        {location.pathname !== '/login' && location.pathname !== '/register' && <Navbar />}
        <main className='min-h-screen max-w-screen-2x1 mx-auto px-4 py-6 font-primary'>
          <Outlet />
        </main>
        <Footer />
      </AuthProvide>
    </>
  )
}

export default App