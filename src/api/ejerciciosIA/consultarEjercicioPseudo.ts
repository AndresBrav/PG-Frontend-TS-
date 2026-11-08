import { GoogleGenAI } from '@google/genai';
import { getGeminiApiKey } from './getGeminiApiKey';

export async function consultarEjercicioPseudo(
    claveAcceso?: string,
    temarioNombre?: string | null,
) {
    const apikeyGemini = await getGeminiApiKey(claveAcceso);
    const ai = new GoogleGenAI({
        apiKey: apikeyGemini,
    });

    const temas = [
        'videojuegos',
        'supermercado',
        'deportes',
        'mascotas',
        'cine',
        'restaurante',
        'biblioteca',
        'escuela',
        'hospital',
        'transporte',
        'música',
        'tecnología',
        'cafetería',
        'viajes',
        'tienda de ropa',
    ];

    const temaRandom = temas[Math.floor(Math.random() * temas.length)];

    // Foco por temario: cuando el usuario ya está trabajando un temario,
    // el prompt exige que el ejercicio practique SOLO esas estructuras.
    const focosTemario: Record<string, string> = {
        Variables: `El ejercicio DEBE practicar únicamente: Estructura secuencial (variables).
- uso de Definir, Leer, Escribir y asignación con <- (cálculos sencillos, acumuladores de una sola pasada)
- NO debe usar Si, Según, ciclos (Mientras/Repetir/Para) ni arreglos ni funciones
- ejemplos del estilo: "lea dos números y muestre su suma", "lea el precio de un producto y calcule el IVA del 13% y el total"`,
        Condicionales: `El ejercicio DEBE practicar únicamente: Estructuras selectivas.
- debe requerir al menos una decisión con Si...SiNo o Según...Hacer con De Otro Modo
- NO debe usar ciclos (Mientras/Repetir/Para), arreglos ni funciones
- ejemplos del estilo: "lea una nota y diga si está aprobada (>= 51) o no", "lea un número del 1 al 7 y muestre el día de la semana"`,
        'Decisiones Anidada': `El ejercicio DEBE practicar únicamente: decisiones anidadas.
- debe requerir un Si dentro de Si o un Si dentro de SiNo (evaluar dos criterios combinados paso a paso)
- NO debe usar ciclos, arreglos ni funciones
- ejemplos del estilo: "lea edad y si aprobó su examen, y diga si puede obtener licencia de conducir", "lea edad y altura, y diga si puede subirse a la atracción"`,
        Repetitivas: `El ejercicio DEBE practicar únicamente: estructuras repetitivas.
- debe requerir un ciclo Mientras...Hacer, Repetir...Hasta Que o Para...Hasta (con o sin Con Paso) bien definido, con contador o acumulador
- NO debe usar arreglos, funciones ni Según con muchos casos
- ejemplos del estilo: "lea números hasta ingresar 0 y muestre cuántos fueron pares", "lea 15 edades y muestre cuántos son mayores de edad", "muestre la tabla de multiplicar de un número"`,
        'Funciones y SubProcesos': `El ejercicio DEBE practicar únicamente: funciones y subprocesos.
- debe requerir definir una Funcion...FinFuncion con retorno o un SubProceso...FinSubProceso, y llamarlo desde el algoritmo principal
- el cuerpo de la función debe ser sencillo (cálculos y quizá un Si interno)
- NO debe usar arreglos
- ejemplos del estilo: "lea dos números, calcule el mayor con una Funcion y muéstrelo", "lea el título de un menú e imprima un encabezado con un SubProceso"`,
        Arreglos: `El ejercicio DEBE practicar únicamente: arreglos (vectores).
- debe requerir Dimension nombre[ N ] para declarar un vector y leer o escribir elementos con nombre[i] usando un Para de 1 a N
- además puede combinar un contador o acumulador sobre los elementos
- NO debe usar funciones ni matrices (arreglos de dos dimensiones)
- ejemplos del estilo: "lea 10 números y muestre cuántos superan el promedio", "lea 5 precios y muestre el mayor y el total"`,
        Mixto: `El ejercicio DEBE COMBINAR al menos DOS estructuras de temarios diferentes.
- la combinación puede ser, por ejemplo: un ciclo (Mientras/Repetir/Para) con un Si o un SiNo dentro; una decisión anidada dentro de un ciclo; un arreglo recorrido con un ciclo que use un Si o un contador; una Funcion llamada dentro de un ciclo
- las estructuras combinadas deben ser esenciales y de nivel principiante
- ejemplos del estilo: "lea 10 notas y use una Funcion para calcular si cada nota está aprobada; al final muestre cuántas aprobaron", "lea números hasta ingresar 0 y diga si cada número es par o impar, al final muestre el total acumulado"
- exigir el uso integrado de varias estructuras, no solo una`,
    };

    const foco =
        temarioNombre && focosTemario[temarioNombre]
            ? `${focosTemario[temarioNombre]}

Este requisito prevalece sobre la lista general de "El ejercicio puede incluir" y los ejemplos de estilo de abajo.`
            : '';

    const prompt = `
Genera UN SOLO ejercicio corto y diferente para resolver mediante pseudocódigo.

El ejercicio debe estar relacionado con ${temaRandom}.

${foco}

El enunciado debe:

- empezar obligatoriamente con "Crea un algoritmo en pseudocódigo que..."
- tener una longitud similar a:
  "Crea un algoritmo en pseudocódigo que lea 10 números y muestre cuál es el mayor."
- ocupar máximo 2 o 3 líneas
- describir un único problema sencillo
- ser adecuado para principiantes
- usar lógica básica

El ejercicio puede incluir:

- condiciones simples
- cálculos sencillos
- comparaciones
- contadores
- acumuladores
- ciclos básicos (mientras, para, repetir)

Si usas ciclos:

- deben ser muy simples
- debe quedar claro cuántas veces se repite
- o cuál es la condición para terminar

No generes:

- explicaciones
- listas
- requisitos
- entradas o salidas
- soluciones
- pseudocódigo resuelto
- texto adicional
- ejercicios largos
- varios problemas en uno
- ejercicios complejos

El estilo debe parecerse a:

"Crea un algoritmo en pseudocódigo que lea 10 productos, acumule el total de ventas y cuente cuántos tienen descuento."

"Crea un algoritmo en pseudocódigo que solicite notas hasta ingresar -1, calcule el promedio y muestre cuántas fueron aprobatorias."

"Crea un algoritmo en pseudocódigo que lea 20 temperaturas y muestre cuántas superan los 30 grados."

"Crea un algoritmo en pseudocódigo que registre clientes hasta ingresar FIN y calcule el monto total de compras, aplicando descuento a quienes superen 500 Bs."

"Crea un algoritmo en pseudocódigo que lea 15 edades y muestre cuántas personas son mayores de edad y cuántas son menores."

"Crea un algoritmo en pseudocódigo que calcule el costo final del servicio en una cafetería solicitando la cantidad de consumos y aplicando un IVA del 13% si la venta total supera los 100 Bs."

Responde únicamente con el enunciado.
`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3.5-flash-lite',
            contents: prompt,
        });

        return response.text?.trim();
    } catch (error) {
        console.error('Error generando ejercicio:', error);
        throw error;
    }
}
