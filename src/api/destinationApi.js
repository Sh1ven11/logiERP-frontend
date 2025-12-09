import axiosClient from "./authApi.js";

export const getDestinations = () => {
  return axiosClient.get(`/destinations`);
};
