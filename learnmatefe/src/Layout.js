import React, { Suspense } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Aos from "aos";
import "aos/dist/aos.css";
import { useEffect } from "react";
import StudentHomePage from "./components/HomePage/Student homepage/StudentHomePage";
// import SignUp from "./components/Auth/Sign up/SignUp";
import SignIn from "./components/Auth/Sign in/SignIn";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import TutorDashboard from "./components/Tutor/TutorDashboard";
import BookingPage from "./pages/Booking/bookingPage";
import TutorListPage from "./pages/Booking/tutorPage";
import BookingHistoryPage from "./pages/User/BookingHistory";
import SavedTutorsPage from "./pages/Booking/SavedTutorPage";
import ProtectedRoute from "./ProtectRoutes";
import Header from "./components/Layout/Header/Header";
import Footer from "./components/Layout/Footer/Footer";
import TutorProfilePage from "./pages/Tutor/TutorProfilePage";
import MyCourses from "./pages/User/AllCoursesSchedule";
import Profile from "./pages/Profile/Profile";
import AuthCallback from "./components/Auth/AuthCallback";
import EnterOTPRegister from "./components/Auth/Sign up/OTP/EnterOTPRegister";
import RequestPasswordReset from "./components/Auth/reset password/RequestPasswordReset";
import ResetPassword from "./components/Auth/reset password/ResetPassword";

import Messenger from "./Message Socket/Page/Messenger";
import PaymentPage from "./pages/User/PaymentPage";
import PaymentResult from "./pages/User/paymentResult";
import TutorApplicationForm from "./pages/Profile/TutorApplicationForm";
import ReviewCoursePage from "./pages/Review/ReviewCoursePage";

import AdminLayout from "./components/Admin/AdminLayout";
import AdminOverview from "./components/Admin/AdminOverview";
import AdminDashboard from "./components/Admin/AdminDashboard";
import MyCoursesPage from "./pages/User/MyCoursesPage";
import CourseDetails from "./pages/User/CourseDetails";
import StudentQuizTake from "./pages/User/StudentQuizTake";
import StudentQuizResult from "./pages/User/StudentQuizResult";
import StudentQuizOverview from "./pages/User/StudentQuizOverview";
import SubmitAssignment from "./pages/User/SubmitAssignment";
import ViewAssignmentFeedback from "./pages/User/ViewAssignmentFeedback";
import TutorManagement from "./components/Admin/TutorManagement";
import ReviewManagement from "./components/Admin/ReviewManagement";
import BookingManagement from "./components/Admin/BookingManagement";
import ReportManagement from "./components/Admin/ReportManagement";
import "./tailwind.css"
import WithdrawalManagement from "./components/Admin/WithdrawalManagement";
import TransactionHistory from "./components/Admin/TransactionHistory";

const AppLayout = ({ children }) => {
  const location = useLocation();
  const noHeaderFooterRoutes = ["/otp-verify", "/auth/callback"];
  const hideHeaderFooter = noHeaderFooterRoutes.includes(location.pathname);
  useEffect(() => {}, []);
  return (
    <>
      {!hideHeaderFooter && <Header />}
      {children}
      {!hideHeaderFooter && <Footer />}
    </>
  );
};
const Layout = () => {
  useEffect(() => {
    Aos.init({ duration: 1000 });
  }, []);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<StudentHomePage />} />
          {/* <Route path="/signup" element={<SignUp />} /> */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/otp-verify" element={<EnterOTPRegister />} />
          <Route path="auth/callback" element={<AuthCallback />} />

          <Route
            path="/messenger"
            element={
              <ProtectedRoute allowedRoles={['tutor', 'student', 'admin']}>
              <Messenger />
              </ProtectedRoute>
            }
          />
          <Route
            path="/messenger/:conversationId"
            element={
              <ProtectedRoute allowedRoles={['tutor', 'student', 'admin']}>
              <Messenger />
              </ProtectedRoute>
            }
          />
          <Route path="/forgot-password" element={<RequestPasswordReset />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminLayout>
                  <AdminOverview />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/user-management"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminLayout>
                  <AdminDashboard />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/tutor-management"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminLayout>
                  <TutorManagement />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/review-management"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminLayout>
                  <ReviewManagement />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/booking-management"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminLayout>
                  <BookingManagement />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/report-management"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminLayout>
                  <ReportManagement />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/withdrawal-management"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminLayout>
                  <WithdrawalManagement />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/transaction-history"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminLayout>
                  <TransactionHistory />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/TutorDashboard"
            element={
            <ProtectedRoute allowedRoles={['tutor']}>
              <TutorDashboard />
            </ProtectedRoute>
            }
          />
          <Route />
          <Route
            path="/tutor"
            element={
              <ProtectedRoute allowedRoles={["student", "admin", "tutor"]}>
                <AppLayout>
                  <TutorListPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route />
          <Route
            path="/tutor/profile/:tutorId"
            element={
              <ProtectedRoute allowedRoles={["student", "admin", "tutor"]}>
                <AppLayout>
                  <TutorProfilePage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/saved-tutors"
            element={
              <ProtectedRoute allowedRoles={["student", "tutor"]}>
                <AppLayout>
                  <SavedTutorsPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/book/:tutorId"
            element={
              <ProtectedRoute allowedRoles={["student", "tutor"]}>
                <BookingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user/bookinghistory"
            element={
              <ProtectedRoute allowedRoles={["tutor", "student"]}>
                <BookingHistoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user/my-courses"
            element={
              <ProtectedRoute allowedRoles={["tutor", "student"]}>
                <AppLayout>
                  <MyCoursesPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/user/my-courses/:id"
            element={
              <ProtectedRoute allowedRoles={["tutor", "student"]}>
                <AppLayout>
                  <CourseDetails />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/user/quizzes/:id"
            element={
              <ProtectedRoute allowedRoles={["tutor", "student"]}>
                <AppLayout>
                  <StudentQuizOverview />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/user/quizzes/:id/take"
            element={
              <ProtectedRoute allowedRoles={["tutor", "student"]}>
                <AppLayout>
                  <StudentQuizTake />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/user/quizzes/:id/result"
            element={
              <ProtectedRoute allowedRoles={["tutor", "student"]}>
                <AppLayout>
                  <StudentQuizResult />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/user/assignments/:id/submit"
            element={
              <ProtectedRoute allowedRoles={["tutor", "student"]}>
                <AppLayout>
                  <SubmitAssignment />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/user/assignments/:id/feedback"
            element={
              <ProtectedRoute allowedRoles={["tutor", "student"]}>
                <AppLayout>
                  <ViewAssignmentFeedback />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute allowedRoles={["tutor", "student", "admin"]}>
                <AppLayout>
                  <Profile />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route path="auth/callback" element={<AuthCallback />} />
          <Route
            path="/user/paymentinfo"
            element={
              <ProtectedRoute allowedRoles={["tutor", "student"]}>
                <AppLayout>
                  <PaymentPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/tutor-application"
            element={
              <ProtectedRoute allowedRoles={["tutor", "student"]}>
                <AppLayout>
                  <TutorApplicationForm />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route path="/payment/result" element={<PaymentResult />} />
          <Route
            path="/review/:bookingId"
            element={
              <ProtectedRoute allowedRoles={["student", "tutor"]}>
                <AppLayout>
                  <ReviewCoursePage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </Suspense>
  );
};

export default Layout;
