export async function verificarDiagrama(jsonDiagrama: any, ejercicio: string) {
    const diagramaReducido = {
        nodes: jsonDiagrama.nodes.map((n: any) => ({
            id: n.id,
            type: n.type,
            label: n.data?.label || '',
        })),

        edges: jsonDiagrama.edges.map((e: any) => ({
            source: e.source,
            target: e.target,
            label: e.label || '',
        })),
    };

    console.log('Diagrama reducido para IA:', diagramaReducido);

    console.log(
        'Ejercicio para IA en format texto:',
        JSON.stringify(diagramaReducido)
    );

    const diagramaTexto = JSON.stringify(diagramaReducido);

    const prompt = `
Eres un profesor experto en algoritmos y diagramas de flujo.

Tu tarea es verificar si el flujo lógico del diagrama cumple correctamente el ejercicio.

REGLAS IMPORTANTES:
- Analiza SOLO la lógica.
- Ignora posiciones x/y.
- Ignora diseño visual.
- Ignora estética.
- Analiza únicamente nodos y conexiones.
- No inventes errores inexistentes.
- Si la lógica cumple el ejercicio, responde que es correcto.

Debes verificar:
- inicio y fin correctos
- ciclos
- decisiones
- variables
- acumuladores
- contadores
- secuencia lógica

La respuesta debe:
- ser MUY corta
- máximo 3 oraciones
- sonar como un profesor experto
- indicar si es correcto o incorrecto
- mencionar solo el error más importante si existe

IMPORTANTE:
- Si el diagrama cumple el ejercicio, debes incluir obligatoriamente la palabra "correcto".
- Si el diagrama no cumple el ejercicio, debes incluir obligatoriamente la palabra "incorrecto".
- Nunca uses palabras ambiguas como "aceptable", "válido", "adecuado" o "cumple parcialmente" sin indicar además si es correcto o incorrecto.
- No respondas únicamente con "sí" o "no".
- La primera oración debe indicar claramente si el diagrama es correcto o incorrecto.

Ejemplos válidos:

"El diagrama es correcto y la lógica del ciclo está bien implementada."

"El diagrama es correcto porque cumple completamente el ejercicio."

"El diagrama es incorrecto porque el contador nunca se incrementa."

"El diagrama es incorrecto porque la condición de salida del ciclo no permite finalizar correctamente."

Ejercicio:
${ejercicio}

Diagrama:
${diagramaTexto}
`;

    try {
        const response = await fetch(`${import.meta.env.VITE_MISTRAL_LINK}`, {
            method: 'POST',

            headers: {
                Authorization: `Bearer ${import.meta.env.VITE_MISTRAL_API_KEY}`,
                'Content-Type': 'application/json',
            },

            body: JSON.stringify({
                model: 'mistral-large-latest',
                // model: 'mistral-medium-latest',

                messages: [
                    {
                        role: 'system',
                        content: prompt,
                    },
                ],

                temperature: 0.1,
                max_tokens: 120,
            }),
        });

        if (!response.ok) {
            throw new Error(
                `Error Mistral: ${response.status} ${response.statusText}`
            );
        }

        const data = await response.json();

        const resultado = data.choices?.[0]?.message?.content ?? '';

        console.log('Respuesta de IA:', resultado);

        return resultado;
    } catch (error) {
        console.error('Error verificando diagrama:', error);
        throw error;
    }
}

// import { GoogleGenAI } from '@google/genai';

// const ai = new GoogleGenAI({
//     // apiKey: process.env.GEMINI_API_KEY,
//     // apiKey: 'AIzaSyBSl3pY7bBhyIEZVKd1TVW7SYaSSBhkBZY',
//     apiKey: 'AQ.Ab8RN6JRT04inM979tMNxcapcVgLIxC1bORDW0ZUTppNg2JchA',
// });

// export async function verificarDiagrama(jsonDiagrama: any, ejercicio: string) {
//     const diagramaReducido = {
//         nodes: jsonDiagrama.nodes.map((n: any) => ({
//             id: n.id,
//             type: n.type,
//             label: n.data?.label || '',
//         })),

//         edges: jsonDiagrama.edges.map((e: any) => ({
//             source: e.source,
//             target: e.target,
//             label: e.label || '',
//         })),
//     };

//     console.log('Diagrama reducido para IA:', diagramaReducido);

//     console.log(
//         'Ejercicio para IA en format texto:',
//         JSON.stringify(diagramaReducido)
//     );

//     const diagramaTexto = JSON.stringify(diagramaReducido);

//     const prompt = `
// Eres un profesor experto en algoritmos y diagramas de flujo.

// Tu tarea es verificar si el flujo lógico del diagrama cumple correctamente el ejercicio.

// REGLAS IMPORTANTES:
// - Analiza SOLO la lógica.
// - Ignora posiciones x/y.
// - Ignora diseño visual.
// - Ignora estética.
// - Analiza únicamente nodos y conexiones.
// - No inventes errores inexistentes.
// - Si la lógica cumple el ejercicio, responde que es correcto.

// Debes verificar:
// - inicio y fin correctos
// - ciclos
// - decisiones
// - variables
// - acumuladores
// - contadores
// - secuencia lógica

// La respuesta debe:
// - ser MUY corta
// - máximo 3 oraciones
// - sonar como un profesor experto
// - indicar si es correcto o incorrecto
// - mencionar solo el error más importante si existe

// IMPORTANTE:
// - Si el diagrama cumple el ejercicio, debes incluir obligatoriamente la palabra "correcto".
// - Si el diagrama no cumple el ejercicio, debes incluir obligatoriamente la palabra "incorrecto".
// - Nunca uses palabras ambiguas como "aceptable", "válido", "adecuado" o "cumple parcialmente" sin indicar además si es correcto o incorrecto.
// - No respondas únicamente con "sí" o "no".
// - La primera oración debe indicar claramente si el diagrama es correcto o incorrecto.

// Ejemplos válidos:

// "El diagrama es correcto y la lógica del ciclo está bien implementada."

// "El diagrama es correcto porque cumple completamente el ejercicio."

// "El diagrama es incorrecto porque el contador nunca se incrementa."

// "El diagrama es incorrecto porque la condición de salida del ciclo no permite finalizar correctamente."

// Ejercicio:
// ${ejercicio}

// Diagrama:
// ${diagramaTexto}
// `;

//     try {
//         const response = await ai.models.generateContent({
//             model: 'gemini-2.5-flash',
//             contents: prompt,
//         });
//         console.log('Respuesta de IA:', response.text);
//         return response.text;
//     } catch (error) {
//         console.error('Error verificando diagrama:', error);
//         throw error;
//     }
// }
