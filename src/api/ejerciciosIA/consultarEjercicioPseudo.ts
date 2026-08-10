import { GoogleGenAI } from '@google/genai';
const apikeyGemini = import.meta.env.VITE_GEMINI_API_KEY;

const ai = new GoogleGenAI({
    apiKey: apikeyGemini,
});

export async function consultarEjercicio() {
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

    const prompt = `
Genera UN SOLO ejercicio corto y diferente para resolver mediante pseudocódigo.

El ejercicio debe estar relacionado con ${temaRandom}.

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
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        return response.text?.trim();
    } catch (error) {
        console.error('Error generando ejercicio:', error);
        throw error;
    }
}
