import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/AuthPages/LoginPage";
import SignupPage from "./pages/AuthPages/SignupPage";
import ForgotPasswordPage from "./pages/AuthPages/ForgotPasswordPage";
import GoogleCallbackPage from "./pages/AuthPages/GoogleCallbackPage";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/auth/google/callback" element={<GoogleCallbackPage />} />
                <Route path="/" element={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-white text-xl font-bold tracking-tight">QuickTalk — Home</div>} />
                <Route path="*" element={<Navigate to="/login" replace />} />
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