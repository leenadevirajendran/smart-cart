import api from "./api";
// Calls your Spring Boot /api/auth/register endpoint
export const register= async ( name,email,password,role)=>{
    const response= await api.post('/auth/register',{
        name,
        email,
        password,
        role
    });
    return response.data;
};

// Calls your Spring Boot /api/auth/login endpoint
export const login = async(email,password) =>{
    const response = await api.post('/auth/login',{
        email,
        password
    });
    return response.data;
};