import conexionDB from '../config/conexion-db';

const TABLAS = 'pedido_items, pedidos, productos, mesas, variedades, tamanios';

const TAMANIOS = ['Pocillo', 'Mediano', 'Taza grande'];

const VARIEDADES = [
    { nombre: 'Brasil', acidez: 'Baja', cuerpo: 'Denso', notas: 'Avellana', precioPorGramo: 140 },
    { nombre: 'Colombia', acidez: 'Media', cuerpo: 'Equilibrado', notas: 'Cítricas y florales', precioPorGramo: 180 },
    { nombre: 'Etiopía', acidez: 'Viva', cuerpo: 'Ligero', notas: 'Frutales', precioPorGramo: 240 },
    ];

    const MESAS: ReadonlyArray<[numero: number, capacidad: number]> = [
    [1, 2],
    [2, 2],
    [3, 4],
    [4, 4],
    [5, 6],
    ];

    const CAFES = [
    { tipo: 'expreso', nombre: 'Expreso', precioBase: 2500, gramosPorTamanio: [18, 27, 36] },
    { tipo: 'filtrado', nombre: 'Filtrado', precioBase: 3200, gramosPorTamanio: [6, 15, 25] },
    ];

    export async function resetearBase(): Promise<void> {
    await conexionDB.query(`TRUNCATE ${TABLAS} RESTART IDENTITY CASCADE`);
    }

    // Deja la base exactamente como la crea init.sql (mismos ids).
    export async function sembrarBase(): Promise<void> {
    const cliente = await conexionDB.connect();
    try {
        await cliente.query('BEGIN');
        await cliente.query(`TRUNCATE ${TABLAS} RESTART IDENTITY CASCADE`);

        for (const nombre of TAMANIOS) {
        await cliente.query('INSERT INTO tamanios (nombre) VALUES ($1)', [nombre]);
        }

        for (const v of VARIEDADES) {
        await cliente.query(
            'INSERT INTO variedades (nombre, acidez, cuerpo, notas) VALUES ($1, $2, $3, $4)',
            [v.nombre, v.acidez, v.cuerpo, v.notas]
        );
        }

        for (const [numero, capacidad] of MESAS) {
        await cliente.query('INSERT INTO mesas (numero, capacidad) VALUES ($1, $2)', [numero, capacidad]);
        }

        // Orden: tipo, tamaño, variedad -> ids 1 a 18, igual que init.sql
        for (const cafe of CAFES) {
        for (let t = 0; t < TAMANIOS.length; t++) {
            for (let v = 0; v < VARIEDADES.length; v++) {
            await cliente.query(
                `INSERT INTO productos
                (nombre, tipo, variedad_id, tamanio_id, gramos, precio_base, precio_por_gramo)
                VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [
                `${cafe.nombre} ${TAMANIOS[t]}`,
                cafe.tipo,
                v + 1,
                t + 1,
                cafe.gramosPorTamanio[t],
                cafe.precioBase,
                VARIEDADES[v].precioPorGramo,
                ]
            );
            }
        }
        }

        // ids 19 y 20
        await cliente.query(
        `INSERT INTO productos (nombre, tipo, precio_base)
        VALUES ('Muffin de chocolate', 'pasteleria', 2500),
                ('Porción de torta selva negra', 'pasteleria', 4200)`
        );

        await cliente.query('COMMIT');
    } catch (error) {
        await cliente.query('ROLLBACK');
        throw error;
    } finally {
        cliente.release();
    }
    }