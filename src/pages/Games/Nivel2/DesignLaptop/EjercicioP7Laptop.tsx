import React, { useState, useContext } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { verificarResultadoPseudocodigo7 } from '../VerificarResultadoPseudo';
import { TokenContext } from '../../../../Context/TokenContext';
import { incrementarPuntuacionApi } from '../../../../api/usuarioApi';
import { ejerciciosId } from '../../../../data/ejercicios';

interface CodeLine {
    id: string;
    content: string;
}

const initialCode: CodeLine[] = [
    { id: '1', content: 'Proceso TablaDeMultiplicar' },
    { id: '2', content: '    Definir numero, i Como Entero' },
    {
        id: '3',
        content:
            '    Escribir "Ingrese un número entre 1 y 10 para ver su tabla de multiplicar:"',
    },
    { id: '4', content: '    Leer numero' },
    { id: '5', content: '    Mientras numero < 1 O numero > 10 Hacer' },
    {
        id: '6',
        content:
            '        Escribir "Error: El número debe estar entre 1 y 10. Intente nuevamente."',
    },
    { id: '7', content: '        Leer numero' },
    { id: '8', content: '    FinMientras' },
    { id: '9', content: '    Escribir ""' },
    { id: '10', content: '    Escribir "Tabla del ", numero, ":"' },
    { id: '11', content: '    Para i <- 1 Hasta 10 Hacer' },
    {
        id: '12',
        content: '        Escribir numero, " x ", i, " = ", numero * i',
    },
    { id: '13', content: '    FinPara' },
    { id: '14', content: 'FinProceso' },
];

const EjercicioP7Laptop: React.FC = () => {
    const [available, setAvailable] = useState<CodeLine[]>(initialCode);
    const [selected, setSelected] = useState<CodeLine[]>([]);
    const navigate = useNavigate();
    const [counterRate, setcounterRate] = useState<number>(1);
    const { claveAcceso } = useContext(TokenContext);

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
                        font-size:13px;
                        color:#000000;
                        background:#ffffff;
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
                confirmButtonText: 'Simular tabla',
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
                        margin-top:14px;
                        padding-top:12px;
                        border-top:1px solid #e5e7eb;
                        text-align:left;
                        color:#000;
                        font-size:14px;
                        line-height:1.5;
                    ">
                        Ingresa un número entre 1 y 10.<br/>
                        El programa validará que esté en ese rango y mostrará su tabla de multiplicar.
                    </div>
                </div>
                `,
            });

            await IncrementarPuntuacionEjercicio();

            if (!primerSwal.isConfirmed) return;

            let numero = 0;

            // Validación del número
            while (true) {
                const { value } = await Swal.fire({
                    title: 'Ingrese un número',
                    html: `
                    <div style="color:#000; text-align:left; font-size:14px;">
                        Ingresa un número entre <b>1 y 10</b>
                    </div>
                    `,
                    input: 'number',
                    inputAttributes: {
                        step: '1',
                        inputmode: 'numeric',
                    },
                    inputPlaceholder: 'Ej: 7',
                    width: '40%',
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
                        if (Number.isNaN(n) || !Number.isInteger(n)) {
                            Swal.showValidationMessage(
                                'Solo se permiten números enteros.'
                            );
                            return;
                        }
                        if (n < 1 || n > 10) {
                            Swal.showValidationMessage(
                                'El número debe estar entre 1 y 10.'
                            );
                            return;
                        }
                        return n;
                    },
                });

                if (value === undefined) return;
                numero = value;
                break;
            }

            // Mostrar la tabla
            let tablaHtml = `<div style="text-align:left; font-size:14px; margin-top:10px;">`;
            tablaHtml += `<b>Tabla del ${numero}:</b><br><br>`;

            for (let i = 1; i <= 10; i++) {
                tablaHtml += `${numero} x ${i} = ${numero * i}<br>`;
            }
            tablaHtml += `</div>`;

            await Swal.fire({
                title: 'Tabla de Multiplicar',
                icon: 'success',
                width: '45%',
                confirmButtonText: 'Cerrar',
                customClass: {
                    confirmButton: 'btn-semitransparente',
                },
                html: tablaHtml,
            });
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

    const IncrementarPuntuacionEjercicio = async () => {
        if (counterRate == 1) {
            console.log('el contador es ', counterRate);
            await incrementarPuntuacionApi(claveAcceso, ejerciciosId[11]);
        }
        setcounterRate((prev) => prev + 1);
    };

    // Ejecutar verificación
    const printOrder = () => {
        const ids = selected.map((line) => line.id);
        const resultados: boolean[] = verificarResultadoPseudocodigo7(ids);

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
            <br />
            <div className="contenedor-diagramaflujo-ejercicio1-explicacion">
                <h1>
                    Diseñar un pseudocódigo que lea un número entero entre 1 y
                    10 y muestre su tabla de multiplicar del 1 al 10. Si el
                    número ingresado está fuera de rango, debe volver a pedirlo
                    hasta que sea válido.
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
        </div>
    );
};

export default EjercicioP7Laptop;
