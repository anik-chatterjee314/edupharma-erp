const API_BASE = '/api';

const getToken = () => localStorage.getItem('edupharma_token');

const request = async (endpoint, options = {}) => {
  const token = getToken();
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };
  
  // Don't set Content-Type for FormData (file uploads)
  if (options.body instanceof FormData) {
    delete config.headers['Content-Type'];
  }

  const response = await fetch(`${API_BASE}${endpoint}`, config);
  
  if (response.status === 401) {
    // Only redirect to login if we HAD a token (real session expiry)
    // Don't redirect if this is an initial load that failed
    if (token && !endpoint.includes('/auth/')) {
      localStorage.removeItem('edupharma_token');
      localStorage.removeItem('edupharma_user');
      window.location.href = '/login';
    }
    const error = await response.json().catch(() => ({ message: 'Session expired. Please login again.' }));
    throw new Error(error.message || 'Authentication failed');
  }
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || 'Request failed');
  }
  
  // Handle empty responses (204 No Content)
  const contentType = response.headers.get('content-type');
  if (response.status === 204 || !contentType?.includes('application/json')) {
    return null;
  }
  
  return response.json();
};

export const api = {
  get: (endpoint) => request(endpoint),
  post: (endpoint, data) => request(endpoint, { method: 'POST', body: data instanceof FormData ? data : JSON.stringify(data) }),
  put: (endpoint, data) => request(endpoint, { method: 'PUT', body: JSON.stringify(data) }),
  patch: (endpoint, data) => request(endpoint, { method: 'PATCH', body: data ? JSON.stringify(data) : undefined }),
  delete: (endpoint) => request(endpoint, { method: 'DELETE' }),
  upload: (endpoint, formData) => request(endpoint, { method: 'POST', body: formData }),
};
