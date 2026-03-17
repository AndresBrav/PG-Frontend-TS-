import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { verificarResultadoPseudocodigo4 } from '../VerificarResultadoPseudo';

interface CodeLine {
    id: string;
    content: string;
}

const initialCode: CodeLine[] = [
    { id: '1', content: 'Proceso SumarDiezNumeros' },
    { id: '4', content: '  contador <- 1' },
    { id: '2', content: '  Definir numero, suma, contador Como Entero ' },
    { id: '6', content: '    Escribir "Ingrese un numero:"' },
    { id: '7', content: '    Leer numero' },
    { id: '3', content: '  suma <- 0' },
    { id: '5', content: '  Mientras contador <= 10 Hacer ' },
    { id: '8', content: '    suma <- suma + numero' },
    { id: '9', content: '    contador <- contador + 1 ' },
    { id: '10', content: '  FinMientras' },
    { id: '11', content: '  Escribir "La suma total es: ", suma' },
    { id: '12', content: 'FinProceso' },
];

const EjercicioP4Laptop: React.FC = () => {
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
            id: line.id,
            texto: line.content,
            estado: resultados[index] ?? false,
        }));

        const htmlContenido = `
        <div style="display:flex; flex-direction:column; gap:6px; text-align:left; margin-top:10px;">
            ${pasos
                .map((p) => {
                    const borderColor = p.estado ? '#16a34a' : '#dc2626';

                    return `
                    <div style="
                        border:2px solid ${borderColor};
                        border-radius:6px;
                        padding:4px 6px;
                        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono','Courier New', monospace;
                        white-space: pre;
                        font-size: 13px;
                        color: #000000;
                        background: #ffffff;
                    ">
                        ${p.texto}
                    </div>
                    `;
                })
                .join('')}
        </div>`;

        const todoCorrecto = resultados.length > 0 && resultados.every(Boolean);

        if (todoCorrecto) {
            const primerSwal = await Swal.fire({
                title: 'Ejercicio completado',
                icon: 'success',
                iconColor: 'green',
                width: '55%',
                confirmButtonText: 'Simular ciclo',
                showCancelButton: true,
                cancelButtonText: 'Cerrar',
                customClass: {
                    confirmButton: 'btn-semitransparente',
                    cancelButton: 'btn-cierre',
                },
                html: `
                <div style="padding:8px;">
                    ${htmlContenido}

                    <div style="
                        margin-top: 14px;
                        padding-top: 12px;
                        border-top: 1px solid #e5e7eb;
                        text-align: left;
                        color: #000;
                        font-size: 14px;
                        line-height: 1.5;
                    ">
                        Se simularán las 10 iteraciones del ciclo <b>Mientras contador <= 10</b>.<br/>
                        En cada iteración ingresarás un número entero y al final se mostrará la suma total.
                    </div>
                </div>
                `,
            });

            if (!primerSwal.isConfirmed) return;

            let suma = 0;
            const numeros: number[] = [];

            // 🔁 Simulación del ciclo (10 iteraciones)
            for (let i = 1; i <= 10; i++) {
                const { value } = await Swal.fire({
                    title: `Iteración ${i} de 10`,
                    html: `
                    <div style="color:#000; text-align:left; font-size:14px;">
                        <div style="margin-bottom:10px;">
                            Ingresa el número <b>${i}</b>
                        </div>
                        <div style="font-size:13px; color:#374151;">
                            Valor actual de suma: <b>${suma}</b>
                        </div>
                    </div>
                    `,
                    input: 'number',
                    inputAttributes: {
                        step: '1',
                        inputmode: 'numeric',
                        pattern: '[0-9-]*',
                    },
                    inputPlaceholder: `Ej: ${i}`,
                    width: '40%',
                    confirmButtonText: i === 10 ? 'Finalizar' : 'Siguiente',
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

                numeros.push(value);
                suma += value;
            }

            await mostrarResultadoSuma(numeros, suma);
        } else {
            await Swal.fire({
                title: 'Ejercicio incompleto',
                html: `<div style="padding:8px;">${htmlContenido}</div>`,
                icon: 'error',
                iconColor: 'red',
                confirmButtonText: 'Cerrar',
                customClass: {
                    confirmButton: 'btn-cierre',
                },
                width: '50%',
            });
        }
    };

    // Mostrar resultado final de la suma
    const mostrarResultadoSuma = async (numeros: number[], suma: number) => {
        await Swal.fire({
            title: 'Resultado Final',
            icon: 'success',
            width: '45%',
            confirmButtonText: 'Cerrar',
            customClass: {
                confirmButton: 'btn-semitransparente',
            },
            html: `
            <div style="color:#000; text-align:left; font-size:14px;">
                <div style="margin-bottom:10px;">
                    <b>Números ingresados:</b>
                </div>

                <div style="
                    background:#f8fafc;
                    border:1px solid #e5e7eb;
                    border-radius:8px;
                    padding:10px;
                    margin-bottom:12px;
                    font-size:13px;
                    line-height:1.6;
                    word-break:break-word;
                ">
                    ${numeros.join(', ')}
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
        const resultados: boolean[] = verificarResultadoPseudocodigo4(ids);

        console.log('IDs en orden:', ids);
        console.log('Resultados:', resultados);

        verificarRespuestaPseudo(resultados);
    };

    const cardStyle: React.CSSProperties = {
        padding: '10px 10px',
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
            "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
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

            <div className="contenedor-diagramaflujo-ejercicio1-explicacion">
                <h1>
                    Diseñar el pseudocódigo que permita calcular la suma total
                    de diez números ingresados por el usuario mediante una
                    estructura de control repetitiva. Este algoritmo inicializa
                    un acumulador en cero y un contador para ejecutar un ciclo
                    iterativo que se repite diez veces, solicitando en cada
                    vuelta la entrada de un valor numérico que se suma
                    progresivamente al total acumulado, incrementando el
                    contador en cada paso hasta finalizar la condición del bucle
                    y mostrar en pantalla el resultado final de la suma de todos
                    los elementos procesados.
                </h1>
            </div>
            {/* ================= BANCO ================= */}
            <div>
                <br />
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <h3 style={{ color: 'white', margin: 0 }}>
                        Banco de líneas
                    </h3>
                </div>
                <br />
                <div
                    style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '12px',
                        minHeight: '90px',
                        alignContent: 'flex-start',
                        justifyContent: 'center',
                    }}
                >
                    {available.map((line) => (
                        <div
                            key={line.id}
                            onClick={() => addLine(line)}
                            style={{
                                ...cardStyle,
                                backgroundColor: '#f8fafc',
                                height: '35px',
                                display: 'flex',
                                alignItems: 'center',
                                overflow: 'hidden',
                            }}
                            title="Click para enviar a Construcción"
                        >
                            <span style={codeTextStyle}>{line.content}</span>
                        </div>
                    ))}
                </div>
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
                                width: '50vw',
                                height: '70vh',
                                margin: '0 auto',
                                padding: '20px',
                                borderRadius: '16px',
                                background: '#ffffff',
                                border: '2px dashed #cbd5e1',
                                overflowY: 'auto',
                                boxSizing: 'border-box',
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
                                            title="Click para devolver al Banco"
                                            style={{
                                                ...cardStyle,
                                                marginBottom: '10px',
                                                border: '1px solid #3b82f6',
                                                height: '40px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                overflow: 'hidden',
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
            <br />
            <br />
            <br />
        </div>
    );
};

export default EjercicioP4Laptop;
