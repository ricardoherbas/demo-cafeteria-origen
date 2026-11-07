
import request from 'supertest';
import app from '../../app';

describe('GET /api/productos', () => {
  it('debe responder con estado 200 y una lista de productos', async () => {
    const respuesta = await request(app)
      .get('/api/productos');

    expect(respuesta.status).toBe(200);
    expect(respuesta.headers['content-type']).toMatch(/json/);
    expect(Array.isArray(respuesta.body)).toBe(true);
  });

  it('debe incluir el precio calculado en cada producto', async () => {
    const respuesta = await request(app)
      .get('/api/productos');

    expect(respuesta.status).toBe(200);

    respuesta.body.forEach((producto: { precio: unknown }) => {
      expect(typeof producto.precio).toBe('number');
    });
  });

  it('debe incluir un tipo válido en cada producto', async () => {
    const respuesta = await request(app)
      .get('/api/productos');

    expect(respuesta.status).toBe(200);

    const tiposValidos = [
      'expreso',
      'filtrado',
      'pasteleria',
    ];

    respuesta.body.forEach((producto: { tipo: string }) => {
      expect(tiposValidos).toContain(producto.tipo);
    });
  });

  it('debe conservar los datos del café necesarios para el selector', async () => {
    const respuesta = await request(app)
      .get('/api/productos');

    expect(respuesta.status).toBe(200);

    const expreso = respuesta.body.find(
      (producto: { tipo: string }) => producto.tipo === 'expreso'
    );

    expect(expreso).toBeDefined();
    expect(expreso).toHaveProperty('tamanio');
    expect(expreso).toHaveProperty('gramosCafe');
    expect(expreso).toHaveProperty('variedad');
  });
});

describe('GET /api/productos/:id', () => {
  it('debe responder con estado 200 al buscar un producto existente', async () => {
    const respuesta = await request(app)
      .get('/api/productos/1');

    expect(respuesta.status).toBe(200);
    expect(respuesta.headers['content-type']).toMatch(/json/);
    expect(respuesta.body).toHaveProperty('id', 1);
  });

  it('debe incluir el precio calculado y el tipo del producto', async () => {
    const respuesta = await request(app)
      .get('/api/productos/1');

    expect(respuesta.status).toBe(200);
    expect(typeof respuesta.body.precio).toBe('number');
    expect(respuesta.body.tipo).toBe('expreso');
  });

  it('debe responder con estado 404 si el producto no existe', async () => {
    const respuesta = await request(app)
      .get('/api/productos/99999');

    expect(respuesta.status).toBe(404);
  });

  it('debe responder con estado 400 si el ID no es válido', async () => {
    const respuesta = await request(app)
      .get('/api/productos/abc');

    expect(respuesta.status).toBe(400);
  });
});
