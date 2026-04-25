import axios from 'axios';

// Instância centralizada do Axios
const api = axios.create({
  baseURL: 'https://bible-api.com/',
});

export default api;