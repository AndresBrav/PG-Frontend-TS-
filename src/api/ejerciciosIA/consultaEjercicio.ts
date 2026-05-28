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
Genera UN SOLO ejercicio corto y diferente para resolver mediante un diagrama de flujo.

El ejercicio debe estar relacionado con ${temaRandom}.

El enunciado debe:

empezar obligatoriamente con "Crea un diagrama de flujo que..."
tener una longitud similar a:
"Crea un diagrama de flujo que lea 10 números y muestre cuál es el mayor."
ocupar máximo 1 o 2 líneas
describir un único problema sencillo
ser adecuado para principiantes
usar lógica básica

El ejercicio puede incluir:

condiciones simples
cálculos sencillos
comparaciones
contadores
acumuladores
ciclos básicos

Si usas ciclos:

deben ser muy simples
debe quedar claro cuántas veces se repite
o cuál es la condición para terminar

No generes:

explicaciones
listas
requisitos
entradas o salidas
soluciones
pseudocódigo
texto adicional
ejercicios largos
varios problemas en uno
ejercicios complejos

El estilo debe parecerse a:

"Crea un diagrama de flujo que lea el precio de un videojuego y aplique descuento si cuesta más de 200 Bs."
"Crea un diagrama de flujo que calcule el promedio de 3 notas de un estudiante y muestre si aprobó."
"Crea un diagrama de flujo que lea 20 productos y cuente cuántos tienen descuento."
"Crea un diagrama de flujo que pida una contraseña hasta que el usuario escriba la correcta."
"Crea un diagrama de flujo que lea los goles de dos equipos y muestre cuál ganó el partido."
"Crea un diagrama de flujo que lea la temperatura de un paciente y muestre si tiene fiebre."
"Crea un diagrama de flujo que lea 10 ventas de una cafetería y muestre el total recaudado."
Responde únicamente con el enunciado.
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
