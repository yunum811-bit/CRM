import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Telesale from './pages/Telesale'
import Sale from './pages/Sale'
import CreditAnalysis from './pages/CreditAnalysis'
import Approval from './pages/Approval'
import Contract from './pages/Contract'
import Disbursement from './pages/Disbursement'
import Collection from './pages/Collection'
import Legal from './pages/Legal'
import Accounting from './pages/Accounting'
import Customers from './pages/Customers'
import Settings from './pages/Settings'
import DealDetail from './pages/DealDetail'

function AppRoutes() {
  const { user } = useAuth()

  if (!user) {
    return <Login />
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<ProtectedRoute page="dashboard"><Dashboard /></ProtectedRoute>} />
          <Route path="telesale" element={<ProtectedRoute page="telesale"><Telesale /></ProtectedRoute>} />
          <Route path="sale" element={<ProtectedRoute page="sale"><Sale /></ProtectedRoute>} />
          <Route path="credit-analysis" element={<ProtectedRoute page="credit-analysis"><CreditAnalysis /></ProtectedRoute>} />
          <Route path="approval" element={<ProtectedRoute page="approval"><Approval /></ProtectedRoute>} />
          <Route path="contract" element={<ProtectedRoute page="contract"><Contract /></ProtectedRoute>} />
          <Route path="disbursement" element={<ProtectedRoute page="disbursement"><Disbursement /></ProtectedRoute>} />
          <Route path="collection" element={<ProtectedRoute page="collection"><Collection /></ProtectedRoute>} />
          <Route path="legal" element={<ProtectedRoute page="legal"><Legal /></ProtectedRoute>} />
          <Route path="accounting" element={<ProtectedRoute page="accounting"><Accounting /></ProtectedRoute>} />
          <Route path="customers" element={<ProtectedRoute page="customers"><Customers /></ProtectedRoute>} />
          <Route path="settings" element={<ProtectedRoute page="settings"><Settings /></ProtectedRoute>} />
          <Route path="deal/:id" element={<DealDetail />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}

export default App
