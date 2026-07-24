import { Routes, Route, Navigate } from 'react-router-dom';
import { PrivateRoute } from './PrivateRoute.jsx';
import { RoleBasedRoute } from './RoleBasedRoute.jsx';
import { ProtectedLayout } from '../components/layout/ProtectedLayout.jsx';
import { ROLES } from '../utils/roles.js';
import { useAuth } from '../hooks/useAuth.js';

import { Login } from '../pages/auth/Login.jsx';
import { Signup } from '../pages/auth/Signup.jsx';
import { Unauthorized } from '../pages/auth/Unauthorized.jsx';
import { ForgotPassword } from '../pages/auth/ForgotPassword.jsx';
import { ResetPassword } from '../pages/auth/ResetPassword.jsx';
import { SelectRole } from '../pages/auth/SelectRole.jsx';

import { AdminDashboard } from '../pages/dashboard/AdminDashboard.jsx';
import { StudentDashboard } from '../pages/dashboard/StudentDashboard.jsx';
import { StudentList } from '../pages/student/StudentList.jsx';
import { TeacherList } from '../pages/teacher/TeacherList.jsx';
import { Profile } from '../pages/student/Profile.jsx';
import { Courses } from '../pages/course/Courses.jsx';
import { MyCourses } from '../pages/course/MyCourses.jsx';
import { Attendance } from '../pages/attendance/Attendance.jsx';
import { MyAttendance } from '../pages/attendance/MyAttendance.jsx';
import { SendNotification } from '../pages/notification/SendNotification.jsx';
import { Payments } from '../pages/payment/Payments.jsx';
import { TeacherDashboard } from '../pages/dashboard/TeacherDashboard.jsx';

// Placeholders for forgot/reset for now

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/select-role" element={<SelectRole />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Protected Routes inside Layout */}
      <Route element={<PrivateRoute />}>
        <Route element={<ProtectedLayout />}>
          {/* Admin Routes */}
          <Route element={<RoleBasedRoute allowedRoles={[ROLES.ADMIN]} />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/students" element={<StudentList />} />
            <Route path="/admin/teachers" element={<TeacherList />} />
            <Route path="/admin/courses" element={<Courses />} />
            <Route path="/admin/attendance" element={<Attendance />} />
            <Route path="/admin/notifications/send" element={<SendNotification />} />
          </Route>

          {/* Teacher Routes */}
          <Route element={<RoleBasedRoute allowedRoles={[ROLES.TEACHER]} />}>
            <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
            <Route path="/teacher/students" element={<StudentList />} />
            <Route path="/teacher/courses" element={<Courses />} />
            <Route path="/teacher/attendance" element={<Attendance />} />
          </Route>

          {/* Student Routes */}
          <Route element={<RoleBasedRoute allowedRoles={[ROLES.STUDENT]} />}>
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/courses" element={<MyCourses />} />
            <Route path="/student/attendance" element={<MyAttendance />} />
            <Route path="/student/payments" element={<Payments />} />
          </Route>

          {/* Shared Authenticated Routes */}
          <Route path="/:role/profile" element={<Profile />} />

          {/* Redirect authenticated users to their respective dashboards from root */}
          <Route path="/" element={<RootRedirect />} />
        </Route>
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const RootRedirect = () => {
  const { isAdmin, isTeacher, isStudent } = useAuth();

  if (isAdmin) return <Navigate to="/admin/dashboard" replace />;
  if (isTeacher) return <Navigate to="/teacher/dashboard" replace />;
  if (isStudent) return <Navigate to="/student/dashboard" replace />;

  return <Navigate to="/login" replace />;
};
