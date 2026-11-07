import request from 'supertest';
import type { Express } from 'express';
import app from '../../app';
import conexionDB from '../../config/conexion-db';

// carga una copia nueva de la app con otro NODE_ENV, para probar que fuera
// de "test" los endpoints no existen.
    function cargarAppConEntorno(nodeEnv: string): Express {
    const anterior = process.env.NODE_ENV;
    process.env.NODE_ENV = nodeEnv;
    let appAislada: Express | undefined;
    jest.isolateModules(() => {
        appAislada = (require('../../app') as typeof import('../../app')).default;
    });
    process.env.NODE_ENV = anterior;
    if (!appAislada) {
        throw new Error('No se pudo cargar la app');
    }
    return appAislada;
    }

    async function contar(tabla: string): Promise<number> {
    const resultado = await conexionDB.query(`SELECT COUNT(*)::int AS total FROM ${tabla}`);
    return resultado.rows[0].total as number;
    }

    describe('endpoints de test (/__test__)', () => {
    // las demas pruebas de integracion necesitan los datos: se los devolvemos.
    afterAll(async () => {
        await request(app).post('/__test__/reset');
        await request(app).post('/__test__/seed');
    });

    describe('con NODE_ENV=test', () => {
        it('reset responde 200 y vacía las tablas', async () => {
        const respuesta = await request(app).post('/__test__/reset');

        expect(respuesta.status).toBe(200);
        expect(await contar('pedido_items')).toBe(0);
        expect(await contar('pedidos')).toBe(0);
        expect(await contar('productos')).toBe(0);
        expect(await contar('mesas')).toBe(0);
        });

        it('seed responde 200 y carga siempre los mismos datos', async () => {
        await request(app).post('/__test__/reset');
        const respuesta = await request(app).post('/__test__/seed');

        expect(respuesta.status).toBe(200);
        expect(await contar('productos')).toBe(20);
        expect(await contar('mesas')).toBe(5);

        const producto = await conexionDB.query(
            'SELECT nombre FROM productos WHERE id = 5'
        );
        expect(producto.rows[0].nombre).toBe('Expreso Mediano');
        });

        it('seed se puede repetir y deja los mismos ids', async () => {
        await request(app).post('/__test__/seed');
        const segunda = await request(app).post('/__test__/seed');

        expect(segunda.status).toBe(200);
        expect(await contar('productos')).toBe(20);

        const muffin = await conexionDB.query(
            'SELECT nombre FROM productos WHERE id = 19'
        );
        expect(muffin.rows[0].nombre).toBe('Muffin de chocolate');
        });

        it('después de seed, GET /api/productos responde 200', async () => {
        await request(app).post('/__test__/seed');
        const respuesta = await request(app).get('/api/productos');

        expect(respuesta.status).toBe(200);
        });
    });

    describe('con otro NODE_ENV', () => {
        it('reset y seed no existen (404)', async () => {
        const appProduccion = cargarAppConEntorno('production');

        const reset = await request(appProduccion).post('/__test__/reset');
        const seed = await request(appProduccion).post('/__test__/seed');

        expect(reset.status).toBe(404);
        expect(seed.status).toBe(404);
        });
    });
    });