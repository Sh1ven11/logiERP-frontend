import axiosClient from "./authApi.js";

export const loginApi = async (username, password) => {
  const res = await axiosClient.post("/auth/login", { username, password });
  return res.data;  // { access_token, refresh_token }
};
