const TOKEN_KEY = 'iris_access_token';

export const setAccessToken = (t: string) => {
  localStorage.setItem(TOKEN_KEY, t);
};

export const getAccessToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

export const clearAccessToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};
