import React from 'react';
import {
  createRouter,
  createRoute,
  createRootRoute,
  RouterProvider,
  Outlet,
} from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';

// Layout
import Layout from './components/layout/Layout';

// Pages
import HomePage from './pages/HomePage';
import PortalSelectionPage from './pages/PortalSelectionPage';
import RoleLoginPage from './pages/auth/RoleLoginPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminSetupPage from './pages/admin/AdminSetupPage';
import StudentDashboard from './pages/student/StudentDashboard';
import StaffDashboard from './pages/staff/StaffDashboard';
import ParentDashboard from './pages/parent/ParentDashboard';
import AdmissionsManagementPage from './pages/admin/AdmissionsManagementPage';
import ProgrammeManagementPage from './pages/admin/ProgrammeManagementPage';
import StudentManagementPage from './pages/admin/StudentManagementPage';
import FeeManagementPage from './pages/admin/FeeManagementPage';
import HostelManagementPage from './pages/admin/HostelManagementPage';
import ResultsManagementPage from './pages/admin/ResultsManagementPage';
import MessagingPage from './pages/admin/MessagingPage';
import AccessApplicationsPage from './pages/admin/AccessApplicationsPage';
import CourseRegistrationPage from './pages/student/CourseRegistrationPage';
import ResultsPage from './pages/student/ResultsPage';
import TranscriptPage from './pages/student/TranscriptPage';
import FeeStatementPage from './pages/student/FeeStatementPage';
import PaymentHistoryPage from './pages/student/PaymentHistoryPage';
import ReceiptPage from './pages/student/ReceiptPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import PaymentFailurePage from './pages/PaymentFailurePage';
import PortalAccessApplicationPage from './pages/PortalAccessApplicationPage';
import IdPasswordLoginPage from './pages/IdPasswordLoginPage';

// Lazy-load pages that may have been in the old router
import AdmissionsPage from './pages/AdmissionsPage';
import AdmissionCheckerPage from './pages/AdmissionCheckerPage';
import ApplicationFormPage from './pages/ApplicationFormPage';
import HostelApplicationPage from './pages/student/HostelApplicationPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

// Root route — Layout uses Outlet internally
const rootRoute = createRootRoute({
  component: () => (
    <Layout>
      <Outlet />
    </Layout>
  ),
});

// Public routes
const indexRoute = createRoute({ getParentRoute: () => rootRoute, path: '/', component: HomePage });
const portalRoute = createRoute({ getParentRoute: () => rootRoute, path: '/portal', component: PortalSelectionPage });
const applyRoute = createRoute({ getParentRoute: () => rootRoute, path: '/apply', component: PortalAccessApplicationPage });
const idLoginRoute = createRoute({ getParentRoute: () => rootRoute, path: '/id-login', component: IdPasswordLoginPage });

// Admissions public routes
const admissionsRoute = createRoute({ getParentRoute: () => rootRoute, path: '/admissions', component: AdmissionsPage });
const admissionsApplyRoute = createRoute({ getParentRoute: () => rootRoute, path: '/admissions/apply', component: ApplicationFormPage });
const admissionsCheckRoute = createRoute({ getParentRoute: () => rootRoute, path: '/admissions/check', component: AdmissionCheckerPage });

// Role login routes
const loginStudentRoute = createRoute({ getParentRoute: () => rootRoute, path: '/login/student', component: () => <RoleLoginPage role="student" /> });
const loginStaffRoute = createRoute({ getParentRoute: () => rootRoute, path: '/login/staff', component: () => <RoleLoginPage role="staff" /> });
const loginAdminRoute = createRoute({ getParentRoute: () => rootRoute, path: '/login/admin', component: () => <RoleLoginPage role="admin" /> });
const loginParentRoute = createRoute({ getParentRoute: () => rootRoute, path: '/login/parent', component: () => <RoleLoginPage role="parent" /> });

