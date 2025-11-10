import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  FileText,
  CalendarDays,
  ClipboardList,
  ClipboardCheck,
  RefreshCcw,
  LogOut,
  Sun,
  Moon,
  ChevronDown,
} from "lucide-react";
import { doLogout } from "../../redux/action/userAction";
import TutorBookingList from "./view/TutorBookingList";
import MaterialUploader from "./view/MaterialUploader";
import AvailableSchedule from "./view/AvailableSchedule";
import TutorSchedule from "./view/TutorSchedule";
import TutorAssignmentManager from "./view/Tutor Assignment/TutorAssignmentManager";
import TutorChangeRequests from "./view/TutorChangeRequests";
import TutorQuizManager from "./view/Tutor Quiz/TutorQuizManager";

const menuItems = [
  { id: "bookings", label: "Quản lý Booking", icon: <BookOpen />, component: <TutorBookingList /> },
  { id: "materials", label: "Tài liệu", icon: <FileText />, component: <MaterialUploader /> },
  { id: "availableSchedule", label: "Lịch trống", icon: <CalendarDays />, component: <AvailableSchedule /> },
  { id: "tutorschedule", label: "Lịch dạy", icon: <ClipboardList />, component: <TutorSchedule /> },
  { id: "managequiz", label: "Quản lý Quiz", icon: <ClipboardCheck />, component: <TutorQuizManager /> },
  { id: "createassignment", label: "Assignment", icon: <FileText />, component: <TutorAssignmentManager /> },
  { id: "changerequestschedule", label: "Đổi lịch", icon: <RefreshCcw />, component: <TutorChangeRequests /> },
];

const TutorDashboard = () => {
  const [activeTab, setActiveTab] = useState("bookings");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("theme") === "dark");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const dropdownRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.account);

  // Toggle dark mode
  useEffect(() => {
    document.body.classList.toggle("dark", darkMode);
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  // Close dropdown when click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    dispatch(doLogout());
    navigate("/");
  };

  const activeComponent = menuItems.find((item) => item.id === activeTab)?.component || <TutorBookingList />;

  return (
    <div className={`flex h-screen ${darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-100 text-gray-900"}`}>
      {/* Sidebar */}
      <motion.aside
        animate={{ width: sidebarOpen ? 194 : 80 }}
        transition={{ duration: 0.3 }}
        className={`flex flex-col bg-indigo-600 dark:bg-gray-800 text-white`}
      >
        {/* Logo & toggle */}
        <div className="flex items-center justify-between p-4">
          {sidebarOpen && <span className="font-bold text-lg">🎓 LearnMate</span>}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-white focus:outline-none"
          >
            {sidebarOpen ? "<" : ">"}
          </button>
        </div>

        {/* Menu */}
        <div className="flex-1 mt-4">
          {menuItems.map((item) => (
            <motion.div
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              whileHover={{ scale: 1.05 }}
              className={`flex items-center gap-3 p-3 cursor-pointer rounded-md mx-2 my-1 transition-colors ${
                activeTab === item.id ? "bg-indigo-500" : "hover:bg-indigo-400"
              }`}
            >
              <div className="text-lg">{item.icon}</div>
              {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
            </motion.div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-indigo-500">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full p-2 rounded-md hover:bg-red-500 transition-colors"
          >
            <LogOut size={18} />
            {sidebarOpen && <span>Đăng xuất</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="flex justify-between items-center p-4 border-b border-gray-300 dark:border-gray-700">
          <h2 className="font-semibold text-xl">{menuItems.find((m) => m.id === activeTab)?.label}</h2>
          <div className="flex items-center gap-4 relative">
            {/* Dark mode toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* User dropdown */}
            <div ref={dropdownRef} className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 focus:outline-none"
              >
                <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center font-bold">
                  {user?.username?.charAt(0)?.toUpperCase() || "T"}
                </div>
                <span>{user?.username || "Tutor"}</span>
                <ChevronDown size={16} />
              </button>

              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50"
                  >
                    <button
                      onClick={() => navigate('/profile')}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      Profile
                    </button>
                    <button
                      onClick={() => alert("Settings clicked")}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      Settings
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 hover:bg-red-500 hover:text-white dark:hover:bg-red-600 transition-colors"
                    >
                      Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
            >
              {activeComponent}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default TutorDashboard;
