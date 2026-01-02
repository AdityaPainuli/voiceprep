export const authFetch = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem("token");
  const resp = await fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
    },
  });

  if (resp.status === 401) {
    window.location.href = "/login";
    throw new Error("Unauthorized");
  }
  return resp;
};
