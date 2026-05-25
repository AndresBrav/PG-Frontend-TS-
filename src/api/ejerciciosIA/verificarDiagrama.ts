export async function verificarDiagrama(jsonDiagrama: any, ejercicio: string) {
    const response = await fetch(`${import.meta.env.VITE_MISTRAL_LINK}`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${import.meta.env.VITE_MISTRAL_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: 'mistral-medium',

            messages: [
                {
                    role: 'system',
                    content: `
Eres un experto en algoritmos y diagramas de flujo.

Debes analizar únicamente la lógica del algoritmo.

IMPORTANTE:
- Ignora completamente las posiciones visuales (x, y).
- Ignora estética, alineación o diseño visual.
- Evalúa SOLO las conexiones entre nodos (edges) y el flujo lógico.
- Si el flujo lógico cumple el ejercicio, considéralo correcto aunque el diagrama no esté perfectamente acomodado visualmente.
- No inventes errores de presentación.

Debes responder:
- de forma MUY corta
- como un profesor experto
- indicando si el diagrama es correcto o incorrecto
- mencionando únicamente el error más importante si existe
- sin listas
- máximo 4 oraciones

Ejemplos válidos:
"El diagrama es correcto y la lógica del ciclo está bien implementada."

"El diagrama es incorrecto porque el contador nunca se incrementa."

"El diagrama tiene un error: la suma se muestra antes de terminar el ciclo."
`,
                },

                {
                    role: 'user',
                    content: `
Ejercicio:
${ejercicio}

Diagrama en JSON:
${JSON.stringify(jsonDiagrama)}
`,
                },
            ],

            temperature: 0.4,
            max_tokens: 120,
        }),
    });

    const data = await response.json();

    return data.choices[0].message.content;
}
