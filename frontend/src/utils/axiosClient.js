import axios from "axios"

// Guard flag — prevents the interceptor from firing more than once
// while a redirect is already in progress
let isRedirecting = false;

// Auth routes that legitimately return 401 — never trigger session-expiry redirect
const AUTH_ROUTES = ['/user/login', '/user/register', '/user/logout', '/user/check'];

const axiosClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Response interceptor — only handles session expiry on protected routes.
// Auth routes handle their own 401s through Redux state (form error messages).
axiosClient.interceptors.response.use(
    (response) => response,
    (error) => {
        const requestUrl = error.config?.url || '';
        const isAuthRoute = AUTH_ROUTES.some(route => requestUrl.includes(route));

        if (error.response?.status === 401 && !isAuthRoute && !isRedirecting) {
            isRedirecting = true;

            // Lazy import breaks the circular dependency:
            // store → authSlice → axiosClient → store
            import('../store/store').then(({ store }) => {
                import('../authSlice').then(({ logoutUser }) => {
                    store.dispatch(logoutUser());
                    // Reset flag after navigation so future logins work correctly
                    setTimeout(() => { isRedirecting = false; }, 3000);
                });
            });

            if (window.location.pathname !== '/login') {
                setTimeout(() => {
                    window.location.href = '/login';
                }, 100);
            }
        }

        return Promise.reject(error);
    }
);

export default axiosClient;
