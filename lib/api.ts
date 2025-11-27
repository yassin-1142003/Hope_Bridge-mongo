export const getApiUrl = (path: string): string => {
  // In the browser, use relative URL
  if (typeof window !== 'undefined') {
    return path;
  }
  
  // On server, use environment variable or default to localhost:3000
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  return `${baseUrl}${path}`;
};

export const fetchWithErrorHandling = async <T>(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<T> => {
  try {
    const response = await fetch(input, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers || {}),
      },
      credentials: 'same-origin',
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    return response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};
