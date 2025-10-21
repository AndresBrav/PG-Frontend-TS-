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
    let boolean22: boolean = false;

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

    //flecha abajo

    // flechas abajo
    const arrowDownIndex1 = ids.indexOf(2); // id flecha abajo 1
    const arrowDownRow1 = fila[arrowDownIndex1];
    const arrowDownCol1 = columna[arrowDownIndex1];

    const arrowDownIndex2 = ids.indexOf(3); // id flecha abajo 2
    const arrowDownRow2 = fila[arrowDownIndex2];
    const arrowDownCol2 = columna[arrowDownIndex2];

    const arrowDownIndex3 = ids.indexOf(4); // id flecha abajo 3
    const arrowDownRow3 = fila[arrowDownIndex3];
    const arrowDownCol3 = columna[arrowDownIndex3];

    const arrowDownIndex4 = ids.indexOf(5); // id flecha abajo 4
    const arrowDownRow4 = fila[arrowDownIndex4];
    const arrowDownCol4 = columna[arrowDownIndex4];

    const arrowDownIndex5 = ids.indexOf(6); // id flecha abajo 5
    const arrowDownRow5 = fila[arrowDownIndex5];
    const arrowDownCol5 = columna[arrowDownIndex5];

    const arrowDownIndex6 = ids.indexOf(7); // id flecha abajo 6
    const arrowDownRow6 = fila[arrowDownIndex6];
    const arrowDownCol6 = columna[arrowDownIndex6];

    if (
        (arrowDownCol1 === columnaInicio + 1 &&
            arrowDownCol1 === columnadesicion + 1 &&
            arrowDownRow1 === 10) ||
        (arrowDownCol2 === columnaInicio + 1 &&
            arrowDownCol2 === columnadesicion + 1 &&
            arrowDownRow2 === 10) ||
        (arrowDownCol3 === columnaInicio + 1 &&
            arrowDownCol3 === columnadesicion + 1 &&
            arrowDownRow3 === 10) ||
        (arrowDownCol4 === columnaInicio + 1 &&
            arrowDownCol4 === columnadesicion + 1 &&
            arrowDownRow4 === 10) ||
        (arrowDownCol5 === columnaInicio + 1 &&
            arrowDownCol5 === columnadesicion + 1 &&
            arrowDownRow5 === 10) ||
        (arrowDownCol6 === columnaInicio + 1 &&
            arrowDownCol6 === columnadesicion + 1 &&
            arrowDownRow6 === 10)
    ) {
        boolean12 = true;
    } else {
        boolean12 = false;
    }

    //contador = contador +1
    const contadorsuma = ids.indexOf(15); // id del widget "decision si no"
    const filascontadorsuma = fila[contadorsuma];
    const colcontadorsumas = columna[contadorsuma];
    if (
        colcontadorsumas === columnaInicio + 1 &&
        colcontadorsumas === columnadesicion + 1 &&
        filascontadorsuma === 11
    ) {
        boolean13 = true; /* decision si  es correcta */
    } else {
        boolean13 = false;
    }

    //esquina izq arriba
    const izqarriba = ids.indexOf(16); // id del widget esquina izquierda arriba
    const filasizqarriba = fila[izqarriba];
    const colizqarriba = columna[izqarriba];
    if (
        colizqarriba === columnaInicio &&
        colizqarriba === columnadesicion &&
        colizqarriba === colcontadorsumas - 1 &&
        filasizqarriba === 11
    ) {
        boolean14 = true; /* decision si  es correcta */
    } else {
        boolean14 = false;
    }

    //lineas
    //linea recta 1
    const linearRecta111 = ids.indexOf(17);
    const filaLineaRecta111 = fila[linearRecta111];
    const columnaLineaRecta111 = columna[linearRecta111];

    const linearRecta222 = ids.indexOf(18);
    const filaLineaRecta222 = fila[linearRecta222];
    const columnaLineaRecta222 = columna[linearRecta222];

    const linearRecta333 = ids.indexOf(19);
    const filaLineaRecta333 = fila[linearRecta333];
    const columnaLineaRecta333 = columna[linearRecta333];

    if (
        (columnaLineaRecta111 === columnaInicio && filaLineaRecta111 === 10) ||
        (columnaLineaRecta222 === columnaInicio && filaLineaRecta222 === 10) ||
        (columnaLineaRecta333 === columnaInicio && filaLineaRecta333 === 10)
    ) {
        boolean15 = true; /* la linea abajo es correcta */
    } else {
        boolean15 = false;
    }

    //linea 2
    // Línea recta 1
    const indiceLineaRecta1 = ids.indexOf(17);
    const filaLineaRecta1 = fila[indiceLineaRecta1];
    const columnaLineaRecta1 = columna[indiceLineaRecta1];

    const indiceLineaRecta2 = ids.indexOf(18);
    const filaLineaRecta2 = fila[indiceLineaRecta2];
    const columnaLineaRecta2 = columna[indiceLineaRecta2];

    const indiceLineaRecta3 = ids.indexOf(19);
    const filaLineaRecta3 = fila[indiceLineaRecta3];
    const columnaLineaRecta3 = columna[indiceLineaRecta3];

    if (
        (columnaLineaRecta1 === columnaInicio && filaLineaRecta1 === 9) ||
        (columnaLineaRecta2 === columnaInicio && filaLineaRecta2 === 9) ||
        (columnaLineaRecta3 === columnaInicio && filaLineaRecta3 === 9)
    ) {
        boolean16 = true; // la línea abajo es correcta
    } else {
        boolean16 = false;
    }

    //linea 3
    // Línea recta
    const indiceRecta1 = ids.indexOf(17);
    const filaRecta1 = fila[indiceRecta1];
    const columnaRecta1 = columna[indiceRecta1];

    const indiceRecta2 = ids.indexOf(18);
    const filaRecta2 = fila[indiceRecta2];
    const columnaRecta2 = columna[indiceRecta2];

    const indiceRecta3 = ids.indexOf(19);
    const filaRecta3 = fila[indiceRecta3];
    const columnaRecta3 = columna[indiceRecta3];

    if (
        (columnaRecta1 === columnaInicio && filaRecta1 === 8) ||
        (columnaRecta2 === columnaInicio && filaRecta2 === 8) ||
        (columnaRecta3 === columnaInicio && filaRecta3 === 8)
    ) {
        boolean17 = true; // la línea abajo es correcta
    } else {
        boolean17 = false;
    }

    //flecha arriba
    const flechaarriba = ids.indexOf(20); // id del widget flecha arriba
    const filasflechaarriba = fila[flechaarriba];
    const colflechaarriba = columna[flechaarriba];
    if (
        colflechaarriba === columnaInicio &&
        colflechaarriba === columnadesicion &&
        filasflechaarriba === 7
    ) {
        boolean18 = true; /* decision si  es correcta */
    } else {
        boolean18 = false;
    }

    //izquierda abajo flecha
    const flechaizqabajo = ids.indexOf(22); // id de flecha izq abajo
    const filaflechaizqabajo = fila[flechaizqabajo];
    const colflechaizqabajo = columna[flechaizqabajo];
    if (
        colflechaizqabajo === columnaInicio - 1 &&
        colflechaizqabajo === columnadesicion - 1 &&
        filaflechaizqabajo === 6
    ) {
        boolean19 = true; /* decision si  es correcta */
    } else {
        boolean19 = false;
    }

    //mostrarsuma
    const mostrarSuma = ids.indexOf(11); // id de mostrar suma
    const filamostrarSuma = fila[mostrarSuma];
    const colmostrarSuma = columna[mostrarSuma];
    if (
        colmostrarSuma === columnaInicio - 1 &&
        colmostrarSuma === columnadesicion - 1 &&
        filamostrarSuma === 7
    ) {
        boolean20 = true; /* decision si  es correcta */
    } else {
        boolean20 = false;
    }

    //flecha abajo
    // Flechas abajo
    const indiceFlechaAbajo1 = ids.indexOf(2); // id flecha abajo 1
    const filaFlechaAbajo1 = fila[indiceFlechaAbajo1];
    const columnaFlechaAbajo1 = columna[indiceFlechaAbajo1];

    const indiceFlechaAbajo2 = ids.indexOf(3); // id flecha abajo 2
    const filaFlechaAbajo2 = fila[indiceFlechaAbajo2];
    const columnaFlechaAbajo2 = columna[indiceFlechaAbajo2];

    const indiceFlechaAbajo3 = ids.indexOf(4); // id flecha abajo 3
    const filaFlechaAbajo3 = fila[indiceFlechaAbajo3];
    const columnaFlechaAbajo3 = columna[indiceFlechaAbajo3];

    const indiceFlechaAbajo4 = ids.indexOf(5); // id flecha abajo 4
    const filaFlechaAbajo4 = fila[indiceFlechaAbajo4];
    const columnaFlechaAbajo4 = columna[indiceFlechaAbajo4];

    const indiceFlechaAbajo5 = ids.indexOf(6); // id flecha abajo 5
    const filaFlechaAbajo5 = fila[indiceFlechaAbajo5];
    const columnaFlechaAbajo5 = columna[indiceFlechaAbajo5];

    const indiceFlechaAbajo6 = ids.indexOf(7); // id flecha abajo 6
    const filaFlechaAbajo6 = fila[indiceFlechaAbajo6];
    const columnaFlechaAbajo6 = columna[indiceFlechaAbajo6];

    if (
        (columnaFlechaAbajo1 === columnaInicio - 1 &&
            columnaFlechaAbajo1 === columnadesicion - 1 &&
            filaFlechaAbajo1 === 8) ||
        (columnaFlechaAbajo2 === columnaInicio - 1 &&
            columnaFlechaAbajo2 === columnadesicion - 1 &&
            filaFlechaAbajo2 === 8) ||
        (columnaFlechaAbajo3 === columnaInicio - 1 &&
            columnaFlechaAbajo3 === columnadesicion - 1 &&
            filaFlechaAbajo3 === 8) ||
        (columnaFlechaAbajo4 === columnaInicio - 1 &&
            columnaFlechaAbajo4 === columnadesicion - 1 &&
            filaFlechaAbajo4 === 8) ||
        (columnaFlechaAbajo5 === columnaInicio - 1 &&
            columnaFlechaAbajo5 === columnadesicion - 1 &&
            filaFlechaAbajo5 === 8) ||
        (columnaFlechaAbajo6 === columnaInicio - 1 &&
            columnaFlechaAbajo6 === columnadesicion - 1 &&
            filaFlechaAbajo6 === 8)
    ) {
        boolean21 = true;
    } else {
        boolean21 = false;
    }

    //final
    const indiceFin = ids.indexOf(12); // id del widget "inicio"
    const filaindiceFin = fila[indiceFin];
    const columnaindiceFin = columna[indiceFin];

    if (filaindiceFin === 9 && columnaindiceFin === columnaInicio - 1) {
        boolean22 = true;
    } else {
        boolean22 = false;
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
        boolean22,
    ];
};

