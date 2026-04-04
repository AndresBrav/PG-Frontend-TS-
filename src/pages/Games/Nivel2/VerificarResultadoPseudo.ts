export const verificarResultadoPseudocodigo1 = (ids: string[]): boolean[] => {
    // Inicializamos todas las banderas en false
    let boolean1: boolean = false;
    let boolean2: boolean = false;
    let boolean3: boolean = false;
    let boolean4: boolean = false;
    let boolean5: boolean = false;
    let boolean6: boolean = false;
    let boolean7: boolean = false;
    let boolean8: boolean = false;
    let boolean9: boolean = false;

    // Validación del orden

    if (ids[0] === '1') boolean1 = true; // Proceso SumarDosNumeros
    if (ids[1] === '2') boolean2 = true; // Definir num1, num2, resultado Como Entero

    // Lectura de los números (aceptamos ambos órdenes coherentes)
    // Orden normal: primer num1, luego num2
    if (ids[2] === '3') {
        // Escribir "Ingrese el primer número"
        boolean3 = true;

        if (ids[3] === '4') {
            // Leer num1
            boolean4 = true;

            if (ids[4] === '5') {
                // Escribir "Ingrese el segundo número"
                boolean5 = true;

                if (ids[5] === '6') {
                    // Leer num2
                    boolean6 = true;
                }
            }
        }
    }
    // Orden alternativo: primer num2, luego num1
    else if (ids[2] === '5') {
        // Escribir "Ingrese el segundo número"
        boolean3 = true;

        if (ids[3] === '6') {
            // Leer num2
            boolean4 = true;

            if (ids[4] === '3') {
                // Escribir "Ingrese el primer número"
                boolean5 = true;

                if (ids[5] === '4') {
                    // Leer num1
                    boolean6 = true;
                }
            }
        }
    }

    // Operación y salida (orden fijo)
    if (ids[6] === '7') boolean7 = true; // resultado <- num1 + num2
    if (ids[7] === '8') boolean8 = true; // Escribir resultado
    if (ids[8] === '9') boolean9 = true; // FinProceso

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
    ];
};

export const verificarResultadoPseudocodigo2 = (ids: string[]): boolean[] => {
    // Inicializamos todas las banderas en false
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

    // Validación del orden

    if (ids[0] === '1') boolean1 = true; // Proceso MayorDeDosNumeros
    if (ids[1] === '2') boolean2 = true; // Definir num1, num2 Como Entero

    // === PARTE CRÍTICA: Lectura de números ===
    // Solo aceptamos dos combinaciones coherentes:

    if (ids[2] === '3') {
        //Escribir num1
        boolean3 = true;

        if (ids[3] === '4') {
            //Leer num1
            boolean4 = true;

            if (ids[4] === '5') {
                //Escribir num2
                boolean5 = true;

                if (ids[5] === '6') {
                    //Leer num2
                    boolean6 = true;
                }
            }
        }
    } else if (ids[2] === '5') {
        //Escribir num2
        boolean3 = true;
        if (ids[3] === '6') {
            //Leer num2
            boolean4 = true;
            if (ids[4] === '3') {
                //Escribir num1
                boolean5 = true;
                if (ids[5] === '4') {
                    //Leer num1
                    boolean6 = true;
                }
            }
        }
    }

    // Estructura condicional (se mantiene fija)
    if (ids[6] === '7') boolean7 = true; // Si num1 > 0 Y num2 > 0 Entonces
    if (ids[7] === '8') boolean8 = true; //     Si num1 > num2 Entonces
    if (ids[8] === '9') boolean9 = true; //         Escribir num1, " Es mayor"
    if (ids[9] === '10') boolean10 = true; //     SiNo
    if (ids[10] === '11') boolean11 = true; //         Escribir num2, " Es mayor"
    if (ids[11] === '12') boolean12 = true; //     Fin Si
    if (ids[12] === '13') boolean13 = true; // SiNo
    if (ids[13] === '14') boolean14 = true; //     Escribir "Ingresa numeros positivos"
    if (ids[14] === '15') boolean15 = true; //   Fin Si
    if (ids[15] === '16') boolean16 = true; // FinProceso

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

export const verificarResultadoPseudocodigo3 = (ids: string[]): boolean[] => {
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

    if (ids[0] === '1') boolean1 = true;
    if (ids[1] === '2') boolean2 = true;
    if (ids[2] === '3') boolean3 = true;
    if (ids[3] === '4') boolean4 = true;
    if (ids[4] === '5') boolean5 = true;
    if (ids[5] === '6') boolean6 = true;
    if (ids[6] === '7') boolean7 = true;
    if (ids[7] === '8') boolean8 = true;
    if (ids[8] === '9') boolean9 = true;
    if (ids[9] === '10') boolean10 = true;
    if (ids[10] === '11') boolean11 = true;
    if (ids[11] === '12') boolean12 = true;
    if (ids[12] === '13') boolean13 = true;
    if (ids[13] === '14') boolean14 = true;

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
    ];
};

