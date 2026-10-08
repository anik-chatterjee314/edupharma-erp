import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

// Layouts
import AuthLayout from './layouts/AuthLayout';
import StudentLayout from './layouts/StudentLayout';
import AdminLayout from './layouts/AdminLayout';

// Auth Pages
import Login from './pages/auth/Login';
import SetupPassword from './pages/auth/SetupPassword';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import Unauthorized from './pages/auth/Unauthorized';

// Student Pages
import StudentDashboard from './pages/student/Dashboard';
import StudentProfile from './pages/student/Profile';
import StudentDocuments from './pages/student/Documents';
import StudentFinance from './pages/student/Finance';
import StudentFeeReceipt from './pages/student/FeeReceipt';
import StudentAttendance from './pages/student/Attendance';
import StudentStudyMaterial from './pages/student/StudyMaterial';
import StudentTestsResults from './pages/student/TestsResults';
import StudentNotifications from './pages/student/Notifications';
import StudentSettings from './pages/student/Settings';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import StudentManagement from './pages/admin/StudentManagement';
import StudentDetail from './pages/admin/StudentDetail';
import AttendanceManagement from './pages/admin/AttendanceManagement';
import FinanceManagement from './pages/admin/FinanceManagement';
import TestManagement from './pages/admin/TestManagement';
import DocumentManagement from './pages/admin/DocumentManagement';
import StudyMaterialManagement from './pages/admin/StudyMaterialManagement';
import Reminders from './pages/admin/Reminders';
import AcademyFinance from './pages/admin/AcademyFinance';
import Reports from './pages/admin/Reports';
import AdminSettings from './pages/admin/AdminSettings';

// --- Route Guards ---

const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children || <Outlet />;
};

const StudentRoute = ({ children }) => {
  const { isAuthenticated, isStudent } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isStudent) return <Navigate to="/unauthorized" replace />;
  return children || <Outlet />;
};

const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/unauthorized" replace />;
  return children || <Outlet />;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, isAdmin } = useAuth();
  if (isAuthenticated) {
    return <Navigate to={isAdmin ? '/admin/dashboard' : '/student/dashboard'} replace />;
  }
  return children || <Outlet />;
};

// --- App ---

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicRoute />}>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/setup-password" element={<SetupPassword />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
          </Route>
        </Route>

        {/* Unauthorized */}
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Student Routes */}
        <Route element={<StudentRoute />}>
          <Route element={<StudentLayout />}>
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/profile" element={<StudentProfile />} />
            <Route path="/student/documents" element={<StudentDocuments />} />
            <Route path="/student/finance" element={<StudentFinance />} />
            <Route path="/student/finance/receipt/:receiptNo" element={<StudentFeeReceipt />} />
            <Route path="/student/attendance" element={<StudentAttendance />} />
            <Route path="/student/study-material" element={<StudentStudyMaterial />} />
            <Route path="/student/tests" element={<StudentTestsResults />} />
            <Route path="/student/notifications" element={<StudentNotifications />} />
            <Route path="/student/settings" element={<StudentSettings />} />
          </Route>
        </Route>

        {/* Admin Routes */}
        <Route element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/students" element={<StudentManagement />} />
            <Route path="/admin/students/:studentId" element={<StudentDetail />} />
            <Route path="/admin/attendance" element={<AttendanceManagement />} />
            <Route path="/admin/finance" element={<FinanceManagement />} />
            <Route path="/admin/tests" element={<TestManagement />} />
            <Route path="/admin/documents" element={<DocumentManagement />} />
            <Route path="/admin/study-material" element={<StudyMaterialManagement />} />
            <Route path="/admin/reminders" element={<Reminders />} />
            <Route path="/admin/academy-finance" element={<AcademyFinance />} />
            <Route path="/admin/reports" element={<Reports />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
          </Route>
        </Route>

        {/* Root redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
