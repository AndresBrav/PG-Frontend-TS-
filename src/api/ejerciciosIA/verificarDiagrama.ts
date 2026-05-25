export async function verificarDiagrama(jsonDiagrama: any, ejercicio: string) {
    // Reducir ruido innecesario
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

    const response = await fetch(`${import.meta.env.VITE_MISTRAL_LINK}`, {
        method: 'POST',

        headers: {
            Authorization: `Bearer ${import.meta.env.VITE_MISTRAL_API_KEY}`,
            'Content-Type': 'application/json',
        },

        body: JSON.stringify({
            // Recomendado
            model: 'mistral-large-latest',

            messages: [
                {
                    role: 'system',

                    content: `
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

Diagrama:
${JSON.stringify(diagramaReducido)}
`,
                },
            ],

            // IMPORTANTE
            temperature: 0.1,

            max_tokens: 120,
        }),
    });

    const data = await response.json();

    return data.choices[0].message.content;
}
