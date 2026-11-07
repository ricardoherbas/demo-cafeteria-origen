import { createContext, useContext, useReducer } from "react";
import type { Dispatch, ReactNode } from "react";
import { carritoReducer, estadoInicial } from "./carritoReducer";
import type { AccionCarrito, EstadoCarrito } from "./carritoReducer";

interface ValorCarrito {
    estado: EstadoCarrito;
    dispatch: Dispatch<AccionCarrito>;
}

const CarritoContext = createContext<ValorCarrito | null>(null);

export function CarritoProvider({ children }: { children: ReactNode }) {
    const [estado, dispatch] = useReducer(carritoReducer, estadoInicial);

    return <CarritoContext.Provider value={{ estado, dispatch }}>{children}</CarritoContext.Provider>;
}

export function useCarrito(): ValorCarrito {
    const valor = useContext(CarritoContext);

    if (valor === null) {
        throw new Error("useCarrito debe usarse dentro de CarritoProvider");
    }
    return valor;
}