// export const verificarResultadoPseudocodigo4 = (ids: string[]): boolean[] => {
//     let boolean1: boolean = false;
//     let boolean2: boolean = false;
//     let boolean3: boolean = false;
//     let boolean4: boolean = false;
//     let boolean5: boolean = false;
//     let boolean6: boolean = false;
//     let boolean7: boolean = false;
//     let boolean8: boolean = false;
//     let boolean9: boolean = false;
//     let boolean10: boolean = false;
//     let boolean11: boolean = false;
//     let boolean12: boolean = false;

//     if (ids[0] === '1') boolean1 = true;
//     if (ids[1] === '2') boolean2 = true;
//     if (ids[2] === '3') boolean3 = true;
//     if (ids[3] === '4') boolean4 = true;
//     if (ids[4] === '5') boolean5 = true;
//     if (ids[5] === '6') boolean6 = true;
//     if (ids[6] === '7') boolean7 = true;
//     if (ids[7] === '8') boolean8 = true;
//     if (ids[8] === '9') boolean9 = true;
//     if (ids[9] === '10') boolean10 = true;
//     if (ids[10] === '11') boolean11 = true;
//     if (ids[11] === '12') boolean12 = true;

//     return [
//         boolean1,
//         boolean2,
//         boolean3,
//         boolean4,
//         boolean5,
//         boolean6,
//         boolean7,
//         boolean8,
//         boolean9,
//         boolean10,
//         boolean11,
//         boolean12,
//     ];
// };

export const verificarResultadoPseudocodigo4 = (ids: string[]): boolean[] => {
    // Inicializamos todas las banderas en false
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

    // Validación del orden

    if (ids[0] === '1') boolean1 = true; // Proceso SumarDiezNumeros
    if (ids[1] === '2') boolean2 = true; // Definir numero, suma, contador Como Entero

    // Inicialización de suma y contador (aceptamos ambos órdenes)
    if (ids[2] === '3' && ids[3] === '4') {
        boolean3 = true; // suma <- 0
        boolean4 = true; // contador <- 1
    } else if (ids[2] === '4' && ids[3] === '3') {
        boolean3 = true; // suma <- 0
        boolean4 = true; // contador <- 1
    }

    // Estructura del ciclo Mientras
    if (ids[4] === '5') boolean5 = true; // Mientras contador <= 10 Hacer

    // Cuerpo del ciclo (debe estar justo después del Mientras)
    if (ids[5] === '6') boolean6 = true; // Escribir "Ingrese un numero:"
    if (ids[6] === '7') boolean7 = true; // Leer numero

    if (ids[7] === '8') {
        boolean8 = true;
        if (ids[8] === '9') boolean9 = true; // contador <- contador + 1
    } // suma <- suma + numero
    else if (ids[7] === '9') {
        boolean8 = true;
        if (ids[8] === '8') boolean9 = true; // suma <- suma + numero
    }

    if (ids[9] === '10') boolean10 = true; // FinMientras

    // Salida final
    if (ids[10] === '11') boolean11 = true; // Escribir "La suma total es: ", suma

    if (ids[11] === '12') boolean12 = true; // FinProceso

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
    ];
};

