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

    if (filaInicio === 0) {
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
        (columnaLineaAbajo1 === columnaInicio && filaLineaAbajo1 === 1) ||
        (columnaLineaAbajo2 === columnaInicio && filaLineaAbajo2 === 1) ||
        (columnaLineaAbajo3 === columnaInicio && filaLineaAbajo3 === 1) ||
        (columnaLineaAbajo4 === columnaInicio && filaLineaAbajo4 === 1)
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
    const indiceLineaAbajo_7 = ids.indexOf(7); // id del widget "linea abajo 7"
    const filaLineaAbajo_7 = fila[indiceLineaAbajo_7];
    const columnaLineaAbajo_7 = columna[indiceLineaAbajo_7];

    const indiceLineaAbajo_14 = ids.indexOf(14); // id del widget "linea abajo 14"
    const filaLineaAbajo_14 = fila[indiceLineaAbajo_14];
    const columnaLineaAbajo_14 = columna[indiceLineaAbajo_14];

    const indiceLineaAbajo_15 = ids.indexOf(15); // id del widget "linea abajo 15"
    const filaLineaAbajo_15 = fila[indiceLineaAbajo_15];
    const columnaLineaAbajo_15 = columna[indiceLineaAbajo_15];

    const indiceLineaAbajo_16 = ids.indexOf(16); // id del widget "linea abajo 16"
    const filaLineaAbajo_16 = fila[indiceLineaAbajo_16];
    const columnaLineaAbajo_16 = columna[indiceLineaAbajo_16];

    if (
        (columnaLineaAbajo_7 === columnaInicio && filaLineaAbajo_7 === 3) ||
        (columnaLineaAbajo_14 === columnaInicio && filaLineaAbajo_14 === 3) ||
        (columnaLineaAbajo_15 === columnaInicio && filaLineaAbajo_15 === 3) ||
        (columnaLineaAbajo_16 === columnaInicio && filaLineaAbajo_16 === 3)
    ) {
        boolean4 = true; /* la linea abajo es correcta */
    } else {
        boolean4 = false;
    }

    // if (
    //     (columnaLineaAbajo1 === columnaInicio ||
    //         columnaLineaAbajo2 === columnaInicio ||
    //         columnaLineaAbajo3 === columnaInicio ||
    //         columnaLineaAbajo4 === columnaInicio) &&
    //     (filaLineaAbajo1 === 3 ||
    //         filaLineaAbajo2 === 3 ||
    //         filaLineaAbajo3 === 3 ||
    //         filaLineaAbajo4 === 3)
    // ) {
    //     boolean4 = true; /* la linea abajo es correcta */
    // } else {
    //     boolean4 = false;
    // }

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
    /****** verificar la flecha hacia abajo ****/
    const indiceFlechaAbajo_7 = ids.indexOf(7); // id del widget "flecha abajo 7"
    const filaFlechaAbajo_7 = fila[indiceFlechaAbajo_7];
    const columnaFlechaAbajo_7 = columna[indiceFlechaAbajo_7];

    const indiceFlechaAbajo_14 = ids.indexOf(14); // id del widget "flecha abajo 14"
    const filaFlechaAbajo_14 = fila[indiceFlechaAbajo_14];
    const columnaFlechaAbajo_14 = columna[indiceFlechaAbajo_14];

    const indiceFlechaAbajo_15 = ids.indexOf(15); // id del widget "flecha abajo 15"
    const filaFlechaAbajo_15 = fila[indiceFlechaAbajo_15];
    const columnaFlechaAbajo_15 = columna[indiceFlechaAbajo_15];

    const indiceFlechaAbajo_16 = ids.indexOf(16); // id del widget "flecha abajo 16"
    const filaFlechaAbajo_16 = fila[indiceFlechaAbajo_16];
    const columnaFlechaAbajo_16 = columna[indiceFlechaAbajo_16];

    if (
        (columnaFlechaAbajo_7 === columnaInicio && filaFlechaAbajo_7 === 5) ||
        (columnaFlechaAbajo_14 === columnaInicio && filaFlechaAbajo_14 === 5) ||
        (columnaFlechaAbajo_15 === columnaInicio && filaFlechaAbajo_15 === 5) ||
        (columnaFlechaAbajo_16 === columnaInicio && filaFlechaAbajo_16 === 5)
    ) {
        boolean6 = true; /* la flecha hacia abajo es correcta */
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
    /****** Comprobar posición de widgets abajo ****/
    const checkAbajoIndex_7 = ids.indexOf(7); // widget abajo ID 7
    const checkAbajoFila_7 = fila[checkAbajoIndex_7];
    const checkAbajoColumna_7 = columna[checkAbajoIndex_7];

    const checkAbajoIndex_14 = ids.indexOf(14); // widget abajo ID 14
    const checkAbajoFila_14 = fila[checkAbajoIndex_14];
    const checkAbajoColumna_14 = columna[checkAbajoIndex_14];

    const checkAbajoIndex_15 = ids.indexOf(15); // widget abajo ID 15
    const checkAbajoFila_15 = fila[checkAbajoIndex_15];
    const checkAbajoColumna_15 = columna[checkAbajoIndex_15];

    const checkAbajoIndex_16 = ids.indexOf(16); // widget abajo ID 16
    const checkAbajoFila_16 = fila[checkAbajoIndex_16];
    const checkAbajoColumna_16 = columna[checkAbajoIndex_16];

    if (
        (checkAbajoColumna_7 === columnaInicio && checkAbajoFila_7 === 7) ||
        (checkAbajoColumna_14 === columnaInicio && checkAbajoFila_14 === 7) ||
        (checkAbajoColumna_15 === columnaInicio && checkAbajoFila_15 === 7) ||
        (checkAbajoColumna_16 === columnaInicio && checkAbajoFila_16 === 7)
    ) {
        boolean8 = true; /* comprobación de widgets abajo correcta */
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

    console.log("la columa de no son iguales es: ", columnaNoSonIguales);
    console.log(columnaLinea1, columnaLinea2, columnaLinea3);
    console.log(filaLinea1, filaLinea2, filaLinea3);

    if (columnaLinea1 === columnaNoSonIguales && filaLinea1 === 5) {
        boolean12 = true; /* la línea 1 es correcta */
    } else if (columnaLinea2 === columnaNoSonIguales && filaLinea2 === 5) {
        boolean12 = true; /* la línea 2 es correcta */
    } else if (columnaLinea3 === columnaNoSonIguales && filaLinea3 === 5) {
        boolean12 = true; /* la línea 3 es correcta */
    } else {
        boolean12 = false; /* ninguna línea es correcta */
    }

    /********otra linea******** */
    /****** Verificar líneas especiales ****/
    const checkLineaIndex_8 = ids.indexOf(8); // id del widget "línea especial 8"
    const checkLineaFila_8 = fila[checkLineaIndex_8];
    const checkLineaColumna_8 = columna[checkLineaIndex_8];

    const checkLineaIndex_9 = ids.indexOf(9); // id del widget "línea especial 9"
    const checkLineaFila_9 = fila[checkLineaIndex_9];
    const checkLineaColumna_9 = columna[checkLineaIndex_9];

    const checkLineaIndex_10 = ids.indexOf(10); // id del widget "línea especial 10"
    const checkLineaFila_10 = fila[checkLineaIndex_10];
    const checkLineaColumna_10 = columna[checkLineaIndex_10];

    if (checkLineaColumna_8 === columnaNoSonIguales && checkLineaFila_8 === 6) {
        boolean13 = true; /* la línea 1 es correcta */
    } else if (
        checkLineaColumna_9 === columnaNoSonIguales &&
        checkLineaFila_9 === 6
    ) {
        boolean13 = true; /* la línea 2 es correcta */
    } else if (
        checkLineaColumna_10 === columnaNoSonIguales &&
        checkLineaFila_10 === 6
    ) {
        boolean13 = true; /* la línea 3 es correcta */
    } else {
        boolean13 = false; /* ninguna línea es correcta */
    }

    /********otra linea******** */
    /****** Validar líneas especiales ****/
    const validaLineaIdx_8 = ids.indexOf(8); // id del widget "línea especial 8"
    const validaLineaFila_8 = fila[validaLineaIdx_8];
    const validaLineaCol_8 = columna[validaLineaIdx_8];

    const validaLineaIdx_9 = ids.indexOf(9); // id del widget "línea especial 9"
    const validaLineaFila_9 = fila[validaLineaIdx_9];
    const validaLineaCol_9 = columna[validaLineaIdx_9];

    const validaLineaIdx_10 = ids.indexOf(10); // id del widget "línea especial 10"
    const validaLineaFila_10 = fila[validaLineaIdx_10];
    const validaLineaCol_10 = columna[validaLineaIdx_10];

    if (validaLineaCol_8 === columnaNoSonIguales && validaLineaFila_8 === 7) {
        boolean14 = true; /* la línea 1 es correcta */
    } else if (
        validaLineaCol_9 === columnaNoSonIguales &&
        validaLineaFila_9 === 7
    ) {
        boolean14 = true; /* la línea 2 es correcta */
    } else if (
        validaLineaCol_10 === columnaNoSonIguales &&
        validaLineaFila_10 === 7
    ) {
        boolean14 = true; /* la línea 3 es correcta */
    } else {
        boolean14 = false; /* ninguna línea es correcta */
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
