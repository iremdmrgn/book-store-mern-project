import { createBrowserRouter, Navigate } from "react-router-dom";
import App from "../App";
import Home from "../pages/home/Home";
import Login from "../components/Login";
import Register from "../components/Register";
import CartPage from "../pages/books/CartPage";
import CheckoutPage from "../pages/books/CheckoutPage";
import SingleBook from "../pages/books/SingleBook";
import PrivateRoute from "./PrivateRoute";
import Profile from "../pages/profile/Profile";
import AdminRoute from "./AdminRoute";
import AdminLogin from "../components/AdminLogin";
import DashboardLayout from "../dashboard/components/DashboardLayout";
import Dashboard from "../dashboard/components/Dashboard";
import ManageBooks from "../dashboard/components/ManageBooks";
import AddBook from "../dashboard/components/AddBook";
import OrderPage from "../dashboard/components/OrdersPage"; // Yeni sipariş yönetim sayfası
import FavoritesPage from "../pages/favorites/FavoritesPage";
import SearchPage from "../pages/SearchPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/orders", element: <Navigate to="/profile" /> },
      { path: "/about", element: <div>About</div> },
      { path: "/login", element: <Login /> },
      { path: "/register", element: <Register /> },
      { path: "/cart", element: <CartPage /> },
      { path: "/checkout", element: <PrivateRoute><CheckoutPage /></PrivateRoute> },
      { path: "/book/:id", element: <SingleBook /> },
      { path: "/profile/*", element: <PrivateRoute><Profile /></PrivateRoute> },
      { path: "/favorites", element: <PrivateRoute><FavoritesPage /></PrivateRoute> },
      { path: "/search", element: <SearchPage /> },
    ]
  },
  {
    path: "/admin",
    element: <AdminLogin />,
  },
  {
    path: "/dashboard",
    element: <AdminRoute><DashboardLayout /></AdminRoute>,
    children: [
      { path: "", element: <AdminRoute><Dashboard /></AdminRoute> },
      { path: "orders", element: <AdminRoute><OrderPage /></AdminRoute> },  // Yeni sipariş yönetim sayfası
      { path: "add-new-book", element: <AdminRoute><AddBook /></AdminRoute> },
      { path: "manage-books", element: <AdminRoute><ManageBooks /></AdminRoute> }
    ]
  },
  { path: "*", element: <div>Page not found</div> }
]);

export default router;
