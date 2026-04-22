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

export const deviceApi = {
  getAll: () => fetchJSON(`${API_URL}/devices`),

  getRooms: () => fetchJSON(`${API_URL}/devices/rooms`),

  add: (device) => fetchJSON(`${API_URL}/devices`, {
    method: 'POST',
    body: JSON.stringify(device)
  }),

  update: (id, device) => fetchJSON(`${API_URL}/devices/${id}`, {
    method: 'PUT',
    body: JSON.stringify(device)
  }),

  delete: (id) => fetchJSON(`${API_URL}/devices/${id}`, {
    method: 'DELETE'
  })
};

export default deviceApi;