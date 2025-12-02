const API_AUTH_URL = 'https://localhost:7031/api/auth/login'; // Reemplaza con tu URL
const TOKEN_KEY = 'authToken';

export const login = async (credentials) => {
  const response = await fetch(API_AUTH_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    // Si .NET devuelve un error de credenciales, lanza la excepción
    const errorData = await response.json();
    throw new Error(errorData.message || 'Credenciales inválidas. Intente de nuevo.');
  }

  // La respuesta exitosa de .NET debe contener el token (ej: { token: "..." })
  const data = await response.json();
  const token = data.token;
  
  localStorage.setItem(TOKEN_KEY, token);

  return token; 
};

export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

export const logout = () => {
  localStorage.removeItem(TOKEN_KEY);
};