import axios from 'axios';

/**
 * Instância centralizada do Axios
 * Configurada para bible-api.com (Consultas externas se necessário)
 */
const api = axios.create({
  baseURL: 'https://bible-api.com/',
});

export default api;