import React, { useState } from "react";
import GridLayout from "react-grid-layout";
import type { Layout } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

interface Widget {
    id: number;
    content: string;
}

const GRID_COLS = 10;
const GRID_ROWS = 10;
const CELL_SIZE = 100;
const WIDGET_SCALE = 1; // 80% del tamaño de la celda

const initialWidgets: Widget[] = [
    {
        id: 1,
        content:
            "https://i.imgur.com/YmsczfQ.png",
    },
    {
        id: 2,
        content:
            "https://i.imgur.com/nHPckYa.png",
    },
    {
        id: 3,
        content:
            "https://i.imgur.com/U7gCPZR.png",
    },
    {
        id: 4,
        content:
            "https://i.imgur.com/al2pYOM.png",
    },
    {
        id: 5,
        content:
            "https://i.imgur.com/xbDLiJk.png",
    },
    {
        id: 6,
        content:
            "https://i.imgur.com/hNwMHFb.png",
    },
    {
        id: 7,
        content:
            "https://i.imgur.com/kJKR7Go.png",
    },
    {
        id: 8,
        content:
            "https://i.imgur.com/b85sjC5.png",
    },
    {
        id: 9,
        content:
            "https://i.imgur.com/kJKR7Go.png",
    },
    {
        id: 10,
        content:
            "https://i.imgur.com/kJKR7Go.png",
    },
    {
        id: 11,
        content:
            "https://i.imgur.com/kJKR7Go.png",
    },
    {
        id: 12,
        content:
            "https://i.imgur.com/ArI0AkT.png",
    },
];

const ExerciseRGL: React.FC = () => {
    const [layout, setLayout] = useState<Layout[]>(
        initialWidgets.map((w, idx) => ({
            i: w.id.toString(),
            x: idx % GRID_COLS,
            y: 0,
            w: 1,
            h: 1,
        }))
    );

    const imprimirPosiciones = () => {
        console.log("📋 Posiciones de widgets:");
        layout.forEach((l) => {
            console.log(`Widget ${l.i} → Columna: ${l.x}, Fila: ${l.y}`);
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

            <GridLayout
                layout={layout}
                cols={GRID_COLS}
                rowHeight={CELL_SIZE}
                width={GRID_COLS * CELL_SIZE}
                onLayoutChange={(newLayout) => setLayout(newLayout)}
                isResizable={true}
                compactType={null}
                preventCollision={true}
                style={{
                    background: "white",
                    border: "10px solid #000000ff",
                    padding: "4px",
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
                                width: CELL_SIZE * WIDGET_SCALE,
                                height: CELL_SIZE * WIDGET_SCALE,
                                objectFit: "contain",
                            }}
                        />
                    </div>
                ))}
            </GridLayout>
        </div>
    );
};

export default ExerciseRGL;
