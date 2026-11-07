import { Request, Response, NextFunction } from 'express';
import { AppError } from './error-handler';

// Va después de todas las rutas y antes del errorHandler
export function rutaNoEncontrada(req: Request, res: Response, next: NextFunction): void {
  next(new AppError('Ruta no encontrada', 404));
}
