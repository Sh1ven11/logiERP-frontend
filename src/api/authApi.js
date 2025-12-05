import axiosClient from "./AxiosClient";

export const loginApi = async (username, password) => {
  const res = await axiosClient.post("/auth/login", { username, password });
  return res.data;
};
