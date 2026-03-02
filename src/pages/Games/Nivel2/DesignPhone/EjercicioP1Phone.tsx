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

const EjercicioP1Phone: React.FC = () => {
    const [available, setAvailable] = useState<CodeLine[]>(initialCode);
    const [selected, setSelected] = useState<CodeLine[]>([]);
    const navigate = useNavigate();

    const returnDashboard = () => navigate("/dashboard");

    const addLine = (line: CodeLine) => {
        setAvailable((prev) => prev.filter((x) => x.id !== line.id));
        setSelected((prev) => [...prev, line]);
    };

    const returnToBank = (line: CodeLine) => {
        setSelected((prev) => prev.filter((x) => x.id !== line.id));
        setAvailable((prev) => [...prev, line]);
    };

    const onDragEnd = (result: DropResult) => {
        if (!result.destination) return;
        setSelected((prev) => {
            const items = [...prev];
            const [moved] = items.splice(result.source.index, 1);
            items.splice(result.destination!.index, 0, moved);
            return items;
        });
    };

    const verificarRespuestaPseudo = (resultados: boolean[]) => {
        const pasos = selected.map((line, index) => ({
            texto: line.content,
            estado: resultados[index] ?? false,
        }));

        // ✅ CORREGIDO: sin indentación interna que empuje el texto
        // const htmlContenido = `
        // <div style="display:flex;flex-direction:column;gap:6px;margin-top:8px;">
        //     ${pasos
        //         .map((p) => {
        //             const borderColor = p.estado ? "#16a34a" : "#dc2626";
        //             return `<div style="
        //                 border:2px solid ${borderColor};
        //                 border-radius:6px;
        //                 padding:6px 8px;
        //                 width:100%;
        //                 box-sizing:border-box;
        //                 font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Courier New', monospace;
        //                 white-space: pre-wrap;
        //                 word-break: break-word;
        //                 font-size: 12px;
        //                 color:#000;
        //                 background:#fff;
        //             ">${p.texto}</div>`;
        //         })
        //         .join("")}
        // </div>
        // `;
        const htmlContenido = `
  <div style="
      display:flex;
      flex-direction:column;
      gap:6px;
      margin-top:8px;
      text-align:left;           /* 🔥 fuerza izquierda */
  ">
    ${pasos
        .map((p) => {
            const borderColor = p.estado ? "#16a34a" : "#dc2626";
            return `<div style="
                border:2px solid ${borderColor};
                border-radius:6px;
                padding:6px 8px;
                width:100%;
                box-sizing:border-box;

                font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Courier New', monospace;
                white-space: pre;          /* ✅ respeta espacios EXACTO como laptop */
                text-align:left;           /* 🔥 evita centrado */
                
                overflow-x:auto;           /* ✅ si es largo, scroll horizontal */
                overflow-y:hidden;
                -webkit-overflow-scrolling: touch;

                font-size: 12px;
                color:#000;
                background:#fff;
            ">${p.texto}</div>`;
        })
        .join("")}
  </div>
