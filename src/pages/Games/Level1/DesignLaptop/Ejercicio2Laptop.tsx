import React, { useState } from "react";
import GridLayout from "react-grid-layout";
import type { Layout } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { useNavigate } from "react-router-dom";
import { initialWidgetsEjercicio2 } from "../widgetsDataLevel1";
import { verificarResultadoEjercicio2 } from "../VerificarResultado";
import Swal from "sweetalert2";

const GRID_COLS = 10; // columnas fijas
const GRID_ROWS = 10; // filas fijas
const CELL_WIDTH = 200; // ancho de cada celda
const CELL_HEIGHT = 100; // alto de cada celda
const WIDGET_SCALE = 1; // escala de imagen

const Ejercicio2Laptop: React.FC = () => {
    const navigate = useNavigate();

    const [layout, setLayout] = useState<Layout[]>(
        initialWidgetsEjercicio2.map((w, idx) => ({
            i: w.id.toString(),
            x: Math.floor(idx / GRID_ROWS),
            y: idx % GRID_ROWS,
            w: 1,
            h: 1,
        }))
    );

    const imprimirPosiciones = () => {
        console.log("📋 Posiciones de widgets:");
        const widgetIds: number[] = [];
        const columnaWidget: number[] = [];
        const filaWidget: number[] = [];

        layout.forEach((l) => {
            widgetIds.push(Number(l.i));
            columnaWidget.push(l.x);
            filaWidget.push(l.y);
        });

        const resultado: boolean[] = verificarResultadoEjercicio2(
            widgetIds,
            columnaWidget,
            filaWidget
        );

        /* console.log(widgetIds);
        console.log(columnaWidget);
        console.log(filaWidget); */
        console.log("el resultado es: ", resultado);

        verificarRespuesta(resultado);
    };

    const verificarRespuesta = (resultado: boolean[]) => {
        const pasos = [
            { imagen: "https://i.imgur.com/3MzUgfA.png", estado: resultado[0] }, //inicio
            { imagen: "https://i.imgur.com/v8uvFLP.png", estado: resultado[4] }, //leer n1,n2
            { imagen: "https://i.imgur.com/r8r7BIt.png", estado: resultado[2] }, //introdusca dos numeros distintos n1,n2
            { imagen: "https://i.imgur.com/oC9J3TN.png", estado: resultado[3] }, //flecha abajo 2
            { imagen: "https://i.imgur.com/oC9J3TN.png", estado: resultado[1] }, //flecha abajo 1
            { imagen: "https://i.imgur.com/cJqYyTX.png", estado: resultado[9] }, // doblada izquierda 1
            {
                imagen: "https://i.imgur.com/goRKMj3.png",
                estado: resultado[10],
            }, // n1 es mayor
            { imagen: "https://i.imgur.com/oC9J3TN.png", estado: resultado[5] }, //flecha abajo 3
            { imagen: "https://i.imgur.com/oC9J3TN.png", estado: resultado[7] }, //flecha abajo 4
            {
                imagen: "https://i.imgur.com/sFAFzl4.png",
                estado: resultado[12],
            }, // n2 es mayor
            { imagen: "https://i.imgur.com/L8yntMk.png", estado: resultado[8] }, //descicion 2
            { imagen: "https://i.imgur.com/8wCxpum.png", estado: resultado[6] }, //descicion 1
            {
                imagen: "https://i.imgur.com/Y7okYCi.png",
                estado: resultado[11],
            }, // derecha 3
            {
                imagen: "https://i.imgur.com/jnKoRnc.png",
                estado: resultado[13],
            }, // izquierda 2
            {
                imagen: "https://i.imgur.com/mt4Z8y1.png",
                estado: resultado[15],
            }, // fin
            {
                imagen: "https://i.imgur.com/Od4jxIE.png",
                estado: resultado[16],
            }, // derecha 1
            {
                imagen: "https://i.imgur.com/42u2BvY.png",
                estado: resultado[14],
            }, // derecha 4
            {
                imagen: "https://i.imgur.com/L2Z7DVd.jpeg",
                estado: resultado[17],
            }, // linea recta  1
            {
                imagen: "https://i.imgur.com/L2Z7DVd.jpeg",
                estado: resultado[18],
            }, // linea recta  2
            {
                imagen: "https://i.imgur.com/L2Z7DVd.jpeg",
                estado: resultado[19],
            }, // linea recta  3
            {
                imagen: "https://i.imgur.com/MSjy0TA.png",
                estado: resultado[20],
            }, // esquina derecha 2
        ];

        
        const htmlContenido = `
  <div style="
      display: grid; 
      grid-template-columns: repeat(3, 150px); 
      gap: 50px; 
      margin: 10px 0;
  ">
    ${pasos
        .map((paso, index) => {
            const borderColor = paso.estado ? "green" : "red";
            return `
              <img src="${paso.imagen}" 
                   alt="Paso ${index + 1}" 
                   style="width:150px; height:100px; border:4px solid ${borderColor}; border-radius:8px;" />
            `;
        })
        .join("")}
  </div>
`;

        if (
            resultado[0] === true &&
            resultado[1] === true &&
            resultado[2] === true &&
            resultado[3] === true &&
            resultado[4] === true &&
            resultado[5] === true &&
            resultado[6] === true &&
            resultado[7] === true &&
            resultado[8] === true &&
            resultado[9] === true &&
            resultado[10] === true &&
            resultado[11] === true &&
            resultado[12] === true &&
            resultado[13] === true &&
            resultado[14] === true &&
            resultado[15] === true &&
            resultado[16] === true &&
            resultado[17] === true &&
            resultado[18] === true &&
            resultado[19] === true &&
            resultado[20] === true
        ) {
            Swal.fire({
                title: "Ejercicio completado",
                html: `<div style="text-align:center; padding:10px;">${htmlContenido}</div>`,
                icon: "success",
                iconColor: "green", // Verde personalizado,
                confirmButtonText: "Siguiente",
                customClass: {
                    confirmButton: "btn-semitransparente",
                },
                width: "50%",
            }).then((result) => {
                if (result.isConfirmed) {
                    ejecutarOtroMetodo();
                }
            });
        } else {
            Swal.fire({
                title: "Ejercicio incompleto",
                html: `<div style="text-align:center; padding:10px;">${htmlContenido}</div>`,
                icon: "error",
                iconColor: "red", // Rojo personalizado
                width: "50%",
                confirmButtonText: "Cerrar", // Cambia el texto del botón
                customClass: {
                    confirmButton: "btn-cierre",
                },
            });
        }
    };

    const ejecutarOtroMetodo = () => {
        navigate("/ejercicio3");
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
                    style={{ cursor: "pointer" }}
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
                    Diseñar el diagrama de flujo que permita leer 2 números
                    diferentes y nos diga cual es el mayor de los 2 números.
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
                    width: "100%", // adaptativo
                    maxWidth: GRID_COLS * CELL_WIDTH,
                    height: GRID_ROWS * CELL_HEIGHT,
                    border: "5px solid #000",
                    margin: "0 auto",
                    overflowX: "auto", // scroll horizontal si hace falta
                }}
            >
                <GridLayout
                    layout={layout}
                    cols={GRID_COLS}
                    rowHeight={CELL_HEIGHT}
                    width={GRID_COLS * CELL_WIDTH} // react-grid-layout requiere width
                    margin={[0, 0]}
                    containerPadding={[0, 0]}
                    onLayoutChange={(newLayout) => setLayout(newLayout)}
                    isResizable={false}
                    compactType={null}
                    preventCollision={true}
                    style={{
                        background: "white",
                        border: "3px solid #ffffffff",
                        padding: "0px",
                    }}
                >
                    {initialWidgetsEjercicio2.map((w) => (
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

export default Ejercicio2Laptop;
