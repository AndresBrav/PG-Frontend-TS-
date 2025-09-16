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

export const verificarResultadoEjercicio2 = (
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
    let boolean17: boolean = false;
    let boolean18: boolean = false;
    let boolean19: boolean = false;
    let boolean20: boolean = false;
    let boolean21: boolean = false;

    const indiceInicio = ids.indexOf(4); // id del widget "inicio"
    const filaInicio = fila[indiceInicio];
    const columnaInicio = columna[indiceInicio];

    if (filaInicio === 0) {
        boolean1 = true;
    } else {
        boolean1 = false;
    }

    //flecha abajo
    const indiceLineaAbajo1 = ids.indexOf(3); // id del widget "linea abajo"
    const filaLineaAbajo1 = fila[indiceLineaAbajo1];
    const columnaLineaAbajo1 = columna[indiceLineaAbajo1];
    const indiceLineaAbajo2 = ids.indexOf(19); // id del widget "linea abajo"
    const filaLineaAbajo2 = fila[indiceLineaAbajo2];
    const columnaLineaAbajo2 = columna[indiceLineaAbajo2];
    const indiceLineaAbajo3 = ids.indexOf(20); // id del widget "linea abajo"
    const filaLineaAbajo3 = fila[indiceLineaAbajo3];
    const columnaLineaAbajo3 = columna[indiceLineaAbajo3];
    const indiceLineaAbajo4 = ids.indexOf(21); // id del widget "linea abajo"
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

    //introdusca n1,n2
    const leern1n2 = ids.indexOf(5); // id del widget "leer n1,n2"
    const filaleern1n2 = fila[leern1n2];
    const columnaleern1n2 = columna[leern1n2];
    if (columnaleern1n2 === columnaInicio && filaleern1n2 === 2) {
        boolean3 = true;
    } else {
        boolean3 = false;
    }

    //flecha abajo 2
    //flecha abajo
    const indiceLineaAbajo11 = ids.indexOf(3); // id del widget "linea abajo"
    const filaLineaAbajo11 = fila[indiceLineaAbajo11];
    const columnaLineaAbajo11 = columna[indiceLineaAbajo11];
    const indiceLineaAbajo22 = ids.indexOf(19); // id del widget "linea abajo"
    const filaLineaAbajo22 = fila[indiceLineaAbajo22];
    const columnaLineaAbajo22 = columna[indiceLineaAbajo22];
    const indiceLineaAbajo33 = ids.indexOf(20); // id del widget "linea abajo"
    const filaLineaAbajo33 = fila[indiceLineaAbajo33];
    const columnaLineaAbajo33 = columna[indiceLineaAbajo33];
    const indiceLineaAbajo44 = ids.indexOf(21); // id del widget "linea abajo"
    const filaLineaAbajo44 = fila[indiceLineaAbajo44];
    const columnaLineaAbajo44 = columna[indiceLineaAbajo44];

    if (
        (columnaLineaAbajo11 === columnaInicio && filaLineaAbajo11 === 3) ||
        (columnaLineaAbajo22 === columnaInicio && filaLineaAbajo22 === 3) ||
        (columnaLineaAbajo33 === columnaInicio && filaLineaAbajo33 === 3) ||
        (columnaLineaAbajo44 === columnaInicio && filaLineaAbajo44 === 3)
    ) {
        boolean4 = true; /* la linea abajo es correcta */
    } else {
        boolean4 = false;
    }

    //leer n1,n2
    const leern1n22 = ids.indexOf(6); // id del widget "leer n1,n2"
    const filaleern1n22 = fila[leern1n22];
    const columnaleern1n22 = columna[leern1n22];
    if (columnaleern1n22 === columnaInicio && filaleern1n22 === 4) {
        boolean5 = true;
    } else {
        boolean5 = false;
    }

    //flecha abajo 3
    const indiceLineaAbajo111 = ids.indexOf(3); // id del widget "linea abajo"
    const filaLineaAbajo111 = fila[indiceLineaAbajo111];
    const columnaLineaAbajo111 = columna[indiceLineaAbajo111];
    const indiceLineaAbajo222 = ids.indexOf(19); // id del widget "linea abajo"
    const filaLineaAbajo222 = fila[indiceLineaAbajo222];
    const columnaLineaAbajo222 = columna[indiceLineaAbajo222];
    const indiceLineaAbajo333 = ids.indexOf(20); // id del widget "linea abajo"
    const filaLineaAbajo333 = fila[indiceLineaAbajo333];
    const columnaLineaAbajo333 = columna[indiceLineaAbajo333];
    const indiceLineaAbajo444 = ids.indexOf(21); // id del widget "linea abajo"
    const filaLineaAbajo444 = fila[indiceLineaAbajo444];
    const columnaLineaAbajo444 = columna[indiceLineaAbajo444];

    if (
        (columnaLineaAbajo111 === columnaInicio && filaLineaAbajo111 === 5) ||
        (columnaLineaAbajo222 === columnaInicio && filaLineaAbajo222 === 5) ||
        (columnaLineaAbajo333 === columnaInicio && filaLineaAbajo333 === 5) ||
        (columnaLineaAbajo444 === columnaInicio && filaLineaAbajo444 === 5)
    ) {
        boolean6 = true; /* la linea abajo es correcta */
    } else {
        boolean6 = false;
    }

    //primer descicion
    const decisionSiNo = ids.indexOf(1); // id del widget "decision si no"
    const filaDecisionSiNo = fila[decisionSiNo];
    const columnaDecisionSiNo = columna[decisionSiNo];
    if (columnaDecisionSiNo === columnaInicio && filaDecisionSiNo === 6) {
        boolean7 = true; /* decision si  es correcta */
    } else {
        boolean7 = false;
    }

    //fleacha abajo 4
    const indiceLineaAbajo1111 = ids.indexOf(3); // id del widget "linea abajo"
    const filaLineaAbajo1111 = fila[indiceLineaAbajo1111];
    const columnaLineaAbajo1111 = columna[indiceLineaAbajo1111];
    const indiceLineaAbajo2222 = ids.indexOf(19); // id del widget "linea abajo"
    const filaLineaAbajo2222 = fila[indiceLineaAbajo2222];
    const columnaLineaAbajo2222 = columna[indiceLineaAbajo2222];
    const indiceLineaAbajo3333 = ids.indexOf(20); // id del widget "linea abajo"
    const filaLineaAbajo3333 = fila[indiceLineaAbajo3333];
    const columnaLineaAbajo3333 = columna[indiceLineaAbajo3333];
    const indiceLineaAbajo4444 = ids.indexOf(21); // id del widget "linea abajo"
    const filaLineaAbajo4444 = fila[indiceLineaAbajo4444];
    const columnaLineaAbajo4444 = columna[indiceLineaAbajo4444];

    if (
        (columnaLineaAbajo1111 === columnaInicio && filaLineaAbajo1111 === 7) ||
        (columnaLineaAbajo2222 === columnaInicio && filaLineaAbajo2222 === 7) ||
        (columnaLineaAbajo3333 === columnaInicio && filaLineaAbajo3333 === 7) ||
        (columnaLineaAbajo4444 === columnaInicio && filaLineaAbajo4444 === 7)
    ) {
        boolean8 = true; /* la linea abajo es correcta */
    } else {
        boolean8 = false;
    }

    //desicion 2
    const decisionSiNo2 = ids.indexOf(7);
    const filaDecisionSiNo2 = fila[decisionSiNo2];
    const columnaDecisionSiNo2 = columna[decisionSiNo2];
    if (columnaDecisionSiNo2 === columnaInicio && filaDecisionSiNo2 === 8) {
        boolean9 = true; /* decision si  es correcta */
    } else {
        boolean9 = false;
    }

    //esquinaizquierda1
    const esquinaIzquierda1 = ids.indexOf(12); // id del widget "linea doblada"
    const filaEsquinaIzquierda1 = fila[esquinaIzquierda1];
    const columnaEsquinaIzquierda1 = columna[esquinaIzquierda1];
    if (
        columnaEsquinaIzquierda1 === columnaInicio - 1 &&
        columnaEsquinaIzquierda1 === columnaDecisionSiNo2 - 1 &&
        filaEsquinaIzquierda1 === 8
    ) {
        boolean10 = true; /* linea de esquina es correcta */
    } else {
        boolean10 = false;
    }

    //n1 es mayor que n2
    const n1MayorN2 = ids.indexOf(17);
    const filan1MayorN2 = fila[n1MayorN2];
    const columnan1MayorN2 = columna[n1MayorN2];
    if (
        columnan1MayorN2 === columnaInicio - 1 &&
        columnan1MayorN2 === columnaDecisionSiNo2 - 1 &&
        filan1MayorN2 === 9
    ) {
        boolean11 = true; /* n1 mayor que n2 es correcta */
    } else {
        boolean11 = false;
    }

    //esquina derecha3
    const esquinaDerecha3 = ids.indexOf(10);
    const filaEsquinaDerecha3 = fila[esquinaDerecha3];
    const columnaEsquinaDerecha3 = columna[esquinaDerecha3];
    if (
        columnaEsquinaDerecha3 === columnaInicio + 1 &&
        columnaEsquinaDerecha3 === columnaDecisionSiNo2 + 1 &&
        filaEsquinaDerecha3 === 8
    ) {
        boolean12 = true; /* linea de esquina es correcta */
    } else {
        boolean12 = false;
    }

    //n2 es mayor que n1
    const n2MayorN1 = ids.indexOf(18);
    const filan2MayorN1 = fila[n2MayorN1];
    const columnan2MayorN1 = columna[n2MayorN1];
    if (
        columnan2MayorN1 === columnaInicio + 1 &&
        columnan2MayorN1 === columnaDecisionSiNo2 + 1 &&
        filan2MayorN1 === 9
    ) {
        boolean13 = true; /* n2 mayor que n1 es correcta */
    } else {
        boolean13 = false;
    }

    //izquierda 2
    const lineaIzquierda2 = ids.indexOf(13);
    const filaLineaIzquierda2 = fila[lineaIzquierda2];
    const columnaLineaIzquierda2 = columna[lineaIzquierda2];
    if (
        filaLineaIzquierda2 === 10 &&
        columnaLineaIzquierda2 === columnaInicio - 1 &&
        columnaLineaIzquierda2 === columnaDecisionSiNo2 - 1
    ) {
        boolean14 = true; /* linea izquierda es correcta */
    } else {
        boolean14 = false;
    }

    //linea derecha 4
    const lineaDerecha4 = ids.indexOf(11);
    const filaLineaDerecha4 = fila[lineaDerecha4];
    const columnaLineaDerecha4 = columna[lineaDerecha4];
    if (
        filaLineaDerecha4 === 10 &&
        columnaLineaDerecha4 === columnaInicio + 1 &&
        columnaLineaDerecha4 === columnaDecisionSiNo2 + 1
    ) {
        boolean15 = true; /* linea derecha es correcta */
    } else {
        boolean15 = false;
    }

    //fin
    const fin = ids.indexOf(2); // id del widget "fin"
    const filaFin = fila[fin];
    const columnaFin = columna[fin];
    if (columnaFin === columnaInicio && filaFin === 10) {
        boolean16 = true; /* fin es correcta */
    } else {
        boolean16 = false;
    }

    //esquina derecha1
    const lineaDerecha1 = ids.indexOf(8);
    const filaLineaDerecha1 = fila[lineaDerecha1];
    const columnaLineaDerecha1 = columna[lineaDerecha1];
    if (filaLineaDerecha1 === 2 && columnaLineaDerecha1 === columnaInicio + 1) {
        boolean17 = true; /* linea derecha es correcta */
    } else {
        boolean17 = false;
    }

    //linea recta 1
    const linearRecta1 = ids.indexOf(14);
    const filaLineaRecta1 = fila[linearRecta1];
    const columnaLineaRecta1 = columna[linearRecta1];

    const linearRecta2 = ids.indexOf(15);
    const filaLineaRecta2 = fila[linearRecta2];
    const columnaLineaRecta2 = columna[linearRecta2];

    const linearRecta3 = ids.indexOf(16);
    const filaLineaRecta3 = fila[linearRecta3];
    const columnaLineaRecta3 = columna[linearRecta3];

    if (
        (columnaLineaRecta1 === columnaInicio + 1 && filaLineaRecta1 === 3) ||
        (columnaLineaRecta2 === columnaInicio + 1 && filaLineaRecta2 === 3) ||
        (columnaLineaRecta3 === columnaInicio + 1 && filaLineaRecta3 === 3)
    ) {
        boolean18 = true; /* la linea abajo es correcta */
    } else {
        boolean18 = false;
    }

    //linea recta 2
    const linearRecta11 = ids.indexOf(14);
    const filaLineaRecta11 = fila[linearRecta11];
    const columnaLineaRecta11 = columna[linearRecta11];

    const linearRecta22 = ids.indexOf(15);
    const filaLineaRecta22 = fila[linearRecta22];
    const columnaLineaRecta22 = columna[linearRecta22];

    const linearRecta33 = ids.indexOf(16);
    const filaLineaRecta33 = fila[linearRecta33];
    const columnaLineaRecta33 = columna[linearRecta33];

    if (
        (columnaLineaRecta11 === columnaInicio + 1 && filaLineaRecta11 === 4) ||
        (columnaLineaRecta22 === columnaInicio + 1 && filaLineaRecta22 === 4) ||
        (columnaLineaRecta33 === columnaInicio + 1 && filaLineaRecta33 === 4)
    ) {
        boolean19 = true; /* la linea abajo es correcta */
    } else {
        boolean19 = false;
    }

    //linea recta 3
    const linearRecta111 = ids.indexOf(14);
    const filaLineaRecta111 = fila[linearRecta111];
    const columnaLineaRecta111 = columna[linearRecta111];

    const linearRecta222 = ids.indexOf(15);
    const filaLineaRecta222 = fila[linearRecta222];
    const columnaLineaRecta222 = columna[linearRecta222];

    const linearRecta333 = ids.indexOf(16);
    const filaLineaRecta333 = fila[linearRecta333];
    const columnaLineaRecta333 = columna[linearRecta333];

    if (
        (columnaLineaRecta111 === columnaInicio + 1 &&
            filaLineaRecta111 === 5) ||
        (columnaLineaRecta222 === columnaInicio + 1 &&
            filaLineaRecta222 === 5) ||
        (columnaLineaRecta333 === columnaInicio + 1 && filaLineaRecta333 === 5)
    ) {
        boolean20 = true; /* la linea abajo es correcta */
    } else {
        boolean20 = false;
    }

    //linea  esquina derecha 2
    const lineaDerecha2 = ids.indexOf(9);
    const filaLineaDerecha2 = fila[lineaDerecha2];
    const columnaLineaDerecha2 = columna[lineaDerecha2];
    if (filaLineaDerecha2 === 6 && columnaLineaDerecha2 === columnaInicio + 1) {
        boolean21 = true; /* linea derecha es correcta */
    } else {
        boolean21 = false;
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
        boolean17,
        boolean18,
        boolean19,
        boolean20,
        boolean21,
    ];
};

