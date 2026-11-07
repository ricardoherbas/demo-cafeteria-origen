const API_URL = import.meta.env.VITE_API_URL ?? "/api";

// error de una respuesta HTTP fallida: lleva el mensaje que mandó la API ({ error }) y el status
export class ErrorApi extends Error {
  readonly status: number;

  constructor(mensaje: string, status: number) {
    super(mensaje);
    this.name = "ErrorApi";
    this.status = status;
  }
}

// la API siempre responde { error: string }; si el cuerpo no es eso, se usa un mensaje genérico
async function leerMensajeDeError(response: Response): Promise<string | null> {
  try {
    const cuerpo: unknown = await response.json();

    if (typeof cuerpo === "object" && cuerpo !== null && "error" in cuerpo && typeof cuerpo.error === "string") {
      return cuerpo.error;
    }
    return null;
  } catch {
    return null;
  }
}

interface HttpOptions {
  method: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
}

async function request<T>(
  endpoint: string,
  options: HttpOptions,
): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: options.method,
    headers: options.body
      ? { "Content-Type": "application/json" }
      : undefined,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    const mensaje = await leerMensajeDeError(response);

    throw new ErrorApi(
      mensaje ?? `Error HTTP ${response.status}: ${response.statusText}`,
      response.status,
    );
  }

  return (await response.json()) as T;
}

export const http = {
  get<T>(endpoint: string): Promise<T> {
    return request<T>(endpoint, { method: "GET" });
  },

  post<T>(endpoint: string, body: unknown): Promise<T> {
    return request<T>(endpoint, { method: "POST", body });
  },

  put<T>(endpoint: string, body: unknown): Promise<T> {
    return request<T>(endpoint, { method: "PUT", body });
  },

  delete<T>(endpoint: string): Promise<T> {
    return request<T>(endpoint, { method: "DELETE" });
  },
};