// src/dashboard/components/DashboardLayout.jsx
import React, { useEffect } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { HiViewGridAdd } from 'react-icons/hi';
import { MdOutlineManageHistory } from 'react-icons/md';

const DashboardLayout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Dashboard sayfası yüklendiğinde body'ye "dashboard" sınıfını ekleyin
    document.body.classList.add('dashboard');
    // Bileşen unmount olduğunda sınıfı kaldırın
    return () => {
      document.body.classList.remove('dashboard');
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate("/");
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-20 bg-gray-800 flex flex-col items-center py-4">
        
        <nav className="flex flex-col space-y-4">
          <Link to="/dashboard" className="text-white p-2 bg-white bg-opacity-10 rounded">
            {/* Dashboard Icon */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none"
              viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 19V9m0 0L3 15m6-6l6 6M15 19v-4m0 0l3 3m-3-3l-3 3" />
            </svg>
          </Link>
          <Link to="/dashboard/add-new-book" className="text-white p-2 hover:bg-gray-700 rounded">
            <HiViewGridAdd className="h-6 w-6" />
          </Link>
          <Link to="/dashboard/manage-books" className="text-white p-2 hover:bg-gray-700 rounded">
            <MdOutlineManageHistory className="h-6 w-6" />
          </Link>
        </nav>
      </aside>
      {/* Main content */}
      <div className="flex-grow">
        <header className="bg-white shadow p-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <div className="flex flex-col items-end">
            <div className="text-gray-700">Welcome, İrem Demireğen</div>
            <button 
              onClick={handleLogout} 
              className="mt-2 p-2 hover:bg-gray-200 rounded"
            >
              {/* Logout Icon */}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none"
                viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </header>
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