export const verificarResultadoPseudocodigo5 = (ids: string[]): boolean[] => {
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

    if (ids[0] === '1') boolean1 = true;
    if (ids[1] === '2') boolean2 = true;
    if (ids[2] === '3' || ids[2] === '4') boolean3 = true;
    if (ids[3] === '4' || ids[3] === '5') boolean4 = true;
    if (ids[4] === '5' || ids[4] === '3') boolean5 = true;
    if (ids[5] === '6') boolean6 = true;
    if (ids[6] === '7') boolean7 = true;
    if (ids[7] === '8') boolean8 = true;
    if (ids[8] === '9') boolean9 = true;
    if (ids[9] === '10') boolean10 = true;
    if (ids[10] === '11') boolean11 = true;
    if (ids[11] === '12') boolean12 = true;

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
    ];
};

export const verificarResultadoPseudocodigo6 = (ids: string[]): boolean[] => {
    // Inicializamos todas las banderas en false
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

    // Validación flexible del orden correcto (similar a tu Ejercicio 5)

    if (ids[0] === '1') boolean1 = true; // Proceso ContarParesImpares

    // Definiciones (pueden estar en orden variable al inicio)
    if (ids[1] === '2') boolean2 = true; // Definir numero, contador, pares, impares Como Entero

    // Inicializaciones (orden aproximado aceptable)
    if (ids[2] === '3' || ids[2] === '4' || ids[2] === '5') boolean3 = true; // contador <- 0
    if (ids[3] === '4' || ids[3] === '5' || ids[3] === '3') boolean4 = true; // pares <- 0
    if (ids[4] === '5' || ids[4] === '3' || ids[4] === '4') boolean5 = true; // impares <- 0

    // Estructura del Mientras
    if (ids[5] === '6') boolean6 = true; // Mientras contador < 5 Hacer

    // Cuerpo del ciclo
    if (ids[6] === '7') boolean7 = true; // Escribir "Ingrese un numero:"
    if (ids[7] === '8') boolean8 = true; // Leer numero

    // Estructura Si ... SiNo
    if (ids[8] === '9') boolean9 = true; // Si numero % 2 = 0 Entonces
    if (ids[9] === '10') boolean10 = true; // pares <- pares + 1
    if (ids[10] === '11') boolean11 = true; // SiNo
    if (ids[11] === '12') boolean12 = true; // impares <- impares + 1
    if (ids[12] === '13') boolean13 = true; // FinSi

    // Incremento del contador
    if (ids[13] === '14') boolean14 = true; // contador <- contador + 1

    // Cierre del Mientras
    if (ids[14] === '15') boolean15 = true; // FinMientras

    // Salidas finales
    if (ids[15] === '16') boolean16 = true; // Escribir "Cantidad de pares: ", pares
    if (ids[16] === '17') boolean17 = true; // Escribir "Cantidad de impares: ", impares
    if (ids[17] === '18') boolean18 = true; // FinProceso

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
    ];
};

export const verificarResultadoPseudocodigo7 = (ids: string[]): boolean[] => {
    let b1 = false,
        b2 = false,
        b3 = false,
        b4 = false,
        b5 = false;
    let b6 = false,
        b7 = false,
        b8 = false,
        b9 = false,
        b10 = false;
    let b11 = false,
        b12 = false,
        b13 = false;
    let b14 = false;

    if (ids[0] === '1') b1 = true; // Proceso TablaDeMultiplicar
    if (ids[1] === '2') b2 = true; // Definir numero, i Como Entero
    if (ids[2] === '3') b3 = true; // Escribir "Ingrese un número...
    if (ids[3] === '4') b4 = true; // Leer numero
    if (ids[4] === '5') b5 = true; // Mientras numero < 1 O numero > 10 Hacer
    if (ids[5] === '6') b6 = true; // Escribir "Error: ...
    if (ids[6] === '7') b7 = true; // Leer numero
    if (ids[7] === '8') b8 = true; // FinMientras
    if (ids[8] === '9') b9 = true; // Escribir ""
    if (ids[9] === '10') b10 = true; // Escribir "Tabla del ", numero, ":"
    if (ids[10] === '11') b11 = true; // Para i <- 1 Hasta 10 Hacer
    if (ids[11] === '12') b12 = true; // Escribir numero, " x ", i, " = ", numero * i
    if (ids[12] === '13') b13 = true; // FinPara
    if (ids[13] === '14') b14 = true; // FinProceso
    // FinProceso se valida por la cantidad de líneas

    return [b1, b2, b3, b4, b5, b6, b7, b8, b9, b10, b11, b12, b13, b14];
};

