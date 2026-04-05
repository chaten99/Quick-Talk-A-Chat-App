import { Outlet } from "react-router-dom";
import Sidebar from "../ui/Sidebar";
import ConversationList from "../chat/ConversationList";

const ChatLayout = () => {
    return (
        <div className="h-screen w-screen flex bg-[#0a0e1a] overflow-hidden">
            <Sidebar />
            <ConversationList />
            <main className="flex-1 flex flex-col min-w-0">
                <Outlet />
            </main>
        </div>
    );
};

export default ChatLayout;
