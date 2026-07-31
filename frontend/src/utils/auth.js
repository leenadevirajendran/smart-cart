// Decodes the JWT payload without needing a library (no signature verification needed client-side —
// the backend already verifies it on every request)
export const getTokenPayload = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch (err) {
    return null;
  }
};

export const getUserRole = () => {
  const payload = getTokenPayload();
  return payload?.role || null;
};

export const isSeller = () => getUserRole() === 'SELLER';
export const isBuyer = () => getUserRole() === 'BUYER';

export const getUserEmail = () => {
  const payload = getTokenPayload();
  return payload?.sub || null;
};

export const isAdmin = () => getUserRole() === 'ADMIN';