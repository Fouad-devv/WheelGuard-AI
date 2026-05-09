// Wraps axios calls — import and pass the axiosPrivate instance from useAxiosPrivate()

export const postPredict = (axios, params) =>
  axios.post('/api/predict', params);

export const postPredictBatch = (axios, file) => {
  const form = new FormData();
  form.append('file', file);
  return axios.post('/api/predict/batch', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const getHistory = (axios, params = {}) =>
  axios.get('/api/predictions/history', { params });

export const getAllPredictions = (axios, params = {}) =>
  axios.get('/api/predictions/all', { params });

export const deletePrediction = (axios, id) =>
  axios.delete(`/api/predictions/${id}`);
