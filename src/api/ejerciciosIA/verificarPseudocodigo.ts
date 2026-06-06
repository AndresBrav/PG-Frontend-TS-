export async function verificarPseudocodigo(pseudocodigo: string, ejercicio: string) {
    const prompt = `
Eres un profesor experto en algoritmos y pseudocódigo.

Tu tarea es verificar si el pseudocódigo ingresado por el usuario resuelve correctamente el ejercicio planteado.

REGLAS IMPORTANTES:
- Analiza la lógica del pseudocódigo. Debe estar en español (por ejemplo, usando palabras clave como Algoritmo/Proceso, Definir, Escribir, Leer, Si/Entonces, FinAlgoritmo/FinProceso, etc.).
- Ignora diferencias menores de nombres de variables si la lógica es correcta.
- No inventes errores inexistentes.
- Si la lógica cumple el ejercicio, responde que es correcto.

La respuesta debe:
- ser MUY corta.
- máximo 3 oraciones.
- sonar como un profesor experto.
- indicar claramente si es correcto o incorrecto.
- mencionar solo el error más importante si existe.

IMPORTANTE:
- Si el pseudocódigo cumple el ejercicio, debes incluir obligatoriamente la palabra "correcto".
- Si el pseudocódigo no cumple el ejercicio, debes incluir obligatoriamente la palabra "incorrecto".
- La primera oración debe indicar claramente si el pseudocódigo es correcto o incorrecto.

Ejercicio:
${ejercicio}

Pseudocódigo del usuario:
${pseudocodigo}
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
                messages: [
                    {
                        role: 'system',
                        content: prompt,
                    },
                ],
                temperature: 0.1,
                max_tokens: 150,
            }),
        });

        if (!response.ok) {
            throw new Error(`Error Mistral: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        const resultado = data.choices?.[0]?.message?.content ?? '';
        console.log('Respuesta de IA para Pseudocódigo:', resultado);
        return resultado;
    } catch (error) {
        console.error('Error verificando pseudocódigo:', error);
        throw error;
    }
}
