import { createBrowserRouter, Navigate } from "react-router-dom";
import App from "../App";
import Home from "../pages/home/Home";
import Login from "../components/Login";
import Register from "../components/Register";
import CartPage from "../pages/books/CartPage";
import CheckoutPage from "../pages/books/CheckoutPage";
import SingleBook from "../pages/books/SingleBook";
import PrivateRoute from "./PrivateRoute";
import OrderPage from "../pages/books/OrderPage";
import Profile from "../pages/profile/Profile";
import AdminRoute from "./AdminRoute";
import AdminLogin from "../components/AdminLogin";
import DashboardLayout from "../pages/dashboard/DashboardLayout";
import Dashboard from "../pages/dashboard/Dashboard";
import ManageBooks from "../pages/dashboard/manageBooks/ManageBooks";
import AddBook from "../pages/dashboard/addBook/AddBook";
import UpdateBook from "../pages/dashboard/EditBook/UpdateBook";
import UserDashboard from "../pages/dashboard/users/UserDashboard";
import FavoritesPage from "../pages/favorites/FavoritesPage";
import SearchPage from "../pages/SearchPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/orders",
        element: <Navigate to="/profile" />, // Redirect from /orders to /profile
      },
      {
        path: "/about",
        element: <div>About</div>,
      },
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/register",
        element: <Register />,
      },
      {
        path: "/cart",
        element: <CartPage />,
      },
      {
        path: "/checkout",
        element: <PrivateRoute><CheckoutPage /></PrivateRoute>,
      },
      {
        path: "/book/:id", // Updated to match singular 'book'
        element: <SingleBook />,
      },
      {
        path: "/profile/*",
        element: <PrivateRoute><Profile /></PrivateRoute>,
      },
      
      {
        path: "/user-dashboard",
        element: <PrivateRoute><UserDashboard /></PrivateRoute>,
      },
      {
        path: "/favorites",
        element: <PrivateRoute><FavoritesPage /></PrivateRoute>,
      },
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
      {
        path: "",
        element: <AdminRoute><Dashboard /></AdminRoute>
      },
      {
        path: "add-new-book",
        element: <AdminRoute><AddBook /></AdminRoute>
      },
      {
        path: "edit-book/:id",
        element: <AdminRoute><UpdateBook /></AdminRoute>
      },
      {
        path: "manage-books",
        element: <AdminRoute><ManageBooks /></AdminRoute>
      }
    ]
  },
  {
    path: "*", // Fallback for invalid routes
    element: <div>Page not found</div>
  }
]);

export default router;