export const verificarResultadoEjercicio3 = (
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
    let boolean17: boolean = false;
    let boolean18: boolean = false;
    let boolean19: boolean = false;
    let boolean20: boolean = false;
    let boolean21: boolean = false;

    const indiceInicio = ids.indexOf(1); // id del widget "inicio"
    const filaInicio = fila[indiceInicio];
    const columnaInicio = columna[indiceInicio];

    if (filaInicio === 0) {
        boolean1 = true;
    } else {
        boolean1 = false;
    }

    //flecha abajo
    const indiceLineaAbajo1 = ids.indexOf(2); // id del widget "linea abajo"
    const filaLineaAbajo1 = fila[indiceLineaAbajo1];
    const columnaLineaAbajo1 = columna[indiceLineaAbajo1];
    const indiceLineaAbajo2 = ids.indexOf(3); // id del widget "linea abajo"
    const filaLineaAbajo2 = fila[indiceLineaAbajo2];
    const columnaLineaAbajo2 = columna[indiceLineaAbajo2];
    const indiceLineaAbajo3 = ids.indexOf(4); // id del widget "linea abajo"
    const filaLineaAbajo3 = fila[indiceLineaAbajo3];
    const columnaLineaAbajo3 = columna[indiceLineaAbajo3];
    const indiceLineaAbajo4 = ids.indexOf(5); // id del widget "linea abajo"
    const filaLineaAbajo4 = fila[indiceLineaAbajo4];
    const columnaLineaAbajo4 = columna[indiceLineaAbajo4];
    const indiceLineaAbajo5 = ids.indexOf(6); // id del widget "linea abajo"
    const filaLineaAbajo5 = fila[indiceLineaAbajo5];
    const columnaLineaAbajo5 = columna[indiceLineaAbajo5];
    const indiceLineaAbajo6 = ids.indexOf(7); // id del widget "linea abajo"
    const filaLineaAbajo6 = fila[indiceLineaAbajo6];
    const columnaLineaAbajo6 = columna[indiceLineaAbajo6];

    if (
        (columnaLineaAbajo1 === columnaInicio && filaLineaAbajo1 === 1) ||
        (columnaLineaAbajo2 === columnaInicio && filaLineaAbajo2 === 1) ||
        (columnaLineaAbajo3 === columnaInicio && filaLineaAbajo3 === 1) ||
        (columnaLineaAbajo4 === columnaInicio && filaLineaAbajo4 === 1) ||
        (columnaLineaAbajo5 === columnaInicio && filaLineaAbajo5 === 1) ||
        (columnaLineaAbajo6 === columnaInicio && filaLineaAbajo6 === 1)
    ) {
        boolean2 = true; /* la linea abajo es correcta */
    } else {
        boolean2 = false;
    }

    // suma =0
    const suma = ids.indexOf(8); // suma
    const filaSuma = fila[suma];
    const columnaSuma = columna[suma];

    if (columnaSuma === columnaInicio && filaSuma === 2) {
        boolean3 = true;
    } else {
        boolean3 = false;
    }

    // otra flecha
    // flechas abajo
    const idxAbajo1 = ids.indexOf(2); // id del widget "flecha abajo 1"
    const filaAbajo1 = fila[idxAbajo1];
    const colAbajo1 = columna[idxAbajo1];

    const idxAbajo2 = ids.indexOf(3); // id del widget "flecha abajo 2"
    const filaAbajo2 = fila[idxAbajo2];
    const colAbajo2 = columna[idxAbajo2];

    const idxAbajo3 = ids.indexOf(4); // id del widget "flecha abajo 3"
    const filaAbajo3 = fila[idxAbajo3];
    const colAbajo3 = columna[idxAbajo3];

    const idxAbajo4 = ids.indexOf(5); // id del widget "flecha abajo 4"
    const filaAbajo4 = fila[idxAbajo4];
    const colAbajo4 = columna[idxAbajo4];

    const idxAbajo5 = ids.indexOf(6); // id del widget "flecha abajo 5"
    const filaAbajo5 = fila[idxAbajo5];
    const colAbajo5 = columna[idxAbajo5];

    const idxAbajo6 = ids.indexOf(7); // id del widget "flecha abajo 6"
    const filaAbajo6 = fila[idxAbajo6];
    const colAbajo6 = columna[idxAbajo6];

    if (
        (colAbajo1 === columnaInicio && filaAbajo1 === 3) ||
        (colAbajo2 === columnaInicio && filaAbajo2 === 3) ||
        (colAbajo3 === columnaInicio && filaAbajo3 === 3) ||
        (colAbajo4 === columnaInicio && filaAbajo4 === 3) ||
        (colAbajo5 === columnaInicio && filaAbajo5 === 3) ||
        (colAbajo6 === columnaInicio && filaAbajo6 === 3)
    ) {
        boolean4 = true; /* la linea abajo es correcta */
    } else {
        boolean4 = false;
    }

    //contador =1
    const contador = ids.indexOf(9);
    const filacont = fila[contador];
    const columnacont = columna[contador];

    if (columnacont === columnaInicio && filacont === 4) {
        boolean5 = true;
    } else {
        boolean5 = false;
    }

    //otra flecha abajo
    // flechas abajo
    const iAbajo1 = ids.indexOf(2); // id flecha abajo 1
    const fAbajo1 = fila[iAbajo1];
    const cAbajo1 = columna[iAbajo1];

    const iAbajo2 = ids.indexOf(3); // id flecha abajo 2
    const fAbajo2 = fila[iAbajo2];
    const cAbajo2 = columna[iAbajo2];

    const iAbajo3 = ids.indexOf(4); // id flecha abajo 3
    const fAbajo3 = fila[iAbajo3];
    const cAbajo3 = columna[iAbajo3];

    const iAbajo4 = ids.indexOf(5); // id flecha abajo 4
    const fAbajo4 = fila[iAbajo4];
    const cAbajo4 = columna[iAbajo4];

    const iAbajo5 = ids.indexOf(6); // id flecha abajo 5
    const fAbajo5 = fila[iAbajo5];
    const cAbajo5 = columna[iAbajo5];

    const iAbajo6 = ids.indexOf(7); // id flecha abajo 6
    const fAbajo6 = fila[iAbajo6];
    const cAbajo6 = columna[iAbajo6];

    if (
        (cAbajo1 === columnaInicio && fAbajo1 === 5) ||
        (cAbajo2 === columnaInicio && fAbajo2 === 5) ||
        (cAbajo3 === columnaInicio && fAbajo3 === 5) ||
        (cAbajo4 === columnaInicio && fAbajo4 === 5) ||
        (cAbajo5 === columnaInicio && fAbajo5 === 5) ||
        (cAbajo6 === columnaInicio && fAbajo6 === 5)
    ) {
        boolean6 = true; /* la linea abajo es correcta */
    } else {
        boolean6 = false;
    }

    //descicion
    const desicion = ids.indexOf(10); // id del widget "decision si no"
    const filadesicion = fila[desicion];
    const columnadesicion = columna[desicion];
    if (columnadesicion === columnaInicio && filadesicion === 6) {
        boolean7 = true; /* decision si  es correcta */
    } else {
        boolean7 = false;
    }

    //esquina der abajo
    const esqderabajo = ids.indexOf(21); // id del widget "decision si no"
    const filaderaba = fila[esqderabajo];
    const columnaderaba = columna[esqderabajo];
    if (
        columnaderaba === columnaInicio + 1 &&
        columnaderaba === columnadesicion + 1 &&
        filaderaba === 6
    ) {
        boolean8 = true; /* decision si  es correcta */
    } else {
        boolean8 = false;
    }

    //leer numero
    const leern = ids.indexOf(13); // id del widget "decision si no"
    const filaleern = fila[leern];
    const colleern = columna[leern];
    if (
        colleern === columnaInicio + 1 &&
        colleern === columnadesicion + 1 &&
        filaleern === 7
    ) {
        boolean9 = true; /* decision si  es correcta */
    } else {
        boolean9 = false;
    }

    //flecha abajo
    // flechas abajo
    const indexDown1 = ids.indexOf(2); // id flecha abajo 1
    const rowDown1 = fila[indexDown1];
    const colDown1 = columna[indexDown1];

    const indexDown2 = ids.indexOf(3); // id flecha abajo 2
    const rowDown2 = fila[indexDown2];
    const colDown2 = columna[indexDown2];

    const indexDown3 = ids.indexOf(4); // id flecha abajo 3
    const rowDown3 = fila[indexDown3];
    const colDown3 = columna[indexDown3];

    const indexDown4 = ids.indexOf(5); // id flecha abajo 4
    const rowDown4 = fila[indexDown4];
    const colDown4 = columna[indexDown4];

    const indexDown5 = ids.indexOf(6); // id flecha abajo 5
    const rowDown5 = fila[indexDown5];
    const colDown5 = columna[indexDown5];

    const indexDown6 = ids.indexOf(7); // id flecha abajo 6
    const rowDown6 = fila[indexDown6];
    const colDown6 = columna[indexDown6];

    if (
        (colDown1 === columnaInicio + 1 && rowDown1 === 8) ||
        (colDown2 === columnaInicio + 1 && rowDown2 === 8) ||
        (colDown3 === columnaInicio + 1 && rowDown3 === 8) ||
        (colDown4 === columnaInicio + 1 && rowDown4 === 8) ||
        (colDown5 === columnaInicio + 1 && rowDown5 === 8) ||
        (colDown6 === columnaInicio + 1 && rowDown6 === 8)
    ) {
        boolean10 = true; /* la línea abajo es correcta */
    } else {
        boolean10 = false;
    }

    //suma = suma+1
    //leer numero
    const sumamas = ids.indexOf(14); // id del widget "decision si no"
    const filasumamas = fila[sumamas];
    const colsumamas = columna[sumamas];
    if (
        colsumamas === columnaInicio + 1 &&
        colsumamas === columnadesicion + 1 &&
        filasumamas === 9
    ) {
        boolean11 = true; /* decision si  es correcta */
    } else {
        boolean11 = false;
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
        boolean17,
        boolean18,
        boolean19,
        boolean20,
        boolean21,
    ];
};
