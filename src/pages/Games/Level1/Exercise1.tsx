import React, { useEffect, useRef } from "react";
import { GridStack } from "gridstack";
import "gridstack/dist/gridstack.min.css";
import "../../../assets/Exercise1Widgets.css";

const Exercise1: React.FC = () => {
    const gridRef = useRef<GridStack | null>(null); // referencia para usar el grid luego

    useEffect(() => {
        // Crear cuadrícula
        const grid = GridStack.init({ cellHeight: 100, column: 6 });
        gridRef.current = grid;

        // Lista de textos
        const widgets = [
            "hola", "como", "estas",
            "estoy", "bien", "gracias",
            "como", "te", "sientes"
        ];

        // Agregar widgets
        widgets.forEach((texto, i) => {
            grid.addWidget({
                x: i % 6,
                y: Math.floor(i / 6),
                w: 1,
                h: 1,
                content: `<div class="widget-box">${texto}</div>`,
            });
        });
    }, []);

    // Función para mostrar filas agrupadas
    const mostrarFilas = () => {
        const grid = gridRef.current;
        if (!grid) return;

        const ordenados = [...grid.engine.nodes]
            .sort((a, b) => (a.y ?? 0) - (b.y ?? 0) || (a.x ?? 0) - (b.x ?? 0));

        // Agrupar por fila
        const filas: Record<number, string[]> = {};
        ordenados.forEach(item => {
            const fila = item.y ?? 0;
            const texto = item.el?.textContent?.trim() || "";
            if (!filas[fila]) filas[fila] = [];
            filas[fila].push(texto);
        });

        console.log("Widgets agrupados por fila:");
        Object.keys(filas).forEach(fila =>
            console.log(`Fila ${fila}:`, filas[parseInt(fila)].join(", "))
        );
    };

    return (
        <div>
            <div className="grid-stack"></div>
            <button onClick={mostrarFilas}>Mostrar filas</button>
        </div>
    );
};

export default Exercise1;
