import React, { useState, useRef } from "react";

interface Widget {
    id: number;
    content: string;
    x: number; // columna
    y: number; // fila
}

const GRID_COLS = 5; // 5 columnas
const GRID_ROWS = 10; // 10 filas
const CELL_SIZE = 70;
const WIDGET_SCALE = 0.8; // 80% del tamaño de la celda

const Exercise1: React.FC = () => {
    const [widgets, setWidgets] = useState<Widget[]>([
        {
            id: 1,
            content:
                "https://www.smartdraw.com/flowchart/img/start-end-flowchart-symbol.png",
            x: 0,
            y: 0,
        },
        {
            id: 2,
            content:
                "https://www.smartdraw.com/flowchart/img/action-process-flowchart-symbol.png",
            x: 1,
            y: 0,
        },
        {
            id: 3,
            content:
                "https://www.smartdraw.com/flowchart/img/document-flowchart-symbol.png",
            x: 2,
            y: 0,
        },
        {
            id: 4,
            content:
                "https://www.smartdraw.com/flowchart/img/decision-flowchart-symbol.png",
            x: 3,
            y: 0,
        },
    ]);

    const [draggingId, setDraggingId] = useState<number | null>(null);
    const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(
        null
    );
    const gridRef = useRef<HTMLDivElement>(null);

    const startDrag = (id: number, clientX: number, clientY: number) => {
        setDraggingId(id);
        setDragPos({ x: clientX, y: clientY });
    };

    const moveDrag = (clientX: number, clientY: number) => {
        if (draggingId !== null) {
            setDragPos({ x: clientX, y: clientY });
        }
    };

    const endDrag = () => {
        if (draggingId === null || dragPos === null || !gridRef.current) return;

        const rect = gridRef.current.getBoundingClientRect();
        const relX = dragPos.x - rect.left;
        const relY = dragPos.y - rect.top;

        const gridX = Math.max(
            0,
            Math.min(GRID_COLS - 1, Math.floor(relX / CELL_SIZE))
        );
        const gridY = Math.max(
            0,
            Math.min(GRID_ROWS - 1, Math.floor(relY / CELL_SIZE))
        );

        setWidgets((prev) =>
            prev.map((w) =>
                w.id === draggingId ? { ...w, x: gridX, y: gridY } : w
            )
        );

        setDraggingId(null);
        setDragPos(null);
    };

    const imprimirPosiciones = () => {
        console.log("📋 Posiciones de widgets:");
        widgets.forEach((w) => {
            console.log(`Widget ${w.id} → Columna: ${w.x}, Fila: ${w.y}`);
        });
    };

    return (
        <div>
            <button
                onClick={imprimirPosiciones}
                style={{
                    marginBottom: "10px",
                    padding: "6px 12px",
                    cursor: "pointer",
                }}
            >
                Imprimir posiciones
            </button>

            <div
                ref={gridRef}
                style={{
                    position: "relative",
                    width: GRID_COLS * CELL_SIZE,
                    height: GRID_ROWS * CELL_SIZE,
                    display: "grid",
                    gridTemplateColumns: `repeat(${GRID_COLS}, ${CELL_SIZE}px)`,
                    gridTemplateRows: `repeat(${GRID_ROWS}, ${CELL_SIZE}px)`,
                    gap: "4px",
                    background: "#eee",
                    padding: "4px",
                    touchAction: "none",
                }}
                onMouseMove={(e) => moveDrag(e.clientX, e.clientY)}
                onMouseUp={endDrag}
                onTouchMove={(e) =>
                    moveDrag(e.touches[0].clientX, e.touches[0].clientY)
                }
                onTouchEnd={endDrag}
            >
                {/* Celdas vacías */}
                {Array.from({ length: GRID_ROWS * GRID_COLS }).map((_, idx) => (
                    <div
                        key={idx}
                        style={{
                            width: CELL_SIZE,
                            height: CELL_SIZE,
                            border: "1px solid #ccc",
                        }}
                    />
                ))}

                {/* Render widgets */}
                {widgets.map((w) => {
                    const isDragging = w.id === draggingId;
                    const widgetSize = CELL_SIZE * WIDGET_SCALE;

                    const posX =
                        isDragging && dragPos
                            ? Math.min(
                                  Math.max(
                                      0,
                                      dragPos.x -
                                          widgetSize / 2 -
                                          gridRef.current!.getBoundingClientRect()
                                              .left
                                  ),
                                  (GRID_COLS - 1) * CELL_SIZE +
                                      (CELL_SIZE - widgetSize)
                              )
                            : w.x * CELL_SIZE + (CELL_SIZE - widgetSize) / 2;

                    const posY =
                        isDragging && dragPos
                            ? Math.min(
                                  Math.max(
                                      0,
                                      dragPos.y -
                                          widgetSize / 2 -
                                          gridRef.current!.getBoundingClientRect()
                                              .top
                                  ),
                                  (GRID_ROWS - 1) * CELL_SIZE +
                                      (CELL_SIZE - widgetSize)
                              )
                            : w.y * CELL_SIZE + (CELL_SIZE - widgetSize) / 2;

                    return (
                        <img
                            key={w.id}
                            src={w.content}
                            alt=""
                            style={{
                                position: "absolute",
                                left: posX,
                                top: posY,
                                width: widgetSize,
                                height: widgetSize,
                                objectFit: "contain", // mantiene proporción
                                cursor: "grab",
                                transition: isDragging ? "none" : "0.2s ease",
                                zIndex: isDragging ? 1000 : 1,
                            }}
                            onMouseDown={(e) =>
                                startDrag(w.id, e.clientX, e.clientY)
                            }
                            onTouchStart={(e) =>
                                startDrag(
                                    w.id,
                                    e.touches[0].clientX,
                                    e.touches[0].clientY
                                )
                            }
                        />
                    );
                })}
            </div>
        </div>
    );
};

export default Exercise1;
