
import { Producto } from './producto';

export class Pasteleria extends Producto {
  get tipo(): 'pasteleria' {
    return 'pasteleria';
  }

  calcularPrecio(): number {
    return this.precioBase;
  }
}
