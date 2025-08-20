import React, { useState } from "react";
import GridLayout from "react-grid-layout";
import type { Layout } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { useNavigate } from "react-router-dom";

interface Widget {
    id: number;
    content: string;
}

const GRID_COLS = 10; // columnas fijas
const GRID_ROWS = 10; // filas fijas
const CELL_WIDTH = 200; // ancho de cada celda
const CELL_HEIGHT = 100; // alto de cada celda
/* const CELL_WIDTH = 150; // ancho de cada celda
const CELL_HEIGHT = 50; // alto de cada celda */
const WIDGET_SCALE = 1; // escala de imagen

const initialWidgets: Widget[] = [
    { id: 1, content: "https://i.imgur.com/yxr4QMR.png" },
    { id: 2, content: "https://i.imgur.com/2n11hJn.png" },
    { id: 3, content: "https://i.imgur.com/DtUtPZK.png" },
    { id: 4, content: "https://i.imgur.com/YmsczfQ.png" },
    { id: 5, content: "https://i.imgur.com/hgPQ06G.png" },
    { id: 6, content: "https://i.imgur.com/oRp6iv2.png" },
    { id: 7, content: "https://i.imgur.com/BUGBEOc.png" },
    { id: 8, content: "https://i.imgur.com/hNUaZS0.jpeg" },
    { id: 9, content: "https://i.imgur.com/hNUaZS0.jpeg" },
    { id: 10, content: "https://i.imgur.com/hNUaZS0.jpeg" },
    { id: 11, content: "https://i.imgur.com/Now9q9e.png" },
    { id: 12, content: "https://i.imgur.com/iuyJU46.png" },
    { id: 13, content: "https://i.imgur.com/9as8FXr.png" },
    { id: 14, content: "https://i.imgur.com/BUGBEOc.png" },
    { id: 15, content: "https://i.imgur.com/BUGBEOc.png" },
    { id: 16, content: "https://i.imgur.com/BUGBEOc.png" },
];

const ExerciseRGL: React.FC = () => {
    const navigate = useNavigate(); // Hook que te da la función navigate

    const [layout, setLayout] = useState<Layout[]>(
        initialWidgets.map((w, idx) => ({
            i: w.id.toString(),
            x: Math.floor(idx / GRID_ROWS), // columna
            y: idx % GRID_ROWS, // fila dentro de la columna
            w: 1,
            h: 1,
        }))
    );

    const imprimirPosiciones = () => {
        console.log("📋 Posiciones de widgets:");
        layout.forEach((l) => {
            console.log(
                `Widget ${l.i} → Columna: ${l.x}, Fila: ${l.y}, Ancho: ${l.w}, Alto: ${l.h}`
            );
        });
    };

    const returnDashboard = () => {
        navigate("/dashboard");
    };

    return (
        <>
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
                    width="30px"
                    height="30px"
                    viewBox="0 0 32 32"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{
                        cursor: "pointer",
                    }}
                >
                    <title>cancel</title>
                    <path d="M10.771 8.518c-1.144 0.215-2.83 2.171-2.086 2.915l4.573 4.571-4.573 4.571c-0.915 0.915 1.829 3.656 2.744 2.742l4.573-4.571 4.573 4.571c0.915 0.915 3.658-1.829 2.744-2.742l-4.573-4.571 4.573-4.571c0.915-0.915-1.829-3.656-2.744-2.742l-4.573 4.571-4.573-4.571c-0.173-0.171-0.394-0.223-0.657-0.173v0zM16 1c-8.285 0-15 6.716-15 15s6.715 15 15 15 15-6.716 15-15-6.715-15-15-15zM16 4.75c6.213 0 11.25 5.037 11.25 11.25s-5.037 11.25-11.25 11.25-11.25-5.037-11.25-11.25c0.001-6.213 5.037-11.25 11.25-11.25z"></path>
                </svg>
            </div>

            <div className="contenedor-diagramaflujo-ejercicio1">
                <h1>Diagramas de Flujo</h1>
            </div>

            <div className="contenedor-diagramaflujo-ejercicio1-explicacion">
                <h1>
                    Diseñar el diagrama de flujo que recibe 2 numeros e imprime
                    si son iguales y si no son iguales
                </h1>
            </div>

            <div className="contenedor-diagramaflujo-boton">
                <button
                    onClick={imprimirPosiciones}
                    className="button-execute-flowchart"
                >
                    <h1>Ejecutar</h1>
                </button>
            </div>

            <div
                style={{
                    background: "white",
                    width: GRID_COLS * CELL_WIDTH,
                    height: GRID_ROWS * CELL_HEIGHT,
                    border: "5px solid #000",
                }}
            >
                <GridLayout
                    layout={layout}
                    cols={GRID_COLS}
                    rowHeight={CELL_HEIGHT}
                    width={GRID_COLS * CELL_WIDTH}
                    margin={[0, 0]}
                    containerPadding={[0, 0]}
                    onLayoutChange={(newLayout) => setLayout(newLayout)}
                    isResizable={true}
                    compactType={null}
                    preventCollision={true}
                    style={{
                        background: "white",
                        border: "3px solid #ffffffff",
                        padding: "0px",
                    }}
                >
                    {initialWidgets.map((w) => (
                        <div
                            key={w.id}
                            style={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                            }}
                        >
                            <img
                                src={w.content}
                                alt=""
                                style={{
                                    width: CELL_WIDTH * WIDGET_SCALE,
                                    height: CELL_HEIGHT * WIDGET_SCALE,
                                    objectFit: "contain",
                                }}
                            />
                        </div>
                    ))}
                </GridLayout>
            </div>
        </>
    );
};

export default ExerciseRGL;


