// lee el parámetro ?mesa=N de la URL; devuelve null si falta o no es un entero positivo
export function leerMesa(search: string): number | null {
    const valor = new URLSearchParams(search).get("mesa");

    if (valor === null || !/^[1-9]\d*$/.test(valor)) {
        return null;
    }

    const mesa = Number(valor);
    return Number.isSafeInteger(mesa) ? mesa : null;
}