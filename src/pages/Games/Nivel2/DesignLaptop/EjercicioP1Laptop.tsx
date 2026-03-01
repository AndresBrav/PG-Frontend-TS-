import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import type { DropResult } from "@hello-pangea/dnd";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { verificarResultadoPseudocodigo1 } from "../VerificarResultadoPseudo";

interface CodeLine {
    id: string;
    content: string;
}

const initialCode: CodeLine[] = [
    { id: "1", content: "Proceso SumarDosNumeros" },
    { id: "4", content: "  Leer num2" },
    { id: "2", content: "  Definir num1, num2, resultado Como Entero" },
    { id: "6", content: "  Escribir resultado" },
    { id: "7", content: "FinProceso" },
    { id: "3", content: "  Leer num1" },
    { id: "5", content: "  resultado <- num1 + num2" },
];

const EjercicioP1Laptop: React.FC = () => {
    const [available, setAvailable] = useState<CodeLine[]>(initialCode);
    const [selected, setSelected] = useState<CodeLine[]>([]);
    const navigate = useNavigate();

    const returnDashboard = () => {
        navigate("/dashboard");
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
    const verificarRespuestaPseudo = (resultados: boolean[]) => {
        const pasos = selected.map((line, index) => ({
            id: line.id,
            texto: line.content,
            estado: resultados[index] ?? false,
        }));

        const htmlContenido = `
      <div style="
          display:flex;
          flex-direction:column;
          gap:6px;
          text-align:left;
          margin-top:10px;
      ">
        ${pasos
            .map((p) => {
                const borderColor = p.estado ? "#16a34a" : "#dc2626";

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
            .join("")}
      </div>
    `;

        const todoCorrecto = resultados.length > 0 && resultados.every(Boolean);

        if (todoCorrecto) {
            Swal.fire({
                title: "Ejercicio completado",
                html: `<div style="padding:8px;">${htmlContenido}</div>`,
                icon: "success",
                iconColor: "green",
                confirmButtonText: "Siguiente",
                customClass: {
                    confirmButton: "btn-semitransparente",
                },
                width: "50%",
            }).then((r) => {
                if (r.isConfirmed) {
                    navigate("/ejercicio2");
                }
            });
        } else {
            Swal.fire({
                title: "Ejercicio incompleto",
                html: `<div style="padding:8px;">${htmlContenido}</div>`,
                icon: "error",
                iconColor: "red",
                confirmButtonText: "Cerrar",
                customClass: {
                    confirmButton: "btn-cierre",
                },
                width: "50%",
            });
        }
    };

    // Ejecutar verificación
    const printOrder = () => {
        // Crear nuevo arreglo solo con los IDs
        const ids = selected.map((line) => line.id);

        // Validar con tu función
        const resultados: boolean[] = verificarResultadoPseudocodigo1(ids);

        console.log("IDs en orden:", ids);
        console.log("Resultados:", resultados);

        // Mostrar Swal estilo flowchart
        verificarRespuestaPseudo(resultados);
    };

    const cardStyle: React.CSSProperties = {
        padding: "10px 10px",
        borderRadius: "10px",
        fontSize: "13px",
        fontWeight: 500,
        color: "#111",
        backgroundColor: "#ffffff",
        border: "1px solid #e2e8f0",
        boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
        cursor: "pointer",
    };

    // ✅ Estilo SOLO para el texto, para respetar espacios
    const codeTextStyle: React.CSSProperties = {
        whiteSpace: "pre",
        fontFamily:
            "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
    };

    return (
        <div>
            {/* Botón salir */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "center",
                    padding: "10px 15px",
                }}
            >
                <svg
                    fill="#E11919"
                    onClick={returnDashboard}
                    width="35px"
                    height="35px"
                    viewBox="0 0 32 32"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{ cursor: "pointer" }}
                >
                    <title>cancel</title>
                    <path d="M10.771 8.518c-1.144 0.215-2.83 2.171-2.086 2.915l4.573 4.571-4.573 4.571c-0.915 0.915 1.829 3.656 2.744 2.742l4.573-4.571 4.573 4.571c0.915 0.915 3.658-1.829 2.744-2.742l-4.573-4.571 4.573-4.571c0.915-0.915-1.829-3.656-2.744-2.742l-4.573 4.571-4.573-4.571c-0.173-0.171-0.394-0.223-0.657-0.173v0zM16 1c-8.285 0-15 6.716-15 15s6.715 15 15 15 15-6.716 15-15-6.715-15-15-15zM16 4.75c6.213 0 11.25 5.037 11.25 11.25s-5.037 11.25-11.25 11.25-11.25-5.037-11.25-11.25c0.001-6.213 5.037-11.25 11.25-11.25z"></path>
                </svg>
            </div>

            {/* ================= BANCO ================= */}
            <div>
                <br />
                <div style={{ display: "flex", justifyContent: "center" }}>
                    <h3 style={{ color: "white", margin: 0 }}>
                        Banco de líneas
                    </h3>
                </div>
                <br />
                <div
                    style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "12px",
                        minHeight: "90px",
                        alignContent: "flex-start",
                        justifyContent: "center",
                    }}
                >
                    {available.map((line) => (
                        <div
                            key={line.id}
                            onClick={() => addLine(line)}
                            style={{
                                ...cardStyle,
                                backgroundColor: "#f8fafc",
                                height: "35px",
                                display: "flex",
                                alignItems: "center",
                                overflow: "hidden",
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
                                width: "50vw",
                                height: "70vh",
                                margin: "0 auto",
                                padding: "20px",
                                borderRadius: "16px",
                                background: "#ffffff",
                                border: "2px dashed #cbd5e1",
                                overflowY: "auto",
                                boxSizing: "border-box",
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
                                                marginBottom: "10px",
                                                border: "1px solid #3b82f6",
                                                height: "40px",
                                                display: "flex",
                                                alignItems: "center",
                                                overflow: "hidden",
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

export default EjercicioP1Laptop;
