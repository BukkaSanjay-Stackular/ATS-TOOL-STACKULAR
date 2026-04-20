import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import RecruitmentLayout from './components/layout/RecruitmentLayout'
import DashboardPage from './pages/recruitment/DashboardPage'
import JobPostingPage from './pages/recruitment/JobPostingPage'
import InterviewerDashboard from './pages/interviewer/InterviewerDashboard'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route
            path="/recruitment"
            element={
              <ProtectedRoute role="recruitment">
                <RecruitmentLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="job-posting" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="job-posting" element={<JobPostingPage />} />
          </Route>

          <Route
            path="/interviewer/dashboard"
            element={
              <ProtectedRoute role="interviewer">
                <InterviewerDashboard />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
