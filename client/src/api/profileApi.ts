import apiClient from "./apiClient";
import { API_CONFIG } from "./apiConfig";

export const profileApi = {
    updateProfile: async (data: { username: string }) =>
        apiClient.put(API_CONFIG.ENDPOINTS.PROFILE.UPDATE, data),
    updateAvatar: async (file: File) => {
        const formData = new FormData();
        formData.append("avatar", file);
        return apiClient.put(API_CONFIG.ENDPOINTS.PROFILE.AVATAR, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
    },
};