export const verificarResultadoPseudocodigo8 = (ids: string[]): boolean[] => {
    // Inicializamos todas las banderas en false
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

    // Validación del orden

    if (ids[0] === '1') boolean1 = true; // Proceso SumaParesImpares
    if (ids[1] === '2') boolean2 = true; // Definir i, N, sumaPares, sumaImpares Como Entero

    // Inicialización de sumas (aceptamos ambos órdenes)
    if (ids[2] === '3') {
        boolean3 = true; // sumaPares <- 0
        if (ids[3] === '4') boolean4 = true; // sumaImpares <- 0
    } else if (ids[2] === '4') {
        boolean4 = true; // sumaImpares <- 0
        if (ids[3] === '3') boolean3 = true; // sumaPares <- 0
    }

    if (ids[4] === '5') boolean5 = true; // Escribir "Ingrese un numero:"
    if (ids[5] === '6') boolean6 = true; // Leer N
    if (ids[6] === '7') boolean7 = true; // Para i <- 1 Hasta N Hacer

    // Estructura condicional dentro del Para
    if (ids[7] === '8') boolean8 = true; // Si i MOD 2 = 0 Entonces

    if (ids[8] === '9') boolean9 = true; // sumaPares <- sumaPares + i
    if (ids[9] === '10') boolean10 = true; // SiNo
    if (ids[10] === '11') boolean11 = true; // sumaImpares <- sumaImpares + i

    if (ids[11] === '12') boolean12 = true; // FinSi
    if (ids[12] === '13') boolean13 = true; // FinPara

    // Salidas finales (aceptamos ambos órdenes)
    if (ids[13] === '14') {
        boolean14 = true; // Escribir "Suma de pares: ", sumaPares
        if (ids[14] === '15') boolean15 = true; // Escribir "Suma de impares: ", sumaImpares
    } else if (ids[13] === '15') {
        boolean15 = true; // Escribir "Suma de impares: ", sumaImpares
        if (ids[14] === '14') boolean14 = true; // Escribir "Suma de pares: ", sumaPares
    }

    if (ids[15] === '16') boolean16 = true; // FinProceso

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

// export const verificarResultadoPseudocodigo9 = (ids: string[]): boolean[] => {
//     let b1 = false,
//         b2 = false,
//         b3 = false,
//         b4 = false,
//         b5 = false;
//     let b6 = false,
//         b7 = false,
//         b8 = false,
//         b9 = false,
//         b10 = false;
//     let b11 = false,
//         b12 = false,
//         b13 = false;

//     if (ids[0] === '1') b1 = true; // Proceso ArregloBasico
//     if (ids[1] === '2') b2 = true; // Definir numeros Como Entero
//     if (ids[2] === '3') b3 = true; // Dimension numeros[5]
//     if (ids[3] === '4') b4 = true; // Definir i Como Entero
//     if (ids[4] === '5') b5 = true; // Para i <- 1 Hasta 5 Hacer (llenar)
//     if (ids[5] === '6') b6 = true; // Escribir "Ingrese un numero...
//     if (ids[6] === '7') b7 = true; // Leer numeros[i]
//     if (ids[7] === '8') b8 = true; // FinPara (del llenado)
//     if (ids[8] === '9') b9 = true; // Escribir "Los numeros ingresados son:"
//     if (ids[9] === '10') b10 = true; // Para i <- 1 Hasta 5 Hacer (mostrar)
//     if (ids[10] === '11') b11 = true; // Escribir numeros[i]
//     if (ids[11] === '12') b12 = true; // FinPara (del mostrar)
//     if (ids[12] === '13') b13 = true; // FinProceso

//     return [b1, b2, b3, b4, b5, b6, b7, b8, b9, b10, b11, b12, b13];
// };

export const verificarResultadoPseudocodigo9 = (ids: string[]): boolean[] => {
    // Inicializamos todas las banderas en false
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

    // Validación del orden

    if (ids[0] === '1') boolean1 = true; // Proceso ArregloBasico

    // Definiciones (Definir numeros + Dimension + Definir i)
    if (ids[1] === '2') {
        boolean2 = true; // Definir numeros Como Entero
        if (ids[2] === '3') {
            boolean3 = true; // Dimension numeros[5]
            if (ids[3] === '4') boolean4 = true; // Definir i Como Entero
        }
    } else if (ids[1] === '4') {
        boolean4 = true; // Definir i Como Entero
        if (ids[2] === '2') {
            boolean2 = true; // Definir numeros Como Entero
            if (ids[3] === '3') boolean3 = true; // Dimension numeros[5]
        }
    }

    // Primer Para: Llenado del arreglo
    if (ids[4] === '5') boolean5 = true; // Para i <- 1 Hasta 5 Hacer (llenar)

    if (ids[5] === '6') boolean6 = true; // Escribir "Ingrese un numero en la posicion ", i, ":"
    if (ids[6] === '7') boolean7 = true; // Leer numeros[i]

    if (ids[7] === '8') boolean8 = true; // FinPara (del llenado)

    // Mensaje antes de mostrar
    if (ids[8] === '9') boolean9 = true; // Escribir "Los numeros ingresados son:"

    // Segundo Para: Mostrar el arreglo
    if (ids[9] === '10') boolean10 = true; // Para i <- 1 Hasta 5 Hacer (mostrar)

    if (ids[10] === '11') boolean11 = true; // Escribir numeros[i]

    if (ids[11] === '12') boolean12 = true; // FinPara (del mostrar)

    if (ids[12] === '13') boolean13 = true; // FinProceso

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
    ];
};

