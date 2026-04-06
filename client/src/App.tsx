import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import LoginPage from "./pages/AuthPages/LoginPage";
import SignupPage from "./pages/AuthPages/SignupPage";
import ForgotPasswordPage from "./pages/AuthPages/ForgotPasswordPage";
import GoogleCallbackPage from "./pages/AuthPages/GoogleCallbackPage";
import HomePage from "./pages/DashboardPages/HomePage";
import FriendsPage from "./pages/DashboardPages/FriendsPage";
import AddFriendPage from "./pages/DashboardPages/AddFriendPage";
import NotificationPage from "./pages/DashboardPages/NotificationPage";
import ProfilePage from "./pages/DashboardPages/ProfilePage";
import NotFound from "./pages/ErrorPages/NotFound";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import GuestRoute from "./components/auth/GuestRoute";
import ChatLayout from "./components/layout/ChatLayout";
import { useAuthStore } from "./store/authStore";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const App = () => {
    const { getSession } = useAuthStore();

    useEffect(() => {
        getSession();
    }, [getSession]);

    return (
        <Router>
            <Routes>
                <Route element={<GuestRoute />}>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<SignupPage />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                </Route>

                <Route path="/auth/google/callback" element={<GoogleCallbackPage />} />

                <Route element={<ProtectedRoute />}>
                    <Route element={<ChatLayout />}>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/friends" element={<FriendsPage />} />
                        <Route path="/add-friend" element={<AddFriendPage />} />
                        <Route path="/notifications" element={<NotificationPage />} />
                        <Route path="/profile" element={<ProfilePage />} />
                    </Route>
                </Route>

                <Route path="*" element={<NotFound />} />
            </Routes>
            
            <ToastContainer
                position="bottom-right"
                autoClose={4000}
                hideProgressBar={false}
                newestOnTop={true}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="dark"
                toastClassName={() => 
                    "relative flex p-4 mb-4 sm:mb-5 min-h-[60px] rounded-2xl justify-between overflow-hidden cursor-pointer bg-slate-900/80 backdrop-blur-xl border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.5)] hover:border-white/20 hover:shadow-[0_8px_30px_rgba(99,102,241,0.15)] transition-all duration-300"
                }
                progressClassName="!bg-gradient-to-r !from-indigo-500 !via-purple-500 !to-indigo-500 !h-[3px] !opacity-100"
                closeButton={false}
            />
        </Router>
    );
};

export default App;