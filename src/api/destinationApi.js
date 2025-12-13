// Assume axiosClient is imported
import axiosClient from "./authApi.js";
// -----------------------------------------------------------------
// 1. Function for the DEBOUNCED DESTINATION SEARCH (by name)
// This replaces the old getDestinations and uses the 'name' filter.
// -----------------------------------------------------------------
export const getDestinationsByName = async (query = '') => {
    // We call the search endpoint, passing the query parameter named 'name'
    // as defined in SearchDestinationDto.
    try {
        const res = await axiosClient.get(`/destinations/search`, {
            params: {
                name: query // Backend searches name where it includes 'query'
            }
        });
        return res.data;
    } catch (error) {
        console.error("Error searching destinations:", error);
        return []; // Return empty array on search failure
    }
};
export const getDestinations=async () =>{
    try {
        const res = await axiosClient.get(`/destinations`);
        return res.data;
    } catch (error) {
        console.error("Error fetching destinations:", error);
        return []; // Return empty array on failure
    }
}


// -----------------------------------------------------------------
// 2. Function for DESTINATION LOOKUP BY ID
// Used for edit view initialization.
// -----------------------------------------------------------------
export const getDestinationById = async (destinationId) => {
    if (!destinationId) return null;
    
    try {
        // NOTE: Assumes the backend's /destinations/search endpoint accepts 'code' for ID lookup
        const res = await axiosClient.get(`/destinations/search`, {
            params: {
                code: destinationId 
            }
        });

        if (res.data && res.data.length > 0) {
            return res.data[0];
        }

        throw new Error(`Destination with ID ${destinationId} not found.`);
        
    } catch (error) {
        console.error(`Error fetching destination by ID ${destinationId}:`, error);
        throw error;
    }
};

// -----------------------------------------------------------------
// Existing CRUD operations (Updated 'getDestinations' is now 'getDestinationsByName')
// -----------------------------------------------------------------

/* NOTE: The original general getDestinations is REMOVED/REPLACED by getDestinationsByName. 
If you still need to load all destinations somewhere else, you must keep the original. */
export const createDestination = (data) => {
  return axiosClient.post(`/destinations`, data);
}

export const deleteDestination = (id) => {
    return axiosClient.delete(`/destinations/${id}`);
};

export const updateDestination = async (id, data) => {
    const res = await axiosClient.patch(`/destinations/${id}`, data); 
    return res.data; 
};