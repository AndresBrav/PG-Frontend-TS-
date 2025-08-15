// import React, { useState } from "react";
// import GridLayout from "react-grid-layout";
// import type { Layout } from "react-grid-layout";
// import "react-grid-layout/css/styles.css";
// import "react-resizable/css/styles.css";

// interface Widget {
//     id: number;
//     content: string;
// }

// const GRID_COLS = 5;
// const GRID_ROWS = 10;
// const CELL_SIZE = 70;
// const WIDGET_SCALE = 0.8; // 80% del tamaño de la celda

// const initialWidgets: Widget[] = [
//     {
//         id: 1,
//         content:
//             "https://www.smartdraw.com/flowchart/img/start-end-flowchart-symbol.png",
//     },
//     {
//         id: 2,
//         content:
//             "https://www.smartdraw.com/flowchart/img/action-process-flowchart-symbol.png",
//     },
//     {
//         id: 3,
//         content:
//             "https://www.smartdraw.com/flowchart/img/document-flowchart-symbol.png",
//     },
//     {
//         id: 4,
//         content:
//             "https://www.smartdraw.com/flowchart/img/decision-flowchart-symbol.png",
//     },
// ];

// const ExerciseRGL: React.FC = () => {
//     // Creamos el layout inicial
//     const [layout, setLayout] = useState<Layout[]>(
//         initialWidgets.map((w, idx) => ({
//             i: w.id.toString(),
//             x: idx % GRID_COLS,
//             y: 0,
//             w: 1,
//             h: 1,
//         }))
//     );

//     const imprimirPosiciones = () => {
//         console.log("📋 Posiciones de widgets:");
//         layout.forEach((l) => {
//             console.log(`Widget ${l.i} → Columna: ${l.x}, Fila: ${l.y}`);
//         });
//     };

//     return (
//         <div>
//             <button
//                 onClick={imprimirPosiciones}
//                 style={{
//                     marginBottom: "10px",
//                     padding: "6px 12px",
//                     cursor: "pointer",
//                 }}
//             >
//                 Imprimir posiciones
//             </button>

//             <GridLayout
//                 layout={layout}
//                 cols={GRID_COLS}
//                 rowHeight={CELL_SIZE}
//                 width={GRID_COLS * CELL_SIZE}
//                 onLayoutChange={(newLayout) => setLayout(newLayout)}
//                 isResizable={true} // Solo mover, no redimensionar
//                 compactType={null} // Evita que se reacomoden automáticamente
//                 preventCollision={true} // No se superpongan
//             >
//                 {initialWidgets.map((w) => (
//                     <div
//                         key={w.id}
//                         style={{
//                             display: "flex",
//                             justifyContent: "center",
//                             alignItems: "center",
//                         }}
//                     >
//                         <img
//                             src={w.content}
//                             alt=""
//                             style={{
//                                 width: CELL_SIZE * WIDGET_SCALE,
//                                 height: CELL_SIZE * WIDGET_SCALE,
//                                 objectFit: "contain",
//                             }}
//                         />
//                     </div>
//                 ))}
//             </GridLayout>
//         </div>
//     );
// };

// export default ExerciseRGL;
import React, { useState } from "react";
import GridLayout from "react-grid-layout";
import type { Layout } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

interface Widget {
    id: number;
    content: string;
}

const GRID_COLS = 5;
const GRID_ROWS = 10;
const CELL_SIZE = 70;
const WIDGET_SCALE = 0.8; // 80% del tamaño de la celda

const initialWidgets: Widget[] = [
    {
        id: 1,
        content:
            "https://www.smartdraw.com/flowchart/img/start-end-flowchart-symbol.png",
    },
    {
        id: 2,
        content:
            "https://www.smartdraw.com/flowchart/img/action-process-flowchart-symbol.png",
    },
    {
        id: 3,
        content:
            "https://www.smartdraw.com/flowchart/img/document-flowchart-symbol.png",
    },
    {
        id: 4,
        content:
            "https://www.smartdraw.com/flowchart/img/decision-flowchart-symbol.png",
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
                    border: "1px solid #000000ff",
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
