export type SearchUser = {
    _id: string;
    username: string;
    email: string;
    phone?: string;
    avatar?: string;
}

export type FriendRequest = {
    _id: string;
    sender_id: SearchUser;
    receiver_id: SearchUser;
    status: "pending" | "accepted" | "rejected";
    createdAt: string;
}

export type Friend = {
    _id: string;
    username: string;
    email: string;
    phone?: string;
    avatar?: string;
    is_online?: boolean;
    last_seen?: string;
}

export type FriendStore = {
    friends: Friend[];
    searchResults: SearchUser[];
    pendingRequests: FriendRequest[];
    loading: boolean;
    searching: boolean;
    searchPage: number;
    searchHasMore: boolean;
    friendsPage: number;
    friendsHasMore: boolean;
    getFriends: () => Promise<void>;
    loadMoreFriends: () => Promise<void>;
    searchUsers: (query: string) => Promise<void>;
    loadMoreSearch: (query: string) => Promise<void>;
    sendRequest: (receiverId: string) => Promise<{ success: boolean; message: string }>;
    acceptRequest: (requestId: string) => Promise<{ success: boolean; message: string }>;
    rejectRequest: (requestId: string) => Promise<{ success: boolean; message: string }>;
    cancelRequest: (requestId: string) => Promise<{ success: boolean; message: string }>;
    removeFriend: (friendId: string) => Promise<{ success: boolean; message: string }>;
    getPendingRequests: () => Promise<void>;
    clearSearch: () => void;
    addFriend: (friend: Friend) => void;
    removeFriendFromList: (friendId: string) => void;
    removeFromPending: (requestId: string) => void;
    addToPending: (request: FriendRequest) => void;
    updateFriendOnlineStatus: (friendId: string, isOnline: boolean) => void;
}