export const verificarResultadoEjercicio4 = (
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

    //widget inicio
    const indiceInicio = ids.indexOf(1); // id del widget "inicio"
    const filaInicio = fila[indiceInicio];
    const columnaInicio = columna[indiceInicio];

    if (filaInicio === 0) {
        boolean1 = true;
    } else {
        boolean1 = false;
    }

    //flecha hacia abajo
    //flecha abajo
    const indiceLineaAbajo1 = ids.indexOf(7); // id del widget "linea abajo"
    const filaLineaAbajo1 = fila[indiceLineaAbajo1];
    const columnaLineaAbajo1 = columna[indiceLineaAbajo1];
    const indiceLineaAbajo2 = ids.indexOf(8); // id del widget "linea abajo"
    const filaLineaAbajo2 = fila[indiceLineaAbajo2];
    const columnaLineaAbajo2 = columna[indiceLineaAbajo2];
    const indiceLineaAbajo3 = ids.indexOf(9); // id del widget "linea abajo"
    const filaLineaAbajo3 = fila[indiceLineaAbajo3];
    const columnaLineaAbajo3 = columna[indiceLineaAbajo3];
    const indiceLineaAbajo4 = ids.indexOf(10); // id del widget "linea abajo"
    const filaLineaAbajo4 = fila[indiceLineaAbajo4];
    const columnaLineaAbajo4 = columna[indiceLineaAbajo4];
    const indiceLineaAbajo5 = ids.indexOf(11); // id del widget "linea abajo"
    const filaLineaAbajo5 = fila[indiceLineaAbajo5];
    const columnaLineaAbajo5 = columna[indiceLineaAbajo5];

    if (
        (columnaLineaAbajo1 === columnaInicio && filaLineaAbajo1 === 1) ||
        (columnaLineaAbajo2 === columnaInicio && filaLineaAbajo2 === 1) ||
        (columnaLineaAbajo3 === columnaInicio && filaLineaAbajo3 === 1) ||
        (columnaLineaAbajo4 === columnaInicio && filaLineaAbajo4 === 1) ||
        (columnaLineaAbajo5 === columnaInicio && filaLineaAbajo5 === 1)
    ) {
        boolean2 = true; /* la linea abajo es correcta */
    } else {
        boolean2 = false;
    }

    //inicio de variables
    //widget inicio
    const InicioVariables = ids.indexOf(4); // inicio de variables
    const filaInicioVariables = fila[InicioVariables];
    const columnaInicioVariables = columna[InicioVariables];

    if (filaInicioVariables === 2 && columnaInicioVariables === columnaInicio) {
        boolean3 = true;
    } else {
        boolean3 = false;
    }

    //flecha hacia abajo
    // flecha abajo
    const indiceAbajo1 = ids.indexOf(7); // id del widget "línea abajo"
    const filaAbajo1 = fila[indiceAbajo1];
    const colAbajo1 = columna[indiceAbajo1];

    const indiceAbajo2 = ids.indexOf(8); // id del widget "línea abajo"
    const filaAbajo2 = fila[indiceAbajo2];
    const colAbajo2 = columna[indiceAbajo2];

    const indiceAbajo3 = ids.indexOf(9); // id del widget "línea abajo"
    const filaAbajo3 = fila[indiceAbajo3];
    const colAbajo3 = columna[indiceAbajo3];

    const indiceAbajo4 = ids.indexOf(10); // id del widget "línea abajo"
    const filaAbajo4 = fila[indiceAbajo4];
    const colAbajo4 = columna[indiceAbajo4];

    const indiceAbajo5 = ids.indexOf(11); // id del widget "línea abajo"
    const filaAbajo5 = fila[indiceAbajo5];
    const colAbajo5 = columna[indiceAbajo5];

    if (
        (colAbajo1 === columnaInicio && filaAbajo1 === 3) ||
        (colAbajo2 === columnaInicio && filaAbajo2 === 3) ||
        (colAbajo3 === columnaInicio && filaAbajo3 === 3) ||
        (colAbajo4 === columnaInicio && filaAbajo4 === 3) ||
        (colAbajo5 === columnaInicio && filaAbajo5 === 3)
    ) {
        boolean4 = true; /* la línea abajo es correcta */
    } else {
        boolean4 = false;
    }

    //leer base y altura
    const LeerBaseAltura = ids.indexOf(6);
    const filaLeerBaseAltura = fila[LeerBaseAltura];
    const columnaLeerBaseAltura = columna[LeerBaseAltura];

    if (filaLeerBaseAltura === 4 && columnaLeerBaseAltura === columnaInicio) {
        boolean5 = true;
    } else {
        boolean5 = false;
    }

    //flecha hacia abajo
    // flecha abajo
    const indiceFlechaAbajo1 = ids.indexOf(7); // id del widget "flecha abajo"
    const filaFlechaAbajo1 = fila[indiceFlechaAbajo1];
    const columnaFlechaAbajo1 = columna[indiceFlechaAbajo1];

    const indiceFlechaAbajo2 = ids.indexOf(8); // id del widget "flecha abajo"
    const filaFlechaAbajo2 = fila[indiceFlechaAbajo2];
    const columnaFlechaAbajo2 = columna[indiceFlechaAbajo2];

    const indiceFlechaAbajo3 = ids.indexOf(9); // id del widget "flecha abajo"
    const filaFlechaAbajo3 = fila[indiceFlechaAbajo3];
    const columnaFlechaAbajo3 = columna[indiceFlechaAbajo3];

    const indiceFlechaAbajo4 = ids.indexOf(10); // id del widget "flecha abajo"
    const filaFlechaAbajo4 = fila[indiceFlechaAbajo4];
    const columnaFlechaAbajo4 = columna[indiceFlechaAbajo4];

    const indiceFlechaAbajo5 = ids.indexOf(11); // id del widget "flecha abajo"
    const filaFlechaAbajo5 = fila[indiceFlechaAbajo5];
    const columnaFlechaAbajo5 = columna[indiceFlechaAbajo5];

    if (
        (columnaFlechaAbajo1 === columnaInicio && filaFlechaAbajo1 === 5) ||
        (columnaFlechaAbajo2 === columnaInicio && filaFlechaAbajo2 === 5) ||
        (columnaFlechaAbajo3 === columnaInicio && filaFlechaAbajo3 === 5) ||
        (columnaFlechaAbajo4 === columnaInicio && filaFlechaAbajo4 === 5) ||
        (columnaFlechaAbajo5 === columnaInicio && filaFlechaAbajo5 === 5)
    ) {
        boolean6 = true; /* la flecha abajo es correcta */
    } else {
        boolean6 = false;
    }

    //calcular area
    const CalcularArea = ids.indexOf(5);
    const filaCalcularArea = fila[CalcularArea];
    const columnaCalcularArea = columna[CalcularArea];

    if (filaCalcularArea === 6 && columnaCalcularArea === columnaInicio) {
        boolean7 = true;
    } else {
        boolean7 = false;
    }

    //flecha hacia abajo
    // flecha abajo
    const flechaAbajoIndice1 = ids.indexOf(7); // id del widget "flecha abajo"
    const flechaAbajoFila1 = fila[flechaAbajoIndice1];
    const flechaAbajoCol1 = columna[flechaAbajoIndice1];

    const flechaAbajoIndice2 = ids.indexOf(8); // id del widget "flecha abajo"
    const flechaAbajoFila2 = fila[flechaAbajoIndice2];
    const flechaAbajoCol2 = columna[flechaAbajoIndice2];

    const flechaAbajoIndice3 = ids.indexOf(9); // id del widget "flecha abajo"
    const flechaAbajoFila3 = fila[flechaAbajoIndice3];
    const flechaAbajoCol3 = columna[flechaAbajoIndice3];

    const flechaAbajoIndice4 = ids.indexOf(10); // id del widget "flecha abajo"
    const flechaAbajoFila4 = fila[flechaAbajoIndice4];
    const flechaAbajoCol4 = columna[flechaAbajoIndice4];

    const flechaAbajoIndice5 = ids.indexOf(11); // id del widget "flecha abajo"
    const flechaAbajoFila5 = fila[flechaAbajoIndice5];
    const flechaAbajoCol5 = columna[flechaAbajoIndice5];

    if (
        (flechaAbajoCol1 === columnaInicio && flechaAbajoFila1 === 7) ||
        (flechaAbajoCol2 === columnaInicio && flechaAbajoFila2 === 7) ||
        (flechaAbajoCol3 === columnaInicio && flechaAbajoFila3 === 7) ||
        (flechaAbajoCol4 === columnaInicio && flechaAbajoFila4 === 7) ||
        (flechaAbajoCol5 === columnaInicio && flechaAbajoFila5 === 7)
    ) {
        boolean8 = true; /* la flecha abajo es correcta */
    } else {
        boolean8 = false;
    }

    //calcular area
    const MostrarArea = ids.indexOf(3);
    const filaMostrarArea = fila[MostrarArea];
    const columnaMostrarArea = columna[MostrarArea];

    if (filaMostrarArea === 8 && columnaMostrarArea === columnaInicio) {
        boolean9 = true;
    } else {
        boolean9 = false;
    }

    //flecha hacia abajo
    // flecha abajo
    const faIndice1 = ids.indexOf(7); // id del widget "flecha abajo"
    const faFila1 = fila[faIndice1];
    const faCol1 = columna[faIndice1];

    const faIndice2 = ids.indexOf(8); // id del widget "flecha abajo"
    const faFila2 = fila[faIndice2];
    const faCol2 = columna[faIndice2];

    const faIndice3 = ids.indexOf(9); // id del widget "flecha abajo"
    const faFila3 = fila[faIndice3];
    const faCol3 = columna[faIndice3];

    const faIndice4 = ids.indexOf(10); // id del widget "flecha abajo"
    const faFila4 = fila[faIndice4];
    const faCol4 = columna[faIndice4];

    const faIndice5 = ids.indexOf(11); // id del widget "flecha abajo"
    const faFila5 = fila[faIndice5];
    const faCol5 = columna[faIndice5];

    if (
        (faCol1 === columnaInicio && faFila1 === 9) ||
        (faCol2 === columnaInicio && faFila2 === 9) ||
        (faCol3 === columnaInicio && faFila3 === 9) ||
        (faCol4 === columnaInicio && faFila4 === 9) ||
        (faCol5 === columnaInicio && faFila5 === 9)
    ) {
        boolean10 = true; /* la flecha abajo es correcta */
    } else {
        boolean10 = false;
    }

    //final
    const indiceFin = ids.indexOf(2);
    const filaindiceFin = fila[indiceFin];
    const columnaindiceFin = columna[indiceFin];
    if (filaindiceFin === 10 && columnaindiceFin === columnaInicio) {
        boolean11 = true;
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
    ];
};

