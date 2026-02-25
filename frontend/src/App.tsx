import { RouterProvider, createRouter, createRootRoute, createRoute, Outlet } from '@tanstack/react-router';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';

// Pages
import HomePage from './pages/HomePage';
import AdmissionsPage from './pages/AdmissionsPage';
import ApplicationFormPage from './pages/ApplicationFormPage';
import AdmissionCheckerPage from './pages/AdmissionCheckerPage';
import StudentDashboard from './pages/student/StudentDashboard';
import CourseRegistrationPage from './pages/student/CourseRegistrationPage';
import FeeStatementPage from './pages/student/FeeStatementPage';
import ResultsPage from './pages/student/ResultsPage';
import TranscriptPage from './pages/student/TranscriptPage';
import HostelApplicationPage from './pages/student/HostelApplicationPage';
import PaymentHistoryPage from './pages/student/PaymentHistoryPage';
import ReceiptPage from './pages/student/ReceiptPage';
import ParentDashboard from './pages/parent/ParentDashboard';
import StaffDashboard from './pages/staff/StaffDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import ProgrammeManagementPage from './pages/admin/ProgrammeManagementPage';
import StudentManagementPage from './pages/admin/StudentManagementPage';
import StaffManagementPage from './pages/admin/StaffManagementPage';
import AdmissionsManagementPage from './pages/admin/AdmissionsManagementPage';
import ResultsManagementPage from './pages/admin/ResultsManagementPage';
import FeeManagementPage from './pages/admin/FeeManagementPage';
import HostelManagementPage from './pages/admin/HostelManagementPage';
import MessagingPage from './pages/admin/MessagingPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import PaymentFailurePage from './pages/PaymentFailurePage';
import Layout from './components/layout/Layout';

// Root route — Layout renders <Outlet /> internally
const rootRoute = createRootRoute({
  component: Layout,
});

// Public routes
const indexRoute = createRoute({ getParentRoute: () => rootRoute, path: '/', component: HomePage });
const admissionsRoute = createRoute({ getParentRoute: () => rootRoute, path: '/admissions', component: AdmissionsPage });
const applyRoute = createRoute({ getParentRoute: () => rootRoute, path: '/admissions/apply', component: ApplicationFormPage });
const checkRoute = createRoute({ getParentRoute: () => rootRoute, path: '/admissions/check', component: AdmissionCheckerPage });

// Payment routes
const paymentSuccessRoute = createRoute({ getParentRoute: () => rootRoute, path: '/payment-success', component: PaymentSuccessPage });
const paymentFailureRoute = createRoute({ getParentRoute: () => rootRoute, path: '/payment-failure', component: PaymentFailurePage });

// Student routes
const studentRoute = createRoute({ getParentRoute: () => rootRoute, path: '/student', component: StudentDashboard });
const studentCoursesRoute = createRoute({ getParentRoute: () => rootRoute, path: '/student/courses', component: CourseRegistrationPage });
const studentFeesRoute = createRoute({ getParentRoute: () => rootRoute, path: '/student/fees', component: FeeStatementPage });
const studentResultsRoute = createRoute({ getParentRoute: () => rootRoute, path: '/student/results', component: ResultsPage });
const studentTranscriptRoute = createRoute({ getParentRoute: () => rootRoute, path: '/student/transcript', component: TranscriptPage });
const studentHostelRoute = createRoute({ getParentRoute: () => rootRoute, path: '/student/hostel', component: HostelApplicationPage });
const studentPaymentsRoute = createRoute({ getParentRoute: () => rootRoute, path: '/student/payments', component: PaymentHistoryPage });
const studentReceiptRoute = createRoute({ getParentRoute: () => rootRoute, path: '/student/receipt/$paymentId', component: ReceiptPage });

// Parent routes
const parentRoute = createRoute({ getParentRoute: () => rootRoute, path: '/parent', component: ParentDashboard });

// Staff routes
const staffRoute = createRoute({ getParentRoute: () => rootRoute, path: '/staff', component: StaffDashboard });

// Admin routes
const adminRoute = createRoute({ getParentRoute: () => rootRoute, path: '/admin', component: AdminDashboard });
const adminProgrammesRoute = createRoute({ getParentRoute: () => rootRoute, path: '/admin/programmes', component: ProgrammeManagementPage });
const adminStudentsRoute = createRoute({ getParentRoute: () => rootRoute, path: '/admin/students', component: StudentManagementPage });
const adminStaffRoute = createRoute({ getParentRoute: () => rootRoute, path: '/admin/staff', component: StaffManagementPage });
const adminAdmissionsRoute = createRoute({ getParentRoute: () => rootRoute, path: '/admin/admissions', component: AdmissionsManagementPage });
const adminResultsRoute = createRoute({ getParentRoute: () => rootRoute, path: '/admin/results', component: ResultsManagementPage });
const adminFeesRoute = createRoute({ getParentRoute: () => rootRoute, path: '/admin/fees', component: FeeManagementPage });
const adminHostelRoute = createRoute({ getParentRoute: () => rootRoute, path: '/admin/hostel', component: HostelManagementPage });
const adminMessagingRoute = createRoute({ getParentRoute: () => rootRoute, path: '/admin/messaging', component: MessagingPage });

const routeTree = rootRoute.addChildren([
  indexRoute,
  admissionsRoute,
  applyRoute,
  checkRoute,
  paymentSuccessRoute,
  paymentFailureRoute,
  studentRoute,
  studentCoursesRoute,
  studentFeesRoute,
  studentResultsRoute,
  studentTranscriptRoute,
  studentHostelRoute,
  studentPaymentsRoute,
  studentReceiptRoute,
  parentRoute,
  staffRoute,
  adminRoute,
  adminProgrammesRoute,
  adminStudentsRoute,
  adminStaffRoute,
  adminAdmissionsRoute,
  adminResultsRoute,
  adminFeesRoute,
  adminHostelRoute,
  adminMessagingRoute,
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
      <RouterProvider router={router} />
      <Toaster richColors position="top-right" />
    </ThemeProvider>
  );
}
