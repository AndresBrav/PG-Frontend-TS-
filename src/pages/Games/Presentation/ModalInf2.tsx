import React, { useState } from 'react';
import '../../../assets/styles/stylesModal/designModals.css';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface CategoriaPseint {
    /** Emoji identificador de la categoría. */
    emoji: string;
    /** Color de acento de la tarjeta. */
    color: string;
    /** Nombre de la categoría. */
    titulo: string;
    /** Tipos / instrucciones que abarca. */
    tipos: string;
    /** Explicación pedagógica del concepto. */
    explicacion: string;
    /** Forma general de la sintaxis. */
    sintaxis: string;
    /** Ejemplo compilable con nuestro intérprete. */
    ejemplo: string;
}

const CATEGORIAS: CategoriaPseint[] = [
    {
        emoji: '📘',
        color: '#60A5FA',
        titulo: 'Estructura Secuencial',
        tipos: 'Definir · Leer · Escribir · Asignar (<-)',
        explicacion:
            'Es la base de todo algoritmo: las instrucciones se ejecutan una después de otra, en el orden en que aparecen. Primero se definen las variables, luego se leen los datos de entrada, se procesan y por último se muestra el resultado.',
        sintaxis: `Algoritmo Nombre
    Definir variable Como Tipo

    Escribir "Mensaje"
    Leer variable

    variable2 <- variable + valor

    Escribir "Resultado: ", variable2
FinAlgoritmo`,
        ejemplo: `Algoritmo Secuencial
    Definir a, b, suma Como Entero

    Escribir "Ingrese dos números:"
    Leer a, b

    suma <- a + b

    Escribir "La suma es: ", suma
FinAlgoritmo`,
    },
    {
        emoji: '🔀',
        color: '#F472B6',
        titulo: 'Estructuras Selectivas',
        tipos: 'Si · SiNo · Según · De Otro Modo',
        explicacion:
            'Permiten tomar decisiones según una o varias condiciones. La selectiva simple (Si) ejecuta algo solo si la condición es verdadera; la doble (Si-SiNo) elige entre dos caminos; y la múltiple (Según) selecciona una opción entre varias posibles según el valor de una variable.',
        sintaxis: `// Simple
Si condicion Entonces
    // instrucciones
FinSi

// Doble
Si condicion Entonces
    // si es verdadero
SiNo
    // si es falso
FinSi

// Múltiple
Segun variable Hacer
    opcion1:
        // instrucciones
    De Otro Modo:
        // ninguna opción
FinSegun`,
        ejemplo: `Algoritmo SelectivaDoble
    Definir numero Como Entero

    Leer numero

    Si numero > 0 Entonces
        Escribir "Positivo"
    SiNo
        Escribir "No es positivo"
    FinSi
FinAlgoritmo`,
    },
    {
        emoji: '🌳',
        color: '#A78BFA',
        titulo: 'Decisiones Anidadas',
        tipos: 'Si dentro de Si · Si dentro de SiNo',
        explicacion:
            'Consisten en colocar una estructura condicional dentro de otra. Así se evalúan condiciones combinadas paso a paso: primero se decide algo general y, dentro de cada rama, se precisa la decisión siguiente. Muy útil cuando la respuesta depende de varios criterios a la vez.',
        sintaxis: `Si condicion1 Entonces
    Si condicion2 Entonces
        // ambas verdaderas
    SiNo
        // solo la primera
    FinSi
SiNo
    // la primera es falsa
FinSi`,
        ejemplo: `Algoritmo DecisionAnidada
    Definir edad Como Entero
    Definir aprobado Como Logico

    Leer edad
    Leer aprobado

    Si edad >= 18 Entonces
        Si aprobado Entonces
            Escribir "Puede obtener licencia"
        SiNo
            Escribir "Debe aprobar el examen"
        FinSi
    SiNo
        Escribir "Es menor de edad"
    FinSi
FinAlgoritmo`,
    },
    {
        emoji: '🔁',
        color: '#4ADE80',
        titulo: 'Estructuras Repetitivas',
        tipos: 'Mientras · Repetir-Hasta Que · Para (Con Paso)',
        explicacion:
            'Permiten ejecutar un conjunto de instrucciones varias veces. Mientras repite mientras la condición sea verdadera (puede no ejecutarse nunca); Repetir lo hace al menos una vez hasta que se cumpla la condición; y Para repite una cantidad conocida de veces, con o sin Con Paso.',
        sintaxis: `Mientras condicion Hacer
    // instrucciones
FinMientras

Repetir
    // instrucciones
Hasta Que condicion

Para i <- inicio Hasta fin Hacer
    // instrucciones
FinPara`,
        ejemplo: `Algoritmo BuclePara
    Definir i Como Entero

    Para i <- 1 Hasta 5 Hacer
        Escribir i
    FinPara
FinAlgoritmo`,
    },
    {
        emoji: '🧩',
        color: '#FACC15',
        titulo: 'Funciones y SubProcesos',
        tipos: 'Funcion (con retorno) · SubProceso (sin retorno)',
        explicacion:
            'Permiten dividir un algoritmo en partes reutilizables. Una Función recibe parámetros, realiza operaciones y devuelve un resultado; un SubProceso ejecuta instrucciones sin necesidad de devolver ningún valor. En ambos casos se definen antes del algoritmo principal.',
        sintaxis: `Funcion resultado <- Nombre(a, b)
    Definir resultado Como Tipo
    resultado <- expresion
FinFuncion

SubProceso Nombre()
    // instrucciones
FinSubProceso

// Llamada:
variable <- Nombre(valor1, valor2)
Nombre()`,
        ejemplo: `Funcion resultado <- Sumar(a, b)
    Definir resultado Como Entero
    resultado <- a + b
FinFuncion

Algoritmo EjemploFuncion
    Definir suma Como Entero

    suma <- Sumar(5, 3)

    Escribir "Resultado: ", suma
FinAlgoritmo`,
    },
    {
        emoji: '📦',
        color: '#FB923C',
        titulo: 'Arreglos (Vectores)',
        tipos: 'Dimension · lectura y escritura por índice [i]',
        explicacion:
            'Un arreglo (vector) permite almacenar varios elementos del mismo tipo en una sola variable, cada uno en una posición numérica llamada índice. En PSeInt los índices empiezan en 1, y se accede a cada elemento con corchetes: numeros[3].',
        sintaxis: `Dimension nombre[tamaño]

// Acceso al elemento i:
nombre[i] <- valor
Escribir nombre[i]`,
        ejemplo: `Algoritmo ArregloUnidimensional
    Definir numeros, i Como Entero
    Dimension numeros[5]

    Para i <- 1 Hasta 5 Hacer
        Escribir "Ingrese número:"
        Leer numeros[i]
    FinPara

    Para i <- 1 Hasta 5 Hacer
        Escribir numeros[i]
    FinPara
FinAlgoritmo`,
    },
];

