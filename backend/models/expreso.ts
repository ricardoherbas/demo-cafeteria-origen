
import { Producto } from './producto';
import { Variedad } from './variedad';

export class Expreso extends Producto {
  constructor(
    id: number,
    nombre: string,
    precioBase: number,
    public tamanio: string,
    public gramosCafe: number,
    public variedad: Variedad
  ) {
    super(id, nombre, precioBase);
  }

  get tipo(): 'expreso' {
    return 'expreso';
  }

  calcularPrecio(): number {
    return this.precioBase +
      this.gramosCafe * this.variedad.precioPorGramo;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      tamanio: this.tamanio,
      gramosCafe: this.gramosCafe,
      variedad: {
        nombre: this.variedad.nombre,
        precioPorGramo: this.variedad.precioPorGramo,
        descripcion: this.variedad.descripcion,
      },
    };
  }
}
