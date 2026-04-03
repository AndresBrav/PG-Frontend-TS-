import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { verificarResultadoPseudocodigo5 } from '../VerificarResultadoPseudo';

interface CodeLine {
    id: string;
    content: string;
}

const initialCode: CodeLine[] = [
    { id: '1', content: 'Proceso SumarHastaNegativo' },
    { id: '4', content: '  Escribir "Ingrese un numero"' },
    { id: '2', content: '  Definir numero, suma Como Entero' },
    { id: '6', content: '  Mientras numero >= 0 Hacer' },
    { id: '7', content: '    suma <- suma + numero' },
    { id: '3', content: '  suma <- 0' },
    { id: '5', content: '  Leer numero' },
    { id: '8', content: '    Escribir "Ingrese un numero"' },
    { id: '9', content: '    Leer numero' },
    { id: '10', content: '  FinMientras' },
    { id: '11', content: '  Escribir "La suma total es: ", suma' },
    { id: '12', content: 'FinProceso' },
];

const EjercicioP5Phone: React.FC = () => {
    const [available, setAvailable] = useState<CodeLine[]>(initialCode);
    const [selected, setSelected] = useState<CodeLine[]>([]);
    const navigate = useNavigate();

    const returnDashboard = () => {
        navigate('/dashboard');
    };

    // Click en banco -> pasa a construcción
    const addLine = (line: CodeLine) => {
        setAvailable((prev) => prev.filter((x) => x.id !== line.id));
        setSelected((prev) => [...prev, line]);
    };

    // Click en construcción -> vuelve al banco
    const returnToBank = (line: CodeLine) => {
        setSelected((prev) => prev.filter((x) => x.id !== line.id));
        setAvailable((prev) => [...prev, line]);
    };

    // Reordenar dentro de construcción
    const onDragEnd = (result: DropResult) => {
        if (!result.destination) return;

        setSelected((prev) => {
            const items = [...prev];
            const [moved] = items.splice(result.source.index, 1);
            items.splice(result.destination!.index, 0, moved);
            return items;
        });
    };

    // Mostrar resultado del ejercicio
    const verificarRespuestaPseudo = async (resultados: boolean[]) => {
        const pasos = selected.map((line, index) => ({
            texto: line.content,
            estado: resultados[index] ?? false,
        }));

        const htmlContenido = `
    <div style="
        display:flex;
        flex-direction:column;
        gap:6px;
        margin-top:8px;
        text-align:left;
    ">
        ${pasos
            .map((p) => {
                const borderColor = p.estado ? '#16a34a' : '#dc2626';
                return `<div style="
                    border:2px solid ${borderColor};
                    border-radius:6px;
                    padding:6px 8px;
                    width:100%;
                    box-sizing:border-box;

                    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Courier New', monospace;
                    white-space: pre;
                    text-align:left;

                    overflow-x:auto;
                    overflow-y:hidden;
                    -webkit-overflow-scrolling: touch;

                    font-size:12px;
                    color:#000;
                    background:#fff;
                ">${p.texto}</div>`;
            })
            .join('')}
    </div>`;

        const todoCorrecto = resultados.length > 0 && resultados.every(Boolean);

        if (todoCorrecto) {
            const primerSwal = await Swal.fire({
                title: 'Ejercicio completado',
                icon: 'success',
                iconColor: 'green',
                width: '95%',
                padding: '12px',
                heightAuto: false,
                confirmButtonText: 'Simular ciclo',
                showCancelButton: true,
                cancelButtonText: 'Cerrar',
                customClass: {
                    confirmButton: 'btn-semitransparente',
                    cancelButton: 'btn-cierre',
                },
                html: `
            <div style="padding:4px;">
                <div style="max-height:40vh; overflow-y:auto;">
                    ${htmlContenido}
                </div>

                <div style="
                    margin-top:10px;
                    padding-top:10px;
                    border-top:1px solid #e5e7eb;
                    text-align:left;
                    color:#000;
                    font-size:13px;
                    line-height:1.4;
                ">
                    Ingresa números enteros.<br/>
                    El ciclo continuará mientras el número sea <b>mayor o igual a 0</b>.<br/>
                    Cuando ingreses un número negativo el ciclo terminará.
                </div>
            </div>
            `,
            });

            if (!primerSwal.isConfirmed) return;

            let suma = 0;
            const numeros: number[] = [];
            let numeroActual: 0;
            let iteracion = 1;

            // 🔁 Simulación del ciclo
            while (true) {
                const { value } = await Swal.fire({
                    title: `Iteración ${iteracion}`,
                    html: `
                <div style="color:#000; text-align:left; font-size:14px;">
                    <div style="margin-bottom:10px;">
                        Ingresa un número entero
                    </div>
                    <div style="margin-bottom:8px; font-size:12px; color:#374151;">
                        Escribe un número negativo para terminar
                    </div>
                    <div style="font-size:12px; color:#374151;">
                        Suma actual: <b>${suma}</b>
                    </div>
                </div>
                `,
                    input: 'number',
                    inputAttributes: {
                        step: '1',
                        inputmode: 'numeric',
                        pattern: '[0-9-]*',
                    },
                    inputPlaceholder: 'Ej: 8 o -1',
                    width: '92%',
                    padding: '12px',
                    heightAuto: false,
                    confirmButtonText: 'Continuar',
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    customClass: {
                        confirmButton: 'btn-semitransparente',
                    },
                    preConfirm: (val) => {
                        if (val === '' || val === null) {
                            Swal.showValidationMessage(
                                'Debes ingresar un número.'
                            );
                            return;
                        }

                        const n = Number(val);

                        if (Number.isNaN(n)) {
                            Swal.showValidationMessage('Número inválido.');
                            return;
                        }

                        if (!Number.isInteger(n)) {
                            Swal.showValidationMessage(
                                'Solo se permiten enteros.'
                            );
                            return;
                        }

                        return n;
                    },
                });

                if (value === undefined) return;

                numeroActual = value;

                if (numeroActual < 0) {
                    break;
                }

                numeros.push(numeroActual);
                suma += numeroActual;
                iteracion++;
            }

            await mostrarResultadoSumaHastaNegativo(
                numeros,
                suma,
                numeroActual
            );
        } else {
            await Swal.fire({
                title: 'Ejercicio incompleto',
                icon: 'error',
                iconColor: 'red',
                width: '95%',
                padding: '12px',
                html: `<div style="max-height:55vh; overflow-y:auto;">${htmlContenido}</div>`,
                confirmButtonText: 'Cerrar',
                customClass: {
                    confirmButton: 'btn-cierre',
                },
            });
        }
    };

    const mostrarResultadoSumaHastaNegativo = async (
        numeros: number[],
        suma: number,
        numeroFinal: number | null
    ) => {
        await Swal.fire({
            title: 'Resultado Final',
            icon: 'success',
            width: '92%',
            padding: '12px',
            confirmButtonText: 'Cerrar',
            customClass: {
                confirmButton: 'btn-semitransparente',
            },
            html: `
        <div style="color:#000; text-align:left; font-size:14px;">
            <div style="margin-bottom:10px;">
                <b>Números sumados:</b>
            </div>

            <div style="
                background:#f8fafc;
                border:1px solid #e5e7eb;
                border-radius:8px;
                padding:8px;
                margin-bottom:12px;
                font-size:13px;
                line-height:1.5;
                word-break:break-word;
            ">
                ${numeros.length > 0 ? numeros.join(', ') : 'No se ingresaron números'}
            </div>

            <div style="margin-bottom:10px;">
                <b>Número que terminó el ciclo:</b> ${numeroFinal}
            </div>

            <div style="font-size:16px;">
                <b>La suma total es:</b> ${suma}
            </div>
        </div>
        `,
        });
    };

    // Ejecutar verificación
    const printOrder = () => {
        const ids = selected.map((line) => line.id);
        const resultados: boolean[] = verificarResultadoPseudocodigo5(ids);

        console.log('IDs en orden:', ids);
        console.log('Resultados:', resultados);

        verificarRespuestaPseudo(resultados);
    };

    const cardStyle: React.CSSProperties = {
        padding: '10px',
        borderRadius: '10px',
        fontSize: '13px',
        fontWeight: 500,
        color: '#111',
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
        cursor: 'pointer',
    };

    const codeTextStyle: React.CSSProperties = {
        whiteSpace: 'pre',
        fontFamily:
            "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Courier New', monospace",
    };

    return (
        <div>
            {/* Botón salir */}
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    padding: '10px 15px',
                }}
            >
                <svg
                    fill="#E11919"
                    onClick={returnDashboard}
                    width="35px"
                    height="35px"
                    viewBox="0 0 32 32"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{ cursor: 'pointer' }}
                >
                    <title>cancel</title>
                    <path d="M10.771 8.518c-1.144 0.215-2.83 2.171-2.086 2.915l4.573 4.571-4.573 4.571c-0.915 0.915 1.829 3.656 2.744 2.742l4.573-4.571 4.573 4.571c0.915 0.915 3.658-1.829 2.744-2.742l-4.573-4.571 4.573-4.571c0.915-0.915-1.829-3.656-2.744-2.742l-4.573 4.571-4.573-4.571c-0.173-0.171-0.394-0.223-0.657-0.173v0zM16 1c-8.285 0-15 6.716-15 15s6.715 15 15 15 15-6.716 15-15-6.715-15-15-15zM16 4.75c6.213 0 11.25 5.037 11.25 11.25s-5.037 11.25-11.25 11.25-11.25-5.037-11.25-11.25c0.001-6.213 5.037-11.25 11.25-11.25z"></path>
                </svg>
            </div>

            <div className="contenedor-diagramaflujo-ejercicio1">
                <h1>Pseudocodigo</h1>
            </div>
            <br />
            <div className="contenedor-diagramaflujo-ejercicio1-explicacion">
                <h1>
                    Diseñar el pseudocódigo que permita calcular la suma
                    acumulada de una serie de números positivos ingresados por
                    el usuario, finalizando el proceso al introducir un valor
                    negativo. Este algoritmo utiliza una estructura de control
                    repetitiva que condiciona la permanencia en el ciclo a que
                    el número ingresado sea mayor o igual a cero, permitiendo
                    que el usuario sume una cantidad indeterminada de valores
                    que se acumulan progresivamente en una variable, deteniendo
                    la ejecución y mostrando el resultado total obtenido justo
                    en el momento en que se detecta una entrada negativa como
                    señal de cierre.
                </h1>
            </div>

            {/* ================= BANCO ================= */}
            <div>
                <br />
                <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                    <h3 style={{ color: 'white' }}>Banco de líneas</h3>
                </div>

                <div
                    style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '10px',
                        justifyContent: 'center',
                    }}
                >
                    {available.map((line) => (
                        <div
                            key={line.id}
                            onClick={() => addLine(line)}
                            style={cardStyle}
                        >
                            <span style={codeTextStyle}>{line.content}</span>
                        </div>
                    ))}
                </div>

                <br />
                <br />
            </div>

            <br />
            <br />

            {/* Botón ejecutar */}
            <div className="contenedor-diagramaflujo-boton">
                <button
                    onClick={printOrder}
                    className="button-execute-flowchart"
                >
                    <h1>Ejecutar</h1>
                </button>
            </div>

            {/* ================= CONSTRUCCIÓN ================= */}
            <br />
            <br />

            <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="builder">
                    {(drop) => (
                        <section
                            ref={drop.innerRef}
                            {...drop.droppableProps}
                            style={{
                                width: '95vw',
                                height: '65vh',
                                margin: '0 auto',
                                padding: '15px',
                                borderRadius: '16px',
                                background: '#ffffff',
                                border: '2px dashed #cbd5e1',
                                overflowY: 'auto',
                            }}
                        >
                            {selected.map((line, index) => (
                                <Draggable
                                    key={line.id}
                                    draggableId={line.id}
                                    index={index}
                                >
                                    {(drag) => (
                                        <div
                                            ref={drag.innerRef}
                                            {...drag.draggableProps}
                                            {...drag.dragHandleProps}
                                            onClick={() => returnToBank(line)}
                                            style={{
                                                ...cardStyle,
                                                marginBottom: '8px',
                                                border: '1px solid #3b82f6',
                                                ...drag.draggableProps.style,
                                            }}
                                        >
                                            <span style={codeTextStyle}>
                                                {line.content}
                                            </span>
                                        </div>
                                    )}
                                </Draggable>
                            ))}
                            {drop.placeholder}
                        </section>
                    )}
                </Droppable>
            </DragDropContext>
        </div>
    );
};

export default EjercicioP5Phone;
