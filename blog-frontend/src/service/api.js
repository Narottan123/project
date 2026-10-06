import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL_LOCAL || "http://localhost:8007/";

const api = axios.create({
  baseURL: `${API_BASE_URL}api/v1`,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Request interceptor: attach bearer token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("blog_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Optional auto logout or refresh
    }
    return Promise.reject(error);
  }
);

// 1. Authentication Endpoints
export const authApi = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  logout: () => api.post("/auth/logout"),
  me: () => api.get("/auth/me"),
  refreshToken: (refreshToken) => api.post("/auth/refresh", { refreshToken }),
  socialLogin: (data) => api.post("/auth/social-login", data),
};

// 2. Blog Posts Endpoints
export const postsApi = {
  getPosts: (params) => api.get("/posts", { params }),
  getPostBySlug: (slug) => api.get(`/posts/slug/${slug}`),
  getPostById: (id) => api.get(`/posts/${id}`),
  getMyPosts: (params) => api.get("/posts/my-posts", { params }),
  createPost: (data) => api.post("/posts", data),
  updatePost: (id, data) => api.put(`/posts/${id}`, data),
  deletePost: (id) => api.delete(`/posts/${id}`),
  getCategories: () => api.get("/posts/categories"),
  getTags: () => api.get("/posts/tags"),
};

// 3. Comments Endpoints
export const commentsApi = {
  getComments: (postId, params) => api.get(`/comments/post/${postId}`, { params }),
  createComment: (postId, data) => api.post(`/comments/post/${postId}`, data),
  updateComment: (id, data) => api.put(`/comments/${id}`, data),
  deleteComment: (id) => api.delete(`/comments/${id}`),
};

// 4. Admin Management Endpoints
export const adminApi = {
  getStats: () => api.get("/admin/dashboard"),
  getUsers: (params) => api.get("/admin/users", { params }),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getPosts: (params) => api.get("/admin/posts", { params }),
  restorePost: (id) => api.put(`/admin/posts/${id}/restore`),
  hardDeletePost: (id) => api.delete(`/admin/posts/${id}/permanent`),
  getComments: (params) => api.get("/admin/comments", { params }),
  deleteComment: (id) => api.delete(`/admin/comments/${id}`),
  getLogs: (params) => api.get("/admin/logs", { params }),
  getPermissions: () => api.get("/admin/permissions"),
  updatePermissions: (permissions) => api.put("/admin/permissions", { permissions }),
  getRoles: () => api.get("/admin/roles"),
  createRole: (data) => api.post("/admin/roles", data),
  updateRole: (id, data) => api.put(`/admin/roles/${id}`, data),
  deleteRole: (id) => api.delete(`/admin/roles/${id}`),
};

export default api;
