import axiosClient from "./authApi.js";

export const getDestinations = async () => {
    try {
        // 'await' pauses the function here until the promise resolves
        const res = await axiosClient.get(`/destinations`);

        // Now 'res' contains the actual response object
        console.log(res);

        // The actual data is in res.data
        return res.data;
    } catch (error) {
        // Handle any errors that occur during the request
        console.error("Error fetching destinations:", error);
        // You might want to rethrow the error or return an empty array/null
        throw error;
    }
};
export const createDestination = (data) => {

  return axiosClient.post(`/destinations`, data);
}
export const deleteDestination = (id) => {
    return axiosClient.delete(`/destinations/${id}`);
};
export const updateDestination = async (id, data) => {
    // Assuming you use PUT or PATCH for updates and send the ID in the URL
    const res = await axiosClient.patch(`/destinations/${id}`, data); 
    // Or axiosClient.patch(`/destinations/${id}`, data);
    return res.data; // Should return the updated destination object
};