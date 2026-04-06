import { Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Sidebar from "../ui/Sidebar";
import ConversationList from "../chat/ConversationList";
import FriendsList from "../friends/FriendsList";
import NotificationList from "../notification/NotificationList";
import { useSocketStore } from "../../store/socketStore";
import { useNotificationStore } from "../../store/notificationStore";

const ChatLayout = () => {
    const location = useLocation();
    const { connect, disconnect } = useSocketStore();
    const { fetchUnreadCount } = useNotificationStore();

    useEffect(() => {
        connect();
        fetchUnreadCount();
        return () => disconnect();
    }, [connect, disconnect, fetchUnreadCount]);

    const renderSidePanel = () => {
        switch (location.pathname) {
            case "/friends":
                return <FriendsList />;
            case "/notifications":
                return <NotificationList />;
            case "/add-friend":
            case "/profile":
                return null;
            default:
                return <ConversationList />;
        }
    };

    return (
        <div className="h-screen w-screen flex bg-[#0a0e1a] overflow-hidden">
            <Sidebar />
            {renderSidePanel()}
            <main className="flex-1 flex flex-col min-w-0">
                <Outlet />
            </main>
        </div>
    );
};

export default ChatLayout;
