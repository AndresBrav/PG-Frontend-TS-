import React, { useEffect, useRef } from "react";
import { GridStack } from "gridstack";
import "gridstack/dist/gridstack.min.css";

const Exercise1: React.FC = () => {
    const gridContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!gridContainerRef.current) return;

        // Inicializamos GridStack sobre el div referenciado
        const grid = GridStack.init(
            { cellHeight: 120, column: 6, float: true },
            gridContainerRef.current
        );

        const imageUrls = [
            "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Google_Chrome_icon_%28February_2022%29.svg/800px-Google_Chrome_icon_%28February_2022%29.svg.png",
            "https://www.smartdraw.com/flowchart/img/start-end-flowchart-symbol.png",
            "https://www.smartdraw.com/flowchart/img/start-end-flowchart-symbol.png",
            "https://www.smartdraw.com/flowchart/img/start-end-flowchart-symbol.png",
            "https://www.smartdraw.com/flowchart/img/start-end-flowchart-symbol.png",
            "https://www.smartdraw.com/flowchart/img/start-end-flowchart-symbol.png",
            "https://www.smartdraw.com/flowchart/img/start-end-flowchart-symbol.png",
            "https://www.smartdraw.com/flowchart/img/start-end-flowchart-symbol.png",
        ];

        // Agregamos widgets con contenido inline
        imageUrls.forEach((url, i) => {
            const widget = document.createElement("div");
            widget.style.border = "1px solid #333";
            widget.style.display = "flex";
            widget.style.justifyContent = "center";
            widget.style.alignItems = "center";
            widget.style.background = "#f0f0f0";
            widget.style.width = "100%";
            widget.style.height = "100%";
            widget.style.boxSizing = "border-box";

            const img = document.createElement("img");
            img.src = url;
            img.alt = `img-${i}`;
            img.style.maxWidth = "90%";
            img.style.maxHeight = "90%";
            img.style.objectFit = "contain";

            widget.appendChild(img);

            grid.addWidget(widget, {
                x: i % 6,
                y: Math.floor(i / 6),
                w: 1,
                h: 1,
            });
        });

        // Limpiar al desmontar
        return () => grid.destroy();
    }, []);

    return (
        <div
            ref={gridContainerRef}
            className="grid-stack"
            style={{ minHeight: "500px" }}
        ></div>
    );
};

export default Exercise1;
