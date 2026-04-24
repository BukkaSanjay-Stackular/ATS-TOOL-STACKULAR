import { createRouter, createRoute, createRootRoute, Outlet, redirect } from '@tanstack/react-router'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import RecruitmentLayout from './components/layout/RecruitmentLayout'
import InterviewerLayout from './components/layout/InterviewerLayout'
import DashboardPage from './pages/recruitment/DashboardPage'
import JobPostingPage from './pages/recruitment/JobPostingPage'
import InterviewerDashboard from './pages/interviewer/InterviewerDashboard'
import InterviewerJobPostingPage from './pages/interviewer/InterviewerJobPostingPage'

// The root route is just a shell — all it does is render child routes via <Outlet />.
// Layout and auth guarding happen in the child routes (recruitmentRoute, interviewerRoute).
const rootRoute = createRootRoute({
  component: () => <Outlet />,
})

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
})

const recruitmentRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/recruitment',
  component: () => (
    <ProtectedRoute role="recruitment">
      <RecruitmentLayout />
    </ProtectedRoute>
  ),
})

// /recruitment with no sub-path → redirect to the default tab
const recruitmentIndexRoute = createRoute({
  getParentRoute: () => recruitmentRoute,
  path: '/',
  beforeLoad: () => { throw redirect({ to: '/recruitment/job-posting' }) },
})

const recruitmentDashboardRoute = createRoute({
  getParentRoute: () => recruitmentRoute,
  path: 'dashboard',
  component: DashboardPage,
})

const recruitmentJobPostingRoute = createRoute({
  getParentRoute: () => recruitmentRoute,
  path: 'job-posting',
  component: JobPostingPage,
})

const interviewerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/interviewer',
  component: () => (
    <ProtectedRoute role="interviewer">
      <InterviewerLayout />
    </ProtectedRoute>
  ),
})

// /interviewer with no sub-path → redirect to the default tab
const interviewerIndexRoute = createRoute({
  getParentRoute: () => interviewerRoute,
  path: '/',
  beforeLoad: () => { throw redirect({ to: '/interviewer/dashboard' }) },
})

const interviewerDashboardRoute = createRoute({
  getParentRoute: () => interviewerRoute,
  path: 'dashboard',
  component: InterviewerDashboard,
})

const interviewerJobPostingRoute = createRoute({
  getParentRoute: () => interviewerRoute,
  path: 'job-posting',
  component: InterviewerJobPostingPage,
})

// Explicit index route — TanStack Router's '*' wildcard does not match '/'
const rootIndexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => { throw redirect({ to: '/login' }) },
})

const catchAllRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '*',
  beforeLoad: () => { throw redirect({ to: '/login' }) },
})

const routeTree = rootRoute.addChildren([
  rootIndexRoute,
  loginRoute,
  recruitmentRoute.addChildren([
    recruitmentIndexRoute,
    recruitmentDashboardRoute,
    recruitmentJobPostingRoute,
  ]),
  interviewerRoute.addChildren([
    interviewerIndexRoute,
    interviewerDashboardRoute,
    interviewerJobPostingRoute,
  ]),
  catchAllRoute,
])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
