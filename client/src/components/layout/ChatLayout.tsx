import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Sidebar from "../ui/Sidebar";
import ConversationList from "../chat/ConversationList";
import FriendsList from "../friends/FriendsList";
import NotificationList from "../notification/NotificationList";
import { useSocketStore } from "../../store/socketStore";
import { useNotificationStore } from "../../store/notificationStore";
import { useChatStore } from "../../store/chatStore";
import BrandLogo from "../ui/BrandLogo";

const ChatLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { connect, disconnect } = useSocketStore();
    const { fetchUnreadCount } = useNotificationStore();
    const { activeConversationId } = useChatStore();

    useEffect(() => {
        connect();
        fetchUnreadCount();
        return () => disconnect();
    }, [connect, disconnect, fetchUnreadCount]);

    const isMobileListOpen = location.pathname === "/"
        ? !activeConversationId
        : ["/friends", "/notifications"].includes(location.pathname);

    const renderSidePanel = () => {
        const isMobile = isMobileListOpen ? "flex md:w-[380px] w-full" : "hidden md:flex md:w-[380px]";
        
        switch (location.pathname) {
            case "/friends":
                return <div className={`${isMobile}`}><FriendsList /></div>;
            case "/notifications":
                return <div className={`${isMobile}`}><NotificationList /></div>;
            case "/add-friend":
            case "/profile":
                return null;
            default:
                return <div className={`${isMobile}`}><ConversationList /></div>;
        }
    };

    const hasSidePanel = !["/add-friend", "/profile"].includes(location.pathname);
    const mainContentVisibility = hasSidePanel && isMobileListOpen ? "hidden md:flex" : "flex";
    const shouldShowMobileBrand = location.pathname !== "/" || !activeConversationId;

    return (
        <div className="h-screen w-screen flex flex-col bg-[#0a0e1a] overflow-hidden">
            {shouldShowMobileBrand && (
                <div className="md:hidden flex h-[56px] items-center border-b border-white/[0.06] bg-[#080c14]/95 px-4 backdrop-blur-xl shrink-0">
                    <BrandLogo mode="compact" onClick={() => navigate("/")} className="opacity-90" />
                </div>
            )}
            <div className="flex-1 flex overflow-hidden pb-[60px] md:pb-0">
                <Sidebar />
                {renderSidePanel()}
                <main className={`flex-1 flex-col min-w-0 ${mainContentVisibility}`}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default ChatLayout;