export const verificarResultadoEjercicio5 = (
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
    let boolean22: boolean = false;
    let boolean23: boolean = false;
    let boolean24: boolean = false;
    let boolean25: boolean = false;
    let boolean26: boolean = false;
    let boolean27: boolean = false;

    //widget inicio
    const indiceInicio = ids.indexOf(1); // id del widget "inicio"
    const filaInicio = fila[indiceInicio];
    const columnaInicio = columna[indiceInicio];

    if (filaInicio === 0) {
        boolean1 = true;
    } else {
        boolean1 = false;
    }

    //flecha hacia abajo
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

    if (
        (columnaLineaAbajo1 === columnaInicio && filaLineaAbajo1 === 1) ||
        (columnaLineaAbajo2 === columnaInicio && filaLineaAbajo2 === 1) ||
        (columnaLineaAbajo3 === columnaInicio && filaLineaAbajo3 === 1) ||
        (columnaLineaAbajo4 === columnaInicio && filaLineaAbajo4 === 1) ||
        (columnaLineaAbajo5 === columnaInicio && filaLineaAbajo5 === 1)
    ) {
        boolean2 = true; /* la linea abajo es correcta */
    } else {
        boolean2 = false;
    }

    //ingresar N
    const ingresarN = ids.indexOf(7); // inicio de variables
    const filaingresarN = fila[ingresarN];
    const columnaingresarN = columna[ingresarN];

    if (filaingresarN === 2 && columnaingresarN === columnaInicio) {
        boolean3 = true;
    } else {
        boolean3 = false;
    }

    //flecha de abajo 2
    // flecha hacia abajo
    // flecha abajo
    const indiceLineaAbajoUno = ids.indexOf(2); // id del widget "linea abajo"
    const filaLineaAbajoUno = fila[indiceLineaAbajoUno];
    const columnaLineaAbajoUno = columna[indiceLineaAbajoUno];

    const indiceLineaAbajoDos = ids.indexOf(3); // id del widget "linea abajo"
    const filaLineaAbajoDos = fila[indiceLineaAbajoDos];
    const columnaLineaAbajoDos = columna[indiceLineaAbajoDos];

    const indiceLineaAbajoTres = ids.indexOf(4); // id del widget "linea abajo"
    const filaLineaAbajoTres = fila[indiceLineaAbajoTres];
    const columnaLineaAbajoTres = columna[indiceLineaAbajoTres];

    const indiceLineaAbajoCuatro = ids.indexOf(5); // id del widget "linea abajo"
    const filaLineaAbajoCuatro = fila[indiceLineaAbajoCuatro];
    const columnaLineaAbajoCuatro = columna[indiceLineaAbajoCuatro];

    const indiceLineaAbajoCinco = ids.indexOf(6); // id del widget "linea abajo"
    const filaLineaAbajoCinco = fila[indiceLineaAbajoCinco];
    const columnaLineaAbajoCinco = columna[indiceLineaAbajoCinco];

    if (
        (columnaLineaAbajoUno === columnaInicio && filaLineaAbajoUno === 3) ||
        (columnaLineaAbajoDos === columnaInicio && filaLineaAbajoDos === 3) ||
        (columnaLineaAbajoTres === columnaInicio && filaLineaAbajoTres === 3) ||
        (columnaLineaAbajoCuatro === columnaInicio &&
            filaLineaAbajoCuatro === 3) ||
        (columnaLineaAbajoCinco === columnaInicio && filaLineaAbajoCinco === 3)
    ) {
        boolean4 = true; /* la linea abajo es correcta */
    } else {
        boolean4 = false;
    }

    //ingresar N
    const Descicion1 = ids.indexOf(8); // inicio de variables
    const filaDescicion1 = fila[Descicion1];
    const columnaDescicion1 = columna[Descicion1];

    if (filaDescicion1 === 4 && columnaDescicion1 === columnaInicio) {
        boolean5 = true;
    } else {
        boolean5 = false;
    }

    //Diagonal 1
    const esquina1 = ids.indexOf(19);
    const filaEsquina1 = fila[esquina1];
    const columnaEsquina1 = columna[esquina1];
    if (
        filaEsquina1 === 4 &&
        columnaEsquina1 === columnaInicio - 1 &&
        columnaEsquina1 === columnaDescicion1 - 1
    ) {
        boolean6 = true;
    } else {
        boolean6 = false;
    }

    //No es primo
    const indiceNoesPrimo1 = ids.indexOf(11); // id del widget "linea abajo"
    const filaindiceNoesPrimo1 = fila[indiceNoesPrimo1];
    const columnaindiceNoesPrimo1 = columna[indiceNoesPrimo1];

    const indiceNoesPrimo2 = ids.indexOf(12); // id del widget "linea abajo"
    const filaindiceNoesPrimo2 = fila[indiceNoesPrimo2];
    const columnaindiceNoesPrimo2 = columna[indiceNoesPrimo2];

    if (
        (columnaindiceNoesPrimo1 === columnaInicio - 1 &&
            columnaindiceNoesPrimo1 === columnaDescicion1 - 1 &&
            filaindiceNoesPrimo1 === 5) ||
        (columnaindiceNoesPrimo2 === columnaInicio - 1 &&
            columnaindiceNoesPrimo2 === columnaDescicion1 - 1 &&
            filaindiceNoesPrimo2 === 5)
    ) {
        boolean7 = true;
    } else {
        boolean7 = false;
    }

    //Antes final 1
    const antesFinal1 = ids.indexOf(25);
    const filaantesFinal1 = fila[antesFinal1];
    const columnaantesFinal1 = columna[antesFinal1];

    //Antes final 2
    const antesFinal2 = ids.indexOf(26);
    const filaantesFinal2 = fila[antesFinal2];
    const columnaantesFinal2 = columna[antesFinal2];

    //Antes final 3
    const antesFinal3 = ids.indexOf(27);
    const filaantesFinal3 = fila[antesFinal3];
    const columnaantesFinal3 = columna[antesFinal3];

    if (
        (columnaantesFinal1 === columnaInicio - 1 &&
            columnaantesFinal1 === columnaDescicion1 - 1 &&
            filaantesFinal1 === 6) ||
        (columnaantesFinal2 === columnaInicio - 1 &&
            columnaantesFinal2 === columnaDescicion1 - 1 &&
            filaantesFinal2 === 6) ||
        (columnaantesFinal3 === columnaInicio - 1 &&
            columnaantesFinal3 === columnaDescicion1 - 1 &&
            filaantesFinal3 === 6)
    ) {
        boolean8 = true;
    } else {
        boolean8 = false;
    }

    //fin 1
    const fin1 = ids.indexOf(16);
    const filafin1 = fila[fin1];
    const columnafin1 = columna[fin1];

    if (
        columnafin1 === columnaInicio - 2 &&
        columnafin1 === columnaDescicion1 - 2 &&
        filafin1 === 6
    ) {
        boolean9 = true;
    } else {
        boolean9 = false;
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
        boolean22,
        boolean23,
        boolean24,
        boolean25,
        boolean26,
        boolean27,
    ];
};