`;

        const todoCorrecto = resultados.length > 0 && resultados.every(Boolean);

        if (todoCorrecto) {
            Swal.fire({
                title: "Ejercicio completado",
                icon: "success",
                iconColor: "green",
                width: "95%",
                padding: "12px",
                heightAuto: false,
                confirmButtonText: "Calcular",
                showCancelButton: true,
                cancelButtonText: "Cerrar",
                customClass: {
                    confirmButton: "btn-semitransparente",
                    cancelButton: "btn-cierre",
                },
                html: `
                <div style="padding:4px;">
                    <div style="max-height:40vh;overflow-y:auto;">
                        ${htmlContenido}
                    </div>

                    <div style="
                        margin-top:10px;
                        padding-top:10px;
                        border-top:1px solid #e5e7eb;
                        display:flex;
                        flex-direction:column;
                        gap:8px;
                        text-align:left;
                    ">
                        <div style="font-weight:700;color:#000;font-size:13px;">
                            Prueba el algoritmo (2 enteros):
                        </div>

                        <label style="color:#000;font-size:12px;">num1</label>
                        <input
                            id="swal-num1"
                            type="number"
                            step="1"
                            class="swal2-input"
                            style="margin:0;width:100%;height:40px;font-size:14px;"
                            placeholder="Ej: 5"
                        />

                        <label style="color:#000;font-size:12px;">num2</label>
                        <input
                            id="swal-num2"
                            type="number"
                            step="1"
                            class="swal2-input"
                            style="margin:0;width:100%;height:40px;font-size:14px;"
                            placeholder="Ej: 7"
                        />
                    </div>
                </div>
                `,
                preConfirm: () => {
                    const num1 = Number(
                        (
                            document.getElementById(
                                "swal-num1",
                            ) as HTMLInputElement
                        )?.value,
                    );
                    const num2 = Number(
                        (
                            document.getElementById(
                                "swal-num2",
                            ) as HTMLInputElement
                        )?.value,
                    );

                    if (Number.isNaN(num1) || Number.isNaN(num2)) {
                        Swal.showValidationMessage("Completa ambos números.");
                        return;
                    }

                    if (!Number.isInteger(num1) || !Number.isInteger(num2)) {
                        Swal.showValidationMessage("Solo enteros.");
                        return;
                    }

                    return { num1, num2, suma: num1 + num2 };
                },
            }).then(async (r) => {
                if (!r.isConfirmed || !r.value) return;

                await Swal.fire({
                    title: "Resultado",
                    icon: "success",
                    width: "92%",
                    padding: "12px",
                    html: `
                        <div style="color:#000;text-align:left;font-size:14px;">
                            <div><b>num1:</b> ${r.value.num1}</div>
                            <div><b>num2:</b> ${r.value.num2}</div>
                            <div style="margin-top:10px;font-size:16px;">
                                <b>resultado:</b> ${r.value.suma}
                            </div>
                        </div>
                    `,
                });
            });
        } else {
            Swal.fire({
                title: "Ejercicio incompleto",
                icon: "error",
                iconColor: "red",
                width: "95%",
                padding: "12px",
                html: `<div style="max-height:55vh;overflow-y:auto;">${htmlContenido}</div>`,
            });
        }
    };

    const printOrder = () => {
        const ids = selected.map((line) => line.id);
        const resultados: boolean[] = verificarResultadoPseudocodigo1(ids);
        verificarRespuestaPseudo(resultados);
    };

    const cardStyle: React.CSSProperties = {
        padding: "10px",
        borderRadius: "10px",
        fontSize: "13px",
        fontWeight: 500,
        color: "#111",
        backgroundColor: "#ffffff",
        border: "1px solid #e2e8f0",
        boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
        cursor: "pointer",
    };

    const codeTextStyle: React.CSSProperties = {
        whiteSpace: "pre",
        fontFamily:
            "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Courier New', monospace",
    };

    return (
        <div>
            <div
                style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    padding: "10px 15px",
                }}
            >
                <svg
                    fill="#E11919"
                    onClick={returnDashboard}
                    width="35px"
                    height="35px"
                    viewBox="0 0 32 32"
                    style={{ cursor: "pointer" }}
                >
                    <path d="M10.771 8.518c-1.144 0.215-2.83 2.171-2.086 2.915l4.573 4.571-4.573 4.571c-0.915 0.915 1.829 3.656 2.744 2.742l4.573-4.571 4.573 4.571c0.915 0.915 3.658-1.829 2.744-2.742l-4.573-4.571 4.573-4.571c0.915-0.915-1.829-3.656-2.744-2.742l-4.573 4.571-4.573-4.571z" />
                </svg>
            </div>

            <div style={{ textAlign: "center", marginBottom: "10px" }}>
                <h3 style={{ color: "white" }}>Banco de líneas</h3>
            </div>

            <div
                style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "10px",
                    justifyContent: "center",
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

            <div style={{ textAlign: "center", margin: "20px 0" }}>
                <button
                    onClick={printOrder}
                    className="button-execute-flowchart"
                >
                    Ejecutar
                </button>
            </div>

            <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="builder">
                    {(drop) => (
                        <section
                            ref={drop.innerRef}
                            {...drop.droppableProps}
                            style={{
                                width: "95vw",
                                height: "65vh",
                                margin: "0 auto",
                                padding: "15px",
                                borderRadius: "16px",
                                background: "#ffffff",
                                border: "2px dashed #cbd5e1",
                                overflowY: "auto",
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
                                                marginBottom: "8px",
                                                border: "1px solid #3b82f6",
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

export default EjercicioP1Phone;
