import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true
});

export const uploadDataset = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const { data } = await api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });

  return data;
};

export const getDataset = async (id) => {
  const { data } = await api.get(`/upload/${id}`);
  return data;
};

export const generateInsights = async ({ datasetId, rawSummary }) => {
  const { data } = await api.post('/analyze/insights', { datasetId, rawSummary });
  return data;
};

export const askQuestion = async ({ datasetId, rawSummary, question }) => {
  const { data } = await api.post('/analyze/ask', { datasetId, rawSummary, question });
  return data;
};

export const getHistory = async () => {
  const { data } = await api.get('/history');
  return data;
};

export const getAnalysis = async (id) => {
  const { data } = await api.get(`/history/${id}`);
  return data;
};

export const deleteAnalysis = async (id) => {
  const { data } = await api.delete(`/history/${id}`);
  return data;
};

export const getCurrentUser = async () => {
  const { data } = await api.get('/auth/me');
  return data;
};

export const logout = async () => {
  const { data } = await api.post('/auth/logout');
  return data;
};

export default api;
