export async function main() {
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
                    role: 'user',
                    content: `
Genera un ejercicio SIMPLE y DIFERENTE de programación para resolver mediante un diagrama de flujo.

El ejercicio debe estar relacionado con ${temaRandom}.

La respuesta debe:
- tener únicamente un párrafo corto
- describir un solo problema sencillo
- explicar brevemente qué debe hacer el algoritmo
- ser adecuada para principiantes
- usar lógica básica, condiciones, ciclos o cálculos simples
- parecerse a ejercicios clásicos de algoritmos

No generes explicaciones adicionales, listas, requisitos, entradas, salidas ni soluciones.

El formato debe ser parecido a:

"Crea un diagrama de flujo que..."
`,
                },
            ],

            temperature: 1.2,
            max_tokens: 300,
        }),
    });

    const data = await response.json();

    // retornar el string
    return data.choices[0].message.content;
}
