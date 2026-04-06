export type Login = {
    email: string;
    password: string;
}

export type SendOtp = {
    email: string;
}

export type VerifyOtp = {
    email: string;
    otp: string;
}

export type Signup = {
    username: string;
    email: string;
    password: string;
    phone?: string;
}

export type ResetPassword = {
    email: string;
    otp: string;
    newPassword: string;
}

export type User = {
    id: string;
    username?: string;
    email?: string;
    phone?: string;
    avatar?: string;
    authProvider?: string;
    friendsCount?: number;
    createdAt?: string;
}

export type AuthResponse = {
    success: boolean;
    message: string;
    user?: User;
}

export type AuthStore = {
    user: User | null;
    loading: boolean;
    checkingAuth: boolean;
    setUser: (user: User | null) => void;
    getSession: () => Promise<void>;
    login: (data: Login) => Promise<AuthResponse>;
    logout: () => Promise<void>;
    sendOtp: (data: SendOtp) => Promise<AuthResponse>;
    verifyOtp: (data: VerifyOtp) => Promise<AuthResponse>;
    signup: (data: Signup) => Promise<AuthResponse>;
    forgotPassword: (data: SendOtp) => Promise<AuthResponse>;
    resetPassword: (data: ResetPassword) => Promise<AuthResponse>;
}