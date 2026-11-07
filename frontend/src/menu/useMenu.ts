
import { useCallback, useEffect, useState } from "react";
import { obtenerProductos } from "../api/productos.api";
import type { Producto } from "../api/productos.schema";

type EstadoMenu =
    | { estado: "cargando" }
    | { estado: "error" }
    | { estado: "listo"; productos: Producto[] };

export function useMenu() {
    const [estado, setEstado] = useState<EstadoMenu>({
        estado: "cargando",
    });

    const cargarProductos = useCallback(async () => {
        setEstado({ estado: "cargando" });

        try {
            const productos = await obtenerProductos();

            setEstado({
                estado: "listo",
                productos,
            });
        } catch {
            setEstado({
                estado: "error",
            });
        }
    }, []);

    useEffect(() => {
        void cargarProductos();
    }, [cargarProductos]);

    return {
        ...estado,
        reintentar: cargarProductos,
    };
}
