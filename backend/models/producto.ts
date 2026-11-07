
export abstract class Producto {
  constructor(
    public id: number,
    public nombre: string,
    public precioBase: number
  ) {}

  abstract calcularPrecio(): number;

  abstract get tipo(): 'expreso' | 'filtrado' | 'pasteleria';

  toJSON() {
    return {
      id: this.id,
      nombre: this.nombre,
      precio: this.calcularPrecio(),
      tipo: this.tipo,
    };
  }
}
