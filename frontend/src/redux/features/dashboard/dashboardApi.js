// dashboardApi.js

// This function fetches dashboard data from the backend API.
export async function getDashboardData() {
  const response = await fetch('http://localhost:5000/api/dashboard');
  if (!response.ok) {
    throw new Error('API isteği başarısız oldu.');
  }
  return response.json();
}
