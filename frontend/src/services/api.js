import axios from "axios";
// Base URL of your Spring Boot backend
const API_BASE_URL = 'http://localhost:8080/api';
// Create a reusable axios instance with the base URL pre-configured
const api=axios.create({
    baseURL : API_BASE_URL,
})
// Attach the JWT token automatically to every request, if it exists
// This runs BEFORE every request is sent — called an "interceptor"
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if(token){
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
 
export default  api;
