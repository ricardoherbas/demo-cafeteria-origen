
import { useMenu } from "./useMenu";
import { SelectorCafe } from "../cafe/SelectorCafe";
import { Pasteleria } from "../pasteleria/Pasteleria";

export function Menu() {
    const resultado = useMenu();

    return (
        <section aria-labelledby="titulo-menu">
            <h2 id="titulo-menu">Menú</h2>

            {resultado.estado === "cargando" && (
                <p role="status">Cargando menú...</p>
            )}

            {resultado.estado === "error" && (
                <>
                    <p role="alert">No se pudo cargar el menú.</p>
                    <button onClick={() => void resultado.reintentar()}>
                        Reintentar
                    </button>
                </>
            )}

            {resultado.estado === "listo" && (
                <>
                    <SelectorCafe productos={resultado.productos} />
                    <Pasteleria productos={resultado.productos} />
                </>
            )}
        </section>
    );
}
