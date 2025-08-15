/* import React, { useEffect, useRef } from "react";
import { GridStack } from "gridstack";
import "gridstack/dist/gridstack.min.css";

const Exercise1: React.FC = () => {
    const gridRef = useRef<GridStack | null>(null); // referencia para usar el grid luego

    useEffect(() => {
        const grid = GridStack.init({ cellHeight: 50, column: 6 });
        gridRef.current = grid;

        // Representación de figuras geométricas usando texto
        const figuras = [
            "■", // cuadrado
            "▲", // triángulo
            "●", // círculo
            "◆", // rombo
            "■ ■", // cuadrado doble
            "▲ ▲", // triángulo doble
            "● ● ●", // tres círculos
            "◆ ◆", // dos rombos
        ];

        figuras.forEach((figura, i) => {
            grid.addWidget({
                x: i % 6,
                y: Math.floor(i / 6),
                w: 1,
                h: 1,
                content: figura
            });
        });
    }, []);

    // Función para mostrar filas agrupadas
    const mostrarFilas = () => {
        const grid = gridRef.current;
        if (!grid) return;

        const ordenados = [...grid.engine.nodes].sort(
            (a, b) => (a.y ?? 0) - (b.y ?? 0) || (a.x ?? 0) - (b.x ?? 0)
        );

        const filas: Record<number, string[]> = {};
        ordenados.forEach((item) => {
            const texto = item.el?.textContent?.trim() || "";
            const fila = item.y ?? 0;
            if (!filas[fila]) filas[fila] = [];
            filas[fila].push(texto);
        });

        console.log("Widgets agrupados por fila:");
        Object.keys(filas).forEach((fila) =>
            console.log(`Fila ${fila}:`, filas[parseInt(fila)].join(", "))
        );
    };

    return (
        <div>
            <div className="grid-stack"></div>
            <button onClick={mostrarFilas} style={{ marginTop: "20px" }}>
                Mostrar filas
            </button>
        </div>
    );
};

export default Exercise1;
 */

import React, { useState } from "react";

interface Widget {
    id: number;
    content: string;
    x: number;
    y: number;
}

const Exercise1: React.FC = () => {
    const columnas = 6;
    const filas = 4;

    const [widgets, setWidgets] = useState<Widget[]>([
        { id: 1, content: "■", x: 0, y: 0 },
        { id: 2, content: "▲", x: 1, y: 0 },
        { id: 3, content: "●", x: 2, y: 0 },
        { id: 4, content: "◆", x: 3, y: 0 },
    ]);

    const [draggingId, setDraggingId] = useState<number | null>(null);

    const handleDragStart = (id: number) => {
        setDraggingId(id);
    };

    const handleDrop = (x: number, y: number) => {
        if (draggingId === null) return;

        setWidgets((prev) =>
            prev.map((w) => (w.id === draggingId ? { ...w, x, y } : w))
        );

        setDraggingId(null);
    };

    const mostrarFilas = () => {
        const filasMap: Record<number, string[]> = {};
        widgets.forEach((w) => {
            if (!filasMap[w.y]) filasMap[w.y] = [];
            filasMap[w.y].push(w.content);
        });

        console.log("Widgets agrupados por fila:");
        Object.keys(filasMap).forEach((fila) =>
            console.log(`Fila ${fila}:`, filasMap[parseInt(fila)].join(", "))
        );
    };

    return (
        <div>
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: `repeat(${columnas}, 60px)`,
                    gridTemplateRows: `repeat(${filas}, 60px)`,
                    gap: "5px",
                    border: "2px solid #333",
                    width: "max-content",
                    userSelect: "none",
                }}
            >
                {Array.from({ length: filas }).map((_, rowIndex) =>
                    Array.from({ length: columnas }).map((_, colIndex) => {
                        const widget = widgets.find(
                            (w) => w.x === colIndex && w.y === rowIndex
                        );
                        return (
                            <div
                                key={`${colIndex}-${rowIndex}`}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={() => handleDrop(colIndex, rowIndex)}
                                style={{
                                    width: "60px",
                                    height: "60px",
                                    border: "1px solid #ccc",
                                    background: "#f9f9f9",
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                }}
                            >
                                {widget && (
                                    <div
                                        draggable
                                        onDragStart={() =>
                                            handleDragStart(widget.id)
                                        }
                                        style={{
                                            width: "100%",
                                            height: "100%",
                                            background: "#fff",
                                            border: "2px solid #333",
                                            display: "flex",
                                            justifyContent: "center",
                                            alignItems: "center",
                                            fontSize: "24px",
                                            cursor: "grab",
                                        }}
                                    >
                                        {widget.content}
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
            <button onClick={mostrarFilas} style={{ marginTop: "20px" }}>
                Mostrar filas
            </button>
        </div>
    );
};

export default Exercise1;
