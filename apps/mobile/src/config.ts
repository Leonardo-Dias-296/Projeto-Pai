// Troque pelo IP do seu backend em desenvolvimento
// Em produção, use a URL do Railway/Render
export const API_URL = __DEV__
  ? 'http://192.168.1.12:3001/api'  // IP local da máquina
  : 'https://autocontrol-api.railway.app/api';