// Dashboard routes
const studentRoute = createRoute({ getParentRoute: () => rootRoute, path: '/student', component: StudentDashboard });
const staffRoute = createRoute({ getParentRoute: () => rootRoute, path: '/staff', component: StaffDashboard });
const adminRoute = createRoute({ getParentRoute: () => rootRoute, path: '/admin', component: AdminDashboard });
const parentRoute = createRoute({ getParentRoute: () => rootRoute, path: '/parent', component: ParentDashboard });

// Admin sub-routes
const adminSetupRoute = createRoute({ getParentRoute: () => rootRoute, path: '/admin/setup', component: AdminSetupPage });
const adminAdmissionsRoute = createRoute({ getParentRoute: () => rootRoute, path: '/admin/admissions', component: AdmissionsManagementPage });
const adminProgrammesRoute = createRoute({ getParentRoute: () => rootRoute, path: '/admin/programmes', component: ProgrammeManagementPage });
const adminStudentsRoute = createRoute({ getParentRoute: () => rootRoute, path: '/admin/students', component: StudentManagementPage });
const adminFeesRoute = createRoute({ getParentRoute: () => rootRoute, path: '/admin/fees', component: FeeManagementPage });
const adminHostelRoute = createRoute({ getParentRoute: () => rootRoute, path: '/admin/hostel', component: HostelManagementPage });
const adminResultsRoute = createRoute({ getParentRoute: () => rootRoute, path: '/admin/results', component: ResultsManagementPage });
const adminMessagingRoute = createRoute({ getParentRoute: () => rootRoute, path: '/admin/messaging', component: MessagingPage });
const adminAccessApplicationsRoute = createRoute({ getParentRoute: () => rootRoute, path: '/admin/access-applications', component: AccessApplicationsPage });

// Student sub-routes
const studentCoursesRoute = createRoute({ getParentRoute: () => rootRoute, path: '/student/courses', component: CourseRegistrationPage });
const studentResultsRoute = createRoute({ getParentRoute: () => rootRoute, path: '/student/results', component: ResultsPage });
const studentTranscriptRoute = createRoute({ getParentRoute: () => rootRoute, path: '/student/transcript', component: TranscriptPage });
const studentFeesRoute = createRoute({ getParentRoute: () => rootRoute, path: '/student/fees', component: FeeStatementPage });
const studentPaymentsRoute = createRoute({ getParentRoute: () => rootRoute, path: '/student/payments', component: PaymentHistoryPage });
const studentReceiptRoute = createRoute({ getParentRoute: () => rootRoute, path: '/student/receipt/$paymentId', component: ReceiptPage });
const studentHostelRoute = createRoute({ getParentRoute: () => rootRoute, path: '/student/hostel', component: HostelApplicationPage });

// Payment routes
const paymentSuccessRoute = createRoute({ getParentRoute: () => rootRoute, path: '/payment-success', component: PaymentSuccessPage });
const paymentFailureRoute = createRoute({ getParentRoute: () => rootRoute, path: '/payment-failure', component: PaymentFailurePage });

const routeTree = rootRoute.addChildren([
  indexRoute,
  portalRoute,
  applyRoute,
  idLoginRoute,
  admissionsRoute,
  admissionsApplyRoute,
  admissionsCheckRoute,
  loginStudentRoute,
  loginStaffRoute,
  loginAdminRoute,
  loginParentRoute,
  studentRoute,
  staffRoute,
  adminRoute,
  parentRoute,
  adminSetupRoute,
  adminAdmissionsRoute,
  adminProgrammesRoute,
  adminStudentsRoute,
  adminFeesRoute,
  adminHostelRoute,
  adminResultsRoute,
  adminMessagingRoute,
  adminAccessApplicationsRoute,
  studentCoursesRoute,
  studentResultsRoute,
  studentTranscriptRoute,
  studentFeesRoute,
  studentPaymentsRoute,
  studentReceiptRoute,
  studentHostelRoute,
  paymentSuccessRoute,
  paymentFailureRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <Toaster richColors position="top-right" />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
