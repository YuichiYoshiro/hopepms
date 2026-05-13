import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { UserRightsProvider } from './contexts/UserRightsContext'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import AuthCallbackPage from './pages/AuthCallbackPage'
import ProductListPage from './pages/ProductListPage'
import DeletedItemsPage from './pages/DeletedItemsPage'
import ProductReportPage from './pages/ProductReportPage'
import TopSellingPage from './pages/TopSellingPage'
import UserManagementPage from './pages/UserManagementPage'
import './App.css'

function LayoutWrapper({ children }) {
  return (
    <div className="flex flex-col h-screen">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <UserRightsProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />
            <Route path="/" element={<Navigate to="/products" replace />} />
            <Route
              path="/products"
              element={
                <ProtectedRoute>
                  <LayoutWrapper>
                    <ProductListPage />
                  </LayoutWrapper>
                </ProtectedRoute>
              }
            />
            <Route
              path="/deleted-items"
              element={
                <ProtectedRoute>
                  <LayoutWrapper>
                    <DeletedItemsPage />
                  </LayoutWrapper>
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports/product"
              element={
                <ProtectedRoute>
                  <LayoutWrapper>
                    <ProductReportPage />
                  </LayoutWrapper>
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports/top-selling"
              element={
                <ProtectedRoute>
                  <LayoutWrapper>
                    <TopSellingPage />
                  </LayoutWrapper>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute>
                  <LayoutWrapper>
                    <UserManagementPage />
                  </LayoutWrapper>
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </UserRightsProvider>
    </AuthProvider>
  )
}

export default App