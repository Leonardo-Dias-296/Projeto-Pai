const API_BASE = '/api';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (res.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    window.location.href = '/login';
    throw new Error('Sessão expirada');
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ erro: 'Erro na requisição' }));
    throw new Error(err.erro || `HTTP ${res.status}`);
  }

  return res.json();
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
};

export interface LoginResponse {
  token: string;
  usuario: { id: string; nome: string; email: string; papel: string };
}

export function login(email: string, senha: string) {
  return api.post<LoginResponse>('/auth/login', { email, senha });
}
