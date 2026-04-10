import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect, Suspense, lazy } from "react";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import GuestRoute from "./components/auth/GuestRoute";
import ChatLayout from "./components/layout/ChatLayout";
import { useAuthStore } from "./store/authStore";
import { ToastContainer } from "react-toastify";
import { Loader2 } from "lucide-react";
import "react-toastify/dist/ReactToastify.css";

const LoginPage = lazy(() => import("./pages/AuthPages/LoginPage"));
const SignupPage = lazy(() => import("./pages/AuthPages/SignupPage"));
const ForgotPasswordPage = lazy(() => import("./pages/AuthPages/ForgotPasswordPage"));
const GoogleCallbackPage = lazy(() => import("./pages/AuthPages/GoogleCallbackPage"));
const HomePage = lazy(() => import("./pages/DashboardPages/HomePage"));
const FriendsPage = lazy(() => import("./pages/DashboardPages/FriendsPage"));
const AddFriendPage = lazy(() => import("./pages/DashboardPages/AddFriendPage"));
const NotificationPage = lazy(() => import("./pages/DashboardPages/NotificationPage"));
const ProfilePage = lazy(() => import("./pages/DashboardPages/ProfilePage"));
const NotFound = lazy(() => import("./pages/ErrorPages/NotFound"));

const PageLoader = () => (
    <div className="flex-1 flex flex-col items-center justify-center bg-[#0a0e1a] relative overflow-hidden h-screen w-full">
        <div className="absolute top-0 right-0 w-[500px] h-[400px] bg-indigo-600/[0.04] blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[300px] bg-purple-600/[0.03] blur-[100px] rounded-full pointer-events-none"></div>
        <div className="relative z-10 flex flex-col items-center gap-6">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin opacity-80" />
        </div>
    </div>
);

const App = () => {
    const { getSession } = useAuthStore();

    useEffect(() => {
        getSession();
    }, [getSession]);

    return (
        <Router>
            <Suspense fallback={<PageLoader />}>
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
            </Suspense>
            
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