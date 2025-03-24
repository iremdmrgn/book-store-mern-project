import { Outlet, useLocation } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { AuthProvide } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const location = useLocation(); // Geçerli sayfa yolunu almak için

  return (
    <>
      <AuthProvide>
        {/* Eğer kullanıcı /login veya /register sayfasında değilse Navbar'ı göster */}
        {location.pathname !== '/login' && location.pathname !== '/register' && <Navbar />}
        <main className="min-h-screen max-w-screen-2x1 mx-auto px-4 py-6 font-primary">
          <Outlet />
        </main>
        <Footer />
        {/* Toast bildirimlerinin çalışabilmesi için ToastContainer ekleyin */}
        <ToastContainer />
      </AuthProvide>
    </>
  );
}

export default App;
