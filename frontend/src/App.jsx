import { useEffect } from 'react'
import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'

import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import WhatsAppFloat from './components/WhatsAppFloat.jsx'

import Home from './pages/Home.jsx'
import Fleet from './pages/Fleet.jsx'
import VehicleDetail from './pages/VehicleDetail.jsx'
import Contact from './pages/Contact.jsx'
import NotFound from './pages/NotFound.jsx'

import AdminLogin from './admin/AdminLogin.jsx'
import AdminLayout from './admin/AdminLayout.jsx'
import Dashboard from './admin/Dashboard.jsx'
import VehiclesAdmin from './admin/VehiclesAdmin.jsx'
import SettingsAdmin from './admin/SettingsAdmin.jsx'
import ReservationsAdmin from './admin/ReservationsAdmin.jsx'
import AccountAdmin from './admin/AccountAdmin.jsx'
import { getToken } from './api/client.js'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

/** Gabarit du site visiteur. */
function PublicLayout() {
  return (
    <>
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  )
}

/** Empeche l'acces au tableau de bord sans jeton. */
function RequireAuth({ children }) {
  return getToken() ? children : <Navigate to="/admin/login" replace />
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/voitures" element={<Fleet type="CAR" />} />
          <Route path="/motos" element={<Fleet type="MOTO" />} />
          <Route path="/vehicules" element={<Fleet />} />
          <Route path="/vehicule/:id" element={<VehicleDetail />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={
            <RequireAuth>
              <AdminLayout />
            </RequireAuth>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="vehicules" element={<VehiclesAdmin />} />
          <Route path="reservations" element={<ReservationsAdmin />} />
          <Route path="parametres" element={<SettingsAdmin />} />
          <Route path="compte" element={<AccountAdmin />} />
        </Route>
      </Routes>
    </>
  )
}
