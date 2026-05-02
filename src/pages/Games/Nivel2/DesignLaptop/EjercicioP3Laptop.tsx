import React, { useContext, useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { verificarResultadoPseudocodigo3 } from '../VerificarResultadoPseudo';
import { TokenContext } from '../../../../Context/TokenContext';
import { incrementarPuntuacionApi } from '../../../../api/usuarioApi';
import { ejerciciosId } from '../../../../data/ejercicios';

interface CodeLine {
    id: string;
    content: string;
}

const initialCode: CodeLine[] = [
    { id: '1', content: 'Proceso EvaluarCalificacion' },
    { id: '2', content: '  Definir nota Como Entero' },
    {
        id: '3',
        content: '  Escribir "Ingrese la nota del estudiante (0 - 100):"',
    },
    { id: '4', content: '  Leer nota' },
    { id: '5', content: '  Si nota >= 51 Entonces' },
    { id: '6', content: '    Escribir "El estudiante APROBO la materia"' },
    { id: '7', content: '  Sino' },
    { id: '8', content: '    Si nota >= 40 Entonces' },
    { id: '9', content: '      Escribir "El estudiante esta en RECUPERACION"' },
    { id: '10', content: '    Sino' },
    { id: '11', content: '      Escribir "El estudiante REPROBO la materia"' },
    { id: '12', content: '    FinSi' },
    { id: '13', content: '  FinSi' },
    { id: '14', content: 'FinProceso' },
];

const EjercicioP3Laptop: React.FC = () => {
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

    // ✅ Similar a tu verificarRespuesta: muestra Swal con tarjetas verde/rojo

    // ✅ Similar a tu verificarRespuesta: muestra Swal con tarjetas verde/rojo
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
                    <div style="border:2px solid ${borderColor}; border-radius:6px; padding:4px 6px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono','Courier New', monospace; white-space: pre; font-size: 13px; color: #000000; background: #ffffff;">
                        ${p.texto}
                    </div>
                    `;
                })
                .join('')}
        </div>`;

        const todoCorrecto = resultados.length > 0 && resultados.every(Boolean);

        if (todoCorrecto) {
            const result = await Swal.fire({
                title: 'Ejercicio completado',
                icon: 'success',
                iconColor: 'green',
                width: '55%',
                confirmButtonText: 'Evaluar',
                showCancelButton: true,
                cancelButtonText: 'Cerrar',
                customClass: {
                    confirmButton: 'btn-semitransparente',
                    cancelButton: 'btn-cierre',
                },
                html: `
                <div style="padding:8px;">
                    ${htmlContenido}

                    <div style="margin-top: 14px; padding-top: 12px; border-top: 1px solid #e5e7eb; display: flex; flex-direction: column; gap: 10px; text-align: left;">
                        <div style="font-weight:700; color:#000;">
                            Prueba el algoritmo (ingresa la nota del estudiante):
                        </div>

                        <label style="color:#000;">nota</label>
                        <input
                            id="swal-nota"
                            type="number"
                            step="1"
                            inputmode="numeric"
                            pattern="[0-9]*"
                            class="swal2-input"
                            style="margin:0; width:100%;"
                            placeholder="Ej: 75"
                        />
                    </div>
                </div>
                `,
                focusConfirm: false,
                preConfirm: () => {
                    const notaStr = (
                        document.getElementById('swal-nota') as HTMLInputElement
                    )?.value;

                    if (!notaStr) {
                        Swal.showValidationMessage('Ingresa la nota.');
                        return;
                    }

                    const nota = Number(notaStr);

                    if (Number.isNaN(nota)) {
                        Swal.showValidationMessage('Ingresa una nota válida.');
                        return;
                    }

                    if (!Number.isInteger(nota)) {
                        Swal.showValidationMessage(
                            'Solo se permiten notas enteras.'
                        );
                        return;
                    }

                    if (nota < 0 || nota > 100) {
                        Swal.showValidationMessage(
                            'La nota debe estar entre 0 y 100.'
                        );
                        return;
                    }

                    return { nota };
                },
            });

            await IncrementarPuntuacionEjercicio();

            if (result.isConfirmed && result.value) {
                const { nota } = result.value;
                await mostrarResultadoCalificacion(nota);
            }
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
            await incrementarPuntuacionApi(claveAcceso, ejerciciosId[7]);
        }
        setcounterRate((prev) => prev + 1);
    };

    // Mostrar el resultado según la nota
    const mostrarResultadoCalificacion = async (nota: number) => {
        let estado = '';

        if (nota >= 51) {
            estado = 'El estudiante APROBO la materia';
        } else if (nota >= 40) {
            estado = 'El estudiante esta en RECUPERACION';
        } else {
            estado = 'El estudiante REPROBO la materia';
        }

        await Swal.fire({
            title: 'Resultado de la evaluación',
            icon: 'success',
            width: '40%',
            confirmButtonText: 'Cerrar',
            customClass: {
                confirmButton: 'btn-semitransparente',
            },
            html: `
            <div style="color:#000; font-size:14px; text-align:left;">
                <div style="margin-bottom:8px;">
                    <b>Nota ingresada:</b> ${nota}
                </div>
                <div style="margin-top:12px; font-size:16px;">
                    <b>${estado}</b>
                </div>
            </div>
            `,
        });
    };

    // Ejecutar verificación
    const printOrder = () => {
        // Crear nuevo arreglo solo con los IDs
        const ids = selected.map((line) => line.id);

        // Validar con tu función
        const resultados: boolean[] = verificarResultadoPseudocodigo3(ids);

        console.log('IDs en orden:', ids);
        console.log('Resultados:', resultados);

        // Mostrar Swal estilo flowchart
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

    // ✅ Estilo SOLO para el texto, para respetar espacios
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
                    Diseñar el pseudocódigo que permita evaluar el estado
                    académico de un estudiante en función de una nota numérica
                    ingresada en un rango de 0 a 100. Este algoritmo solicita al
                    usuario la calificación obtenida y utiliza una estructura
                    condicional anidada para determinar la situación del alumno;
                    el programa verifica primero si la nota es igual o superior
                    a 51 para declarar al estudiante como aprobado, pero en caso
                    de no alcanzar ese puntaje, evalúa si la nota es igual o
                    mayor a 40 para asignarle un estado de recuperación, dejando
                    como resultado final la reprobación únicamente para aquellos
                    puntajes que se encuentren por debajo de este último límite.
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

export default EjercicioP3Laptop;
