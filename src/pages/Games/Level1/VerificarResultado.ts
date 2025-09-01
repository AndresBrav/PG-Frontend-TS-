/* ejercicio 1 */

export const verificarReultado = (
    ids: number[],
    columna: number[],
    fila: number[]
): boolean[] => {
    let boolean1: boolean = false;
    let boolean2: boolean = false;
    let boolean3: boolean = false;
    let boolean4: boolean = false;
    let boolean5: boolean = false;
    let boolean6: boolean = false;
    let boolean7: boolean = false;
    let boolean8: boolean = false;
    let boolean9: boolean = false;
    let boolean10: boolean = false;
    let boolean11: boolean = false;
    let boolean12: boolean = false;
    let boolean13: boolean = false;
    let boolean14: boolean = false;
    let boolean15: boolean = false;
    let boolean16: boolean = false;

    ids.forEach((id) => {
        console.log("Widget ID:", id);
    });
    fila.forEach((i) => {
        console.log("fila:", i);
    });
    columna.forEach((i) => {
        console.log("columna:", i);
    });

    const indiceInicio = ids.indexOf(4); // id del widget "inicio"

    if (fila[indiceInicio] === 0) {
        console.log("la fila de inicio es correcta");
        boolean1 = true;
        let columnaInicio = columna[indiceInicio];
        console.log("la columna de inicio es: ", columnaInicio);

        const indiceLineaAbajo1 = ids.indexOf(7); // id del widget "linea abajo"
        const filaLineaAbajo1 = fila[indiceLineaAbajo1];
        const columnaLineaAbajo1 = columna[indiceLineaAbajo1];
        const indiceLineaAbajo2 = ids.indexOf(14); // id del widget "linea abajo"
        const filaLineaAbajo2 = fila[indiceLineaAbajo2];
        const columnaLineaAbajo2 = columna[indiceLineaAbajo2];
        const indiceLineaAbajo3 = ids.indexOf(15); // id del widget "linea abajo"
        const filaLineaAbajo3 = fila[indiceLineaAbajo3];
        const columnaLineaAbajo3 = columna[indiceLineaAbajo3];
        const indiceLineaAbajo4 = ids.indexOf(16); // id del widget "linea abajo"
        const filaLineaAbajo4 = fila[indiceLineaAbajo4];
        const columnaLineaAbajo4 = columna[indiceLineaAbajo4];

        if (
            (columnaLineaAbajo1 === columnaInicio ||
                columnaLineaAbajo2 === columnaInicio ||
                columnaLineaAbajo3 === columnaInicio ||
                columnaLineaAbajo4 === columnaInicio) &&
            (filaLineaAbajo1 === 1 ||
                filaLineaAbajo2 === 1 ||
                filaLineaAbajo3 === 1 ||
                filaLineaAbajo4 === 1)
        ) {
            boolean2 = true; /* la linea es correcta */
        }
    } else {
        console.log("la fila de inicio es incorrecta");
        boolean1 = false;
    }
    return [
        boolean1,
        boolean2,
        boolean3,
        boolean4,
        boolean5,
        boolean6,
        boolean7,
        boolean8,
        boolean9,
        boolean10,
        boolean11,
        boolean12,
        boolean13,
        boolean14,
        boolean15,
        boolean16,
    ];
};
