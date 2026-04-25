const API_URL = 'http://localhost:3001/api';

async function fetchJSON(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP ${response.status}`);
  }
  return response.json();
}

const authService = {
  login: (username, password) =>
    fetchJSON(`${API_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ username, password })
    }),

  changePassword: (username, oldPassword, newPassword) =>
    fetchJSON(`${API_URL}/auth/change-password`, {
      method: 'POST',
      body: JSON.stringify({ username, oldPassword, newPassword })
    }),

  setSecurityQuestions: (username, questions, answers) =>
    fetchJSON(`${API_URL}/auth/set-security-questions`, {
      method: 'POST',
      body: JSON.stringify({ username, questions, answers })
    }),

  getSecurityQuestions: (username) =>
    fetchJSON(`${API_URL}/auth/get-security-questions`, {
      method: 'POST',
      body: JSON.stringify({ username })
    }),

  verifySecurityQuestions: (username, answers) =>
    fetchJSON(`${API_URL}/auth/verify-security-questions`, {
      method: 'POST',
      body: JSON.stringify({ username, answers })
    }),

  resetPassword: (username, newPassword) =>
    fetchJSON(`${API_URL}/auth/reset-password`, {
      method: 'POST',
      body: JSON.stringify({ username, newPassword })
    }),

  isLoggedIn: () => localStorage.getItem('isLoggedIn') === 'true',

  logout: () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
  },

  getUsername: () => localStorage.getItem('username')
};

export default authService;
