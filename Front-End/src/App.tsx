import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { JDProvider } from './context/JDContext'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import RecruitmentLayout from './components/layout/RecruitmentLayout'
import InterviewerLayout from './components/layout/InterviewerLayout'
import DashboardPage from './pages/recruitment/DashboardPage'
import JobPostingPage from './pages/recruitment/JobPostingPage'
import InterviewerDashboard from './pages/interviewer/InterviewerDashboard'
import InterviewerJobPostingPage from './pages/interviewer/InterviewerJobPostingPage'

export default function App() {
  return (
    <JDProvider>
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
              path="/interviewer"
              element={
                <ProtectedRoute role="interviewer">
                  <InterviewerLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<InterviewerDashboard />} />
              <Route path="job-posting" element={<InterviewerJobPostingPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </JDProvider>
  )
}
