import axiosClient from './authApi';

// GET /brokers
export async function getBrokers() {
  try {
    const res = await axiosClient.get('/brokers');
    return res.data;
  } catch (err) {
    const message = err?.response?.data?.message || err.message || 'Failed to fetch brokers';
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