export const verificarResultadoPseudocodigo10 = (ids: string[]): boolean[] => {
    // Inicializamos todas las banderas en false
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

    // Validación del orden

    if (ids[0] === '1') boolean1 = true; // Proceso NumeroMayor

    // Definiciones (Definir numeros + Dimension + Definir i, mayor)
    if (ids[1] === '2') {
        boolean2 = true; // Definir numeros Como Entero
        if (ids[2] === '3') {
            boolean3 = true; // Dimension numeros[5]
            if (ids[3] === '4') boolean4 = true; // Definir i, mayor Como Entero
        }
    } else if (ids[1] === '4') {
        boolean4 = true; // Definir i, mayor Como Entero
        if (ids[2] === '2') {
            boolean2 = true; // Definir numeros Como Entero
            if (ids[3] === '3') boolean3 = true; // Dimension numeros[5]
        }
    }

    // Primer Para: Llenado del arreglo
    if (ids[4] === '5') boolean5 = true; // Para i <- 1 Hasta 5 Hacer (llenar)

    if (ids[5] === '6') boolean6 = true; // Escribir "Ingrese un numero ", i, ":"
    if (ids[6] === '7') boolean7 = true; // Leer numeros[i]

    if (ids[7] === '8') boolean8 = true; // FinPara (llenado)

    // Inicializar mayor con el primer elemento
    if (ids[8] === '9') boolean9 = true; // mayor <- numeros[1]

    // Segundo Para: Buscar el número mayor
    if (ids[9] === '10') boolean10 = true; // Para i <- 2 Hasta 5 Hacer (buscar mayor)

    if (ids[10] === '11') boolean11 = true; // Si numeros[i] > mayor Entonces
    if (ids[11] === '12') boolean12 = true; // mayor <- numeros[i]
    if (ids[12] === '13') boolean13 = true; // FinSi

    if (ids[13] === '14') boolean14 = true; // FinPara (buscar mayor)

    // Salida final
    if (ids[14] === '15') boolean15 = true; // Escribir "El numero mayor es: ", mayor

    if (ids[15] === '16') boolean16 = true; // FinProceso

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
