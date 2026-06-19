const BASE_URL = "http://localhost:3000";

export async function apiRequest(endpoint, options = {}) {

    const token = localStorage.getItem("token");

    const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,

        headers: {
            ...options.headers,
            Authorization: `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
    }

    return response.json();
}