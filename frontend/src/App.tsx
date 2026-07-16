import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { Suspense, lazy } from 'react'
import Navbar from '@components/layout/Navbar'
import { SettingsProvider } from '@hooks/useSettings'
import { AuthProvider } from '@store/AuthContext'
import PageLoader from '@components/ui/PageLoader'

// Lazy-load pages for code splitting
const LandingPage    = lazy(() => import('@pages/LandingPage'))
const TranslatePage  = lazy(() => import('@pages/TranslatePage'))
const TrainPage      = lazy(() => import('@pages/TrainPage'))
const LibraryPage    = lazy(() => import('@pages/LibraryPage'))
const CallPage       = lazy(() => import('@pages/CallPage'))
const SettingsPage   = lazy(() => import('@pages/SettingsPage'))
const DashboardPage  = lazy(() => import('@pages/DashboardPage'))
const LoginPage      = lazy(() => import('@pages/LoginPage'))
const RegisterPage   = lazy(() => import('@pages/RegisterPage'))
const LearnPage      = lazy(() => import('@pages/LearnPage'))
const ChatPage       = lazy(() => import('@pages/ChatPage'))
const AuthCallbackPage = lazy(() => import('@pages/AuthCallbackPage'))

function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <Router>
          <div className="min-h-screen bg-dark-950 relative overflow-x-hidden">
            {/* Ambient background orbs */}
            <div className="floating-orb w-96 h-96 bg-purple-700/20 -top-48 -left-48" />
            <div className="floating-orb w-80 h-80 bg-purple-900/15 top-1/2 -right-40" />
            <div className="floating-orb w-64 h-64 bg-violet-800/10 bottom-0 left-1/3" />

            <Navbar />

            <main className="relative z-10">
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/"           element={<LandingPage />} />
                  <Route path="/translate"  element={<TranslatePage />} />
                  <Route path="/train"      element={<TrainPage />} />
                  <Route path="/library"    element={<LibraryPage />} />
                  <Route path="/learn"      element={<LearnPage />} />
                  <Route path="/call"       element={<CallPage />} />
                  <Route path="/settings"   element={<SettingsPage />} />
                  <Route path="/dashboard"  element={<DashboardPage />} />
                  <Route path="/chat"       element={<ChatPage />} />
                  <Route path="/login"      element={<LoginPage />} />
                  <Route path="/register"   element={<RegisterPage />} />
                  <Route path="/auth/callback" element={<AuthCallbackPage />} />
                  <Route path="*"           element={<Navigate to="/" replace />} />
                </Routes>
              </Suspense>
            </main>

            <Toaster
              position="bottom-right"
              toastOptions={{
                style: {
                  background: 'rgba(17, 17, 39, 0.95)',
                  border: '1px solid rgba(168, 85, 247, 0.3)',
                  color: '#f9fafb',
                  backdropFilter: 'blur(12px)',
                  borderRadius: '12px',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 0 20px rgba(168, 85, 247, 0.1)',
                },
                success: { iconTheme: { primary: '#A855F7', secondary: '#fff' } },
                error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
              }}
            />
          </div>
        </Router>
      </SettingsProvider>
    </AuthProvider>
  )
}

export default App
