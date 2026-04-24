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
    throw new Error(`HTTP ${response.status}`);
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

  isLoggedIn: () => localStorage.getItem('isLoggedIn') === 'true',

  logout: () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
  },

  getUsername: () => localStorage.getItem('username')
};

export default authService;
