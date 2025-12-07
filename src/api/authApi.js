import axios from "axios";

const axiosClient = axios.create({
  baseURL:'http://localhost:3333',
});

// Attach access token
axiosClient.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem("access_token");
  console.log("Axios attaching token:", accessToken); // DEBUG
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// Auto refresh token on 401
axiosClient.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;

    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;

      const refreshToken = localStorage.getItem("refresh_token");
      const userId = localStorage.getItem("userId");

      if (!refreshToken) return Promise.reject(err);

      try {
        const refreshRes = await axios.post(
          `${import.meta.env.VITE_API_URL}/auth/refresh`,
          { userId, refreshToken }
        );

        localStorage.setItem("access_token", refreshRes.data.access_token);
        localStorage.setItem("refresh_token", refreshRes.data.refresh_token);

        console.log("Refreshed token:", refreshRes.data.access_token);

        original.headers.Authorization = `Bearer ${refreshRes.data.access_token}`;
        return axiosClient(original);
      } catch {
        localStorage.clear();
        window.location.href = "/login";
      }
    }

    return Promise.reject(err);
  }
);

export default axiosClient;
