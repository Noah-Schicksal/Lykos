export const API_BASE_URL = "http://localhost:3333"; 

export async function apiRequest<T>(endpoint: string, options: { method?: string; body?: any; token?: string } = {}, isMultipart = false): Promise<T> {
  const headers: HeadersInit = {};
  if (options.token) headers['Authorization'] = `Bearer ${options.token}`;
  if (!isMultipart) headers['Content-Type'] = 'application/json';

  const config: RequestInit = { method: options.method || 'GET', headers };
  if (options.body) config.body = isMultipart ? options.body : JSON.stringify(options.body);

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  const data = await response.json().catch(() => null);
  if (!response.ok) throw { status: response.status, message: data?.message || 'Erro', data };
  return data as T;
}