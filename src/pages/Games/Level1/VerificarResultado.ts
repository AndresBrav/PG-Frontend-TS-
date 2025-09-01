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
    const filaInicio = fila[indiceInicio];
    const columnaInicio = columna[indiceInicio];

    if (fila[indiceInicio] === 0) {
        // console.log("la fila de inicio es correcta");
        boolean1 = true;
        // let columnaInicio = columna[indiceInicio];
        // console.log("la columna de inicio es: ", columnaInicio);
    } else {
        console.log("la fila de inicio es incorrecta");
        boolean1 = false;
    }

    /****************************** */
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
        boolean2 = true; /* la linea abajo es correcta */
    } else {
        boolean2 = false;
    }

    /*********leer n1,n2***** */
    const leerN1N2 = ids.indexOf(3); // id del widget "leer n1,n2"
    const filaLeerN1N2 = fila[leerN1N2];
    const columnaLeerN1N2 = columna[leerN1N2];

    if (columnaLeerN1N2 === columnaInicio && filaLeerN1N2 === 2) {
        boolean3 = true; /* leer n1,n2 es correcta */
    } else {
        boolean3 = false;
    }

    /****** verificar la flecha hacia abajo ****/
    if (
        (columnaLineaAbajo1 === columnaInicio ||
            columnaLineaAbajo2 === columnaInicio ||
            columnaLineaAbajo3 === columnaInicio ||
            columnaLineaAbajo4 === columnaInicio) &&
        (filaLineaAbajo1 === 3 ||
            filaLineaAbajo2 === 3 ||
            filaLineaAbajo3 === 3 ||
            filaLineaAbajo4 === 3)
    ) {
        boolean4 = true; /* la linea abajo es correcta */
    } else {
        boolean4 = false;
    }

    // verificar decision si no
    const decisionSiNo = ids.indexOf(1); // id del widget "decision si no"
    const filaDecisionSiNo = fila[decisionSiNo];
    const columnaDecisionSiNo = columna[decisionSiNo];

    if (columnaDecisionSiNo === columnaInicio && filaDecisionSiNo === 4) {
        boolean5 = true; /* decision si  es correcta */
    } else {
        boolean5 = false;
    }
    // verificar la otra linea abajo
    if (
        (columnaLineaAbajo1 === columnaInicio ||
            columnaLineaAbajo2 === columnaInicio ||
            columnaLineaAbajo3 === columnaInicio ||
            columnaLineaAbajo4 === columnaInicio) &&
        (filaLineaAbajo1 === 5 ||
            filaLineaAbajo2 === 5 ||
            filaLineaAbajo3 === 5 ||
            filaLineaAbajo4 === 5)
    ) {
        boolean6 = true; /* la linea abajo es correcta */
    } else {
        boolean6 = false;
    }
    /******************************* */
    // verificar si son iguales
    const sonIguales = ids.indexOf(2); // id del widget "son iguales"
    const filaSonIguales = fila[sonIguales];
    const columnaSonIguales = columna[sonIguales];
    if (columnaSonIguales === columnaInicio && filaSonIguales === 6) {
        boolean7 = true; /* son iguales es correcta */
    } else {
        boolean7 = false;
    }

    // verificar la linea de abajo
    if (
        (columnaLineaAbajo1 === columnaInicio ||
            columnaLineaAbajo2 === columnaInicio ||
            columnaLineaAbajo3 === columnaInicio ||
            columnaLineaAbajo4 === columnaInicio) &&
        (filaLineaAbajo1 === 7 ||
            filaLineaAbajo2 === 7 ||
            filaLineaAbajo3 === 7 ||
            filaLineaAbajo4 === 7)
    ) {
        boolean8 = true; /* la linea abajo es correcta */
    } else {
        boolean8 = false;
    }

    /******************************* */
    // verificar el fin
    const fin = ids.indexOf(13); // id del widget "fin"
    const filaFin = fila[fin];
    const columnaFin = columna[fin];

    if (columnaFin === columnaInicio && filaFin === 8) {
        boolean9 = true; /* fin es correcta */
    } else {
        boolean9 = false;
    }

    // verificar si no son iguales
    const lineaDerecha = ids.indexOf(11); // id del widget "linea derecha"
    const filaLineaDerecha = fila[lineaDerecha];
    const columnaLineaDerecha = columna[lineaDerecha];

    if (
        filaLineaDerecha === 4 &&
        columnaLineaDerecha === columnaDecisionSiNo + 1
    ) {
        boolean10 = true; /* linea derecha es correcta */
    }
    /* ** */
    const noSonIguales = ids.indexOf(6); // id del widget "no son iguales"
    const filaNoSonIguales = fila[noSonIguales];
    const columnaNoSonIguales = columna[noSonIguales];

    if (
        filaNoSonIguales === 4 &&
        columnaNoSonIguales === columnaDecisionSiNo + 2
    ) {
        boolean11 = true; /* no son iguales es correcta */
    }

    /*  */
    const indiceLinea1 = ids.indexOf(8); // id del widget "linea abajo"
    const filaLinea1 = fila[indiceLinea1];
    const columnaLinea1 = columna[indiceLinea1];
    const indiceLinea2 = ids.indexOf(9); // id del widget "linea abajo"
    const filaLinea2 = fila[indiceLinea2];
    const columnaLinea2 = columna[indiceLinea2];
    const indiceLinea3 = ids.indexOf(10); // id del widget "linea abajo"
    const filaLinea3 = fila[indiceLinea3];
    const columnaLinea3 = columna[indiceLinea3];

    if (
        (columnaLinea1 === columnaNoSonIguales ||
            columnaLinea2 === columnaNoSonIguales ||
            columnaLinea3 === columnaNoSonIguales) &&
        (filaLinea1 === 5 || filaLinea2 === 5 || filaLinea3 === 5)
    ) {
        boolean12 = true; /* la linea es correcta */
    } else {
        boolean12 = false;
    }
    /********otra linea******** */
    if (
        (columnaLinea1 === columnaNoSonIguales ||
            columnaLinea2 === columnaNoSonIguales ||
            columnaLinea3 === columnaNoSonIguales) &&
        (filaLinea1 === 6 || filaLinea2 === 6 || filaLinea3 === 6)
    ) {
        boolean13 = true; /* la linea es correcta */
    } else {
        boolean13 = false;
    }
    /********otra linea******** */
    if (
        (columnaLinea1 === columnaNoSonIguales ||
            columnaLinea2 === columnaNoSonIguales ||
            columnaLinea3 === columnaNoSonIguales) &&
        (filaLinea1 === 7 || filaLinea2 === 7 || filaLinea3 === 7)
    ) {
        boolean14 = true; /* la linea es correcta */
    } else {
        boolean14 = false;
    }
    /* ****** linea de esquina****** */
    const lineaEsquina = ids.indexOf(5); // id del widget "linea doblada"
    const filaLineaEsquina = fila[lineaEsquina];
    const columnaLineaEsquina = columna[lineaEsquina];

    if (columnaLineaEsquina === columnaNoSonIguales && filaLineaEsquina === 8) {
        boolean15 = true; /* linea de esquina es correcta */
    } else {
        boolean15 = false;
    }
    /* ****** linea izquierda****** */
    const lineaIzquierda = ids.indexOf(12); // id del widget "linea izquierda"
    const filaLineaIzquierda = fila[lineaIzquierda];
    const columnaLineaIzquierda = columna[lineaIzquierda];
    if (
        filaLineaIzquierda === 8 &&
        columnaLineaIzquierda === columnaNoSonIguales - 1
    ) {
        boolean16 = true; /* linea izquierda es correcta */
    } else {
        boolean16 = false;
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