const estiloBarraCopiar = {
    background: 'rgba(255,255,255,0.08)',
    borderRadius: 8,
    padding: '10px 12px',
    fontFamily: 'var(--mono)',
    fontSize: 12,
    whiteSpace: 'pre-wrap' as const,
    color: '#e2e8f0',
    lineHeight: 1.5,
    overflowX: 'auto' as const,
    margin: 0,
};

const ModalInf2: React.FC<ModalProps> = ({ isOpen, onClose }) => {
    const [indiceDetalle, setIndiceDetalle] = useState<number | null>(null);

    if (!isOpen) return null;

    const categoria = indiceDetalle === null ? null : CATEGORIAS[indiceDetalle];

    const copiarEjemplo = async () => {
        if (!categoria) return;
        try {
            await navigator.clipboard.writeText(categoria.ejemplo);
        } catch {
            /* sin permiso de portapapeles: se ignora */
        }
    };

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 9999,
                padding: '10px',
            }}
        >
            <div
                style={{
                    background: 'rgba(24, 24, 24, 1)',
                    borderRadius: 15,
                    width: '100%',
                    maxWidth: '900px',
                    height: '85vh',
                    overflowY: 'auto',
                    border: '2px solid white',
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                {/* 🔹 Encabezado */}
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '10px 15px',
                        flexShrink: 0,
                    }}
                >
                    <h2
                        style={{
                            color: '#ffffff',
                            fontSize: 16,
                            fontWeight: 700,
                            margin: 0,
                        }}
                    >
                        {categoria ? categoria.emoji + ' ' + categoria.titulo : '📚 Estructuras del Pseudocódigo'}
                    </h2>
                    <svg
                        fill="#E11919"
                        onClick={onClose}
                        width="28px"
                        height="28px"
                        viewBox="0 0 32 32"
                        xmlns="http://www.w3.org/2000/svg"
                        style={{ cursor: 'pointer', flexShrink: 0 }}
                    >
                        <title>cancel</title>
                        <path d="M10.771 8.518c-1.144 0.215-2.83 2.171-2.086 2.915l4.573 4.571-4.573 4.571c-0.915 0.915 1.829 3.656 2.744 2.742l4.573-4.571 4.573 4.571c0.915 0.915 3.658-1.829 2.744-2.742l-4.573-4.571 4.573-4.571c0.915-0.915-1.829-3.656-2.744-2.742l-4.573 4.571-4.573-4.571c-0.173-0.171-0.394-0.223-0.657-0.173v0zM16 1c-8.285 0-15 6.716-15 15s6.715 15 15 15 15-6.716 15-15-6.715-15-15-15zM16 4.75c6.213 0 11.25 5.037 11.25 11.25s-5.037 11.25-11.25 11.25-11.25-5.037-11.25-11.25c0.001-6.213 5.037-11.25 11.25-11.25z" />
                    </svg>
                </div>

                {/* 🔹 Contenido */}
                <div
                    style={{
                        padding: '0 15px 20px 15px',
                        overflowY: 'auto',
                        flex: 1,
                    }}
                >
                    {categoria === null ? (
                        <>
                            <p
                                style={{
                                    color: '#9ca3af',
                                    fontSize: 13,
                                    lineHeight: 1.6,
                                    margin: '0 0 14px 0',
                                }}
                            >
                                El pseudocódigo describe un algoritmo con un
                                lenguaje estructurado parecido al español. Haz
                                clic en cada categoría para ver qué es, su
                                sintaxis y un ejemplo listo para ejecutar.
                            </p>

                            {/* Grid responsive de categorías */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                {CATEGORIAS.map((item, indice) => (
                                    <button
                                        key={item.titulo}
                                        type="button"
                                        onClick={() => setIndiceDetalle(indice)}
                                        className="text-left rounded-xl border p-4 transition hover:scale-[1.02]"
                                        style={{
                                            borderColor: item.color + '55',
                                            background:
                                                'rgba(255,255,255,0.04)',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        <div className="flex items-center gap-2">
                                            <span
                                                style={{ fontSize: 22 }}
                                            >
                                                {item.emoji}
                                            </span>
                                            <span
                                                style={{
                                                    color: item.color,
                                                    fontWeight: 700,
                                                    fontSize: 14,
                                                }}
                                            >
                                                {item.titulo}
                                            </span>
                                        </div>
                                        <p
                                            style={{
                                                color: '#9ca3af',
                                                fontSize: 12,
                                                margin: '6px 0 0 0',
                                                lineHeight: 1.5,
                                            }}
                                        >
                                            {item.tipos}
                                        </p>
                                    </button>
                                ))}
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Volver */}
                            <button
                                type="button"
                                onClick={() => setIndiceDetalle(null)}
                                style={{
                                    background: 'rgba(255,255,255,0.08)',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    color: '#e5e7eb',
                                    borderRadius: 8,
                                    padding: '6px 12px',
                                    fontSize: 12,
                                    cursor: 'pointer',
                                    marginBottom: 14,
                                }}
                            >
                                ← Volver a las categorías
                            </button>

                            {/* Tipos que abarca */}
                            <div
                                className="flex flex-wrap items-center gap-1 mb-4"
                            >
                                {categoria.tipos.split('·').map((tipo) => (
                                    <span
                                        key={tipo}
                                        style={{
                                            fontSize: 11,
                                            padding: '3px 8px',
                                            borderRadius: 6,
                                            background:
                                                categoria.color + '22',
                                            outline:
                                                '1px solid ' +
                                                categoria.color + '55',
                                            color: '#e5e7eb',
                                            whiteSpace: 'nowrap',
                                        }}
                                    >
                                        {tipo.trim()}
                                    </span>
                                ))}
                            </div>

                            {/* Qué es */}
                            <h3
                                style={{
                                    color: categoria.color,
                                    fontSize: 14,
                                    fontWeight: 700,
                                    margin: '0 0 6px 0',
                                }}
                            >
                                ¿Qué es?
                            </h3>
                            <p
                                style={{
                                    color: '#d1d5db',
                                    fontSize: 13,
                                    lineHeight: 1.7,
                                    margin: '0 0 16px 0',
                                }}
                            >
                                {categoria.explicacion}
                            </p>

                            {/* Sintaxis */}
                            <h3
                                style={{
                                    color: categoria.color,
                                    fontSize: 14,
                                    fontWeight: 700,
                                    margin: '0 0 6px 0',
                                }}
                            >
                                Sintaxis
                            </h3>
                            <pre style={estiloBarraCopiar}>
                                {categoria.sintaxis}
                            </pre>

                            {/* Ejemplo */}
                            <h3
                                style={{
                                    color: categoria.color,
                                    fontSize: 14,
                                    fontWeight: 700,
                                    margin: '16px 0 6px 0',
                                }}
                            >
                                Ejemplo listo para ejecutar
                            </h3>
                            <div className="relative mb-4">
                                <pre style={estiloBarraCopiar}>
                                    {categoria.ejemplo}
                                </pre>
                                <button
                                    type="button"
                                    onClick={copiarEjemplo}
                                    style={{
                                        position: 'absolute',
                                        top: 8,
                                        right: 8,
                                        background: categoria.color,
                                        color: '#121212',
                                        border: 'none',
                                        borderRadius: 7,
                                        padding: '5px 10px',
                                        fontSize: 11,
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                    }}
                                >
                                    📋 Copiar
                                </button>
                            </div>
                            <p
                                style={{
                                    color: '#6b7280',
                                    fontSize: 11,
                                    margin: 0,
                                }}
                            >
                                💡 Copia el ejemplo y pégalo en el editor para
                                ejecutarlo y observar sus variables en el modo
                                debug.
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ModalInf2;
