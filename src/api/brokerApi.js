import axiosClient from './authApi.js';
export async function getBrokers(companyId) {
  // 1. Log the parameter being sent (Crucial Check)
  console.log('API Request: Fetching brokers for companyId:', companyId);
  
  try {
    const endpoint = '/brokers';
    const paramsToSend = { companyId: companyId };
    
    // Log the full URL/Query being executed (useful if the client abstracts the path)
    console.log(`API URL: ${endpoint}?companyId=${companyId}`);

    const res = await axiosClient.get(endpoint, {
      params: paramsToSend
    });
    
    // 2. Log the successful response data structure
    console.log('API Success: Brokers received (Count):', res.data?.length || 0);
    // If you want to see the actual data structure (can be large):
    // console.log('API Success: Broker Data Sample:', res.data[0]); 

    return res.data;
  } catch (err) {
    const message = err?.response?.data?.message || err.message || 'Failed to fetch brokers';
    
    // 3. Log the error details
    console.error('API Error: Failed to fetch brokers.', {
        status: err.response?.status,
        response_data: err.response?.data,
        message: message
    });
    
    throw new Error(message);
  }
}
// GET /brokers/search?companyId=1&query=ram
export async function getBrokersByName(companyId, query) {
  try {
    const res = await axiosClient.get('/brokers/search', {
      params: {
        companyId,
        query,
      },
    });

    return res.data;
  } catch (err) {
    const message =
      err?.response?.data?.message ||
      err.message ||
      'Failed to fetch brokers by name';

    throw new Error(message);
  }
}

// GET /brokers/:id
export async function getBroker(id) {
  try {
    const res = await axiosClient.get(`/brokers/${id}`);
    return res.data;
  } catch (err) {
    const message = err?.response?.data?.message || err.message || 'Failed to fetch broker';
    throw new Error(message);
  }
}

// POST /brokers
export async function createBroker(payload) {
  try {
    const res = await axiosClient.post('/brokers', payload);
    return res.data;
  } catch (err) {
    const message = err?.response?.data?.message || err.message || 'Failed to create broker';
    throw new Error(message);
  }
}

// PUT /brokers/:id
export async function updateBroker(id, payload) {
  try {
    const res = await axiosClient.put(`/brokers/${id}`, payload);
    return res.data;
  } catch (err) {
    const message = err?.response?.data?.message || err.message || 'Failed to update broker';
    throw new Error(message);
  }
}

// DELETE /brokers/:id
export async function deleteBroker(id) {
  try {
    const res = await axiosClient.delete(`/brokers/${id}`);
    return res.data;
  } catch (err) {
    const message = err?.response?.data?.message || err.message || 'Failed to delete broker';
    throw new Error(message);
  }
}