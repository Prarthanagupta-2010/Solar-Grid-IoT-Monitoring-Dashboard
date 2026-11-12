import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import LoadingState from './components/LoadingState'

const LoginPage = lazy(() => import('./pages/LoginPage'))
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const DevicesPage = lazy(() => import('./pages/DevicesPage'))
const DeviceDetailPage = lazy(() => import('./pages/DeviceDetailPage'))
const LiveMonitoringPage = lazy(() => import('./pages/LiveMonitoringPage'))
const AlertsPage = lazy(() => import('./pages/AlertsPage'))
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'))
const MaintenancePage = lazy(() => import('./pages/MaintenancePage'))
const UsersPage = lazy(() => import('./pages/UsersPage'))
const SettingsPage = lazy(() => import('./pages/SettingsPage'))

export default function App() {
  return (
    <Suspense fallback={<LoadingState />}><Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route index element={<DashboardPage />} />
          <Route path="devices" element={<DevicesPage />} />
          <Route path="devices/:id" element={<DeviceDetailPage />} />
          <Route path="live" element={<LiveMonitoringPage />} />
          <Route path="alerts" element={<AlertsPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="maintenance" element={<MaintenancePage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes></Suspense>
  )
}
