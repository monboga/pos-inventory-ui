const API_URL = 'https://localhost:7031/api/users'; 

export const fetchUsers = async () => {
  try {
    const response = await fetch(API_URL);
    
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    
    // .NET suele devolver las propiedades en camelCase por defecto en JSON
    return await response.json();
  } catch (error) {
    console.error("Error en servicio de usuarios:", error);
    throw error;
  }
};