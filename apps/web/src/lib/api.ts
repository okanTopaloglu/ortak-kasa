import axios from 'axios';

// Direkt API (CORS backend'de açık). localhost için mutlaka http kullan
let API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
if (API_URL.startsWith('https://localhost') || API_URL.startsWith('https://127.0.0.1')) {
  API_URL = API_URL.replace('https://', 'http://');
}

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    // 401 = token geçersiz - session'ı temizle, AuthProvider dinleyecek
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token');
      window.dispatchEvent(new CustomEvent('auth:logout'));
    }
    return Promise.reject(err);
  }
);

export const auth = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (data: { email: string; password: string; name: string; companyName?: string }) =>
    api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
};

export const companies = {
  list: () => api.get('/companies'),
  get: (id: string) => api.get(`/companies/${id}`),
  create: (name: string) => api.post('/companies', { name }),
  update: (id: string, data: { name?: string }) => api.patch(`/companies/${id}`, data),
  addMember: (id: string, email: string, role?: string) =>
    api.post(`/companies/${id}/members`, { email, role }),
  removeMember: (companyId: string, userId: string) =>
    api.delete(`/companies/${companyId}/members/${userId}`),
};

export const branches = {
  list: (companyId: string) => api.get(`/companies/${companyId}/branches`),
  create: (companyId: string, name: string) =>
    api.post(`/companies/${companyId}/branches`, { name }),
  update: (id: string, name: string) => api.patch(`/branches/${id}`, { name }),
};

export const partners = {
  list: (branchId: string) => api.get(`/branches/${branchId}/partners`),
  set: (branchId: string, partners: { userId: string; percentage: number }[]) =>
    api.put(`/branches/${branchId}/partners`, { partners }),
};

export const transactions = {
  list: (branchId: string) => api.get(`/branches/${branchId}/transactions`),
  create: (
    branchId: string,
    data: { amount: number; description?: string; date: string; type: 'GELIR' | 'GIDER'; accountId?: string }
  ) => api.post(`/branches/${branchId}/transactions`, data),
  update: (
    branchId: string,
    id: string,
    data: { amount?: number; description?: string; date?: string; type?: 'GELIR' | 'GIDER'; accountId?: string }
  ) => api.patch(`/branches/${branchId}/transactions/${id}`, data),
  delete: (branchId: string, id: string) =>
    api.delete(`/branches/${branchId}/transactions/${id}`),
};

export const accounts = {
  list: (companyId: string) => api.get(`/companies/${companyId}/accounts`),
  create: (companyId: string, data: { name: string; type: string }) =>
    api.post(`/companies/${companyId}/accounts`, data),
  delete: (companyId: string, accountId: string) =>
    api.delete(`/companies/${companyId}/accounts/${accountId}`),
};

export const reports = {
  dashboard: (companyId: string) => api.get(`/companies/${companyId}/dashboard`),
  dashboardFull: (companyId: string) =>
    api.get(`/companies/${companyId}/dashboard-full`),
  monthlyIncome: (companyId: string, year?: number) =>
    api.get(`/companies/${companyId}/reports/monthly-income`, {
      params: year ? { year } : undefined,
    }),
  profitByBranch: (companyId: string) =>
    api.get(`/companies/${companyId}/reports/profit-by-branch`),
  profitByPartner: (companyId: string) =>
    api.get(`/companies/${companyId}/reports/profit-by-partner`),
};
