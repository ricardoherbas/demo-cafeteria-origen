import { ZodError } from "zod";
import { ErrorApi } from "./http";

// traduce cualquier falla del cliente a un texto para mostrar en pantalla
export function mensajeDeError(error: unknown): string {
  if (error instanceof ErrorApi) {
    return error.message;
  }
  if (error instanceof ZodError) {
    return "La respuesta del servidor no tiene el formato esperado";
  }
  return "No se pudo conectar con el servidor";
}