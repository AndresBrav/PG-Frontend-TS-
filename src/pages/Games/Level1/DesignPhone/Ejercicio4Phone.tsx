import React, { useContext, useState } from 'react';
import GridLayout from 'react-grid-layout';
import type { Layout } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { useNavigate } from 'react-router-dom';
import { initialWidgetsEjercicio4 } from '../widgetsDataLevel1';
import { verificarResultadoEjercicio4 } from '../VerificarResultado';
import Swal from 'sweetalert2';
import { TokenContext } from '../../../../Context/TokenContext';
import { incrementarPuntuacionApi } from '../../../../api/usuarioApi';
import { ejerciciosId } from '../../../../data/ejercicios';
import { useTableroFijo } from '../../../../hooks/useTableroFijo';
import { BarraControlesEjercicio } from '../BarraControlesEjercicio';

const GRID_COLS = 10; // columnas fijas
const GRID_ROWS = 10; // filas fijas
const CELL_WIDTH = 100; // ancho de cada celda
const CELL_HEIGHT = 50; // alto de cada celda

const defaultLayout: Layout[] = initialWidgetsEjercicio4.map((w, idx) => ({
    i: w.id.toString(),
    x: Math.floor(idx / GRID_ROWS),
    y: idx % GRID_ROWS,
    w: 1,
    h: 1,
}));

const Ejercicio4Phone: React.FC = () => {
    const navigate = useNavigate();
    const { claveAcceso } = useContext(TokenContext);
    const [counterRate, setcounterRate] = useState<number>(1);

    const {
        layout,
        setLayout,
        cargando,
        guardando,
        guardado,
        guardarManual,
        reiniciarTablero,
    } = useTableroFijo(ejerciciosId[3], defaultLayout, claveAcceso);

    const imprimirPosiciones = () => {
        console.log('📋 Posiciones de widgets:');
        const widgetIds: number[] = [];
        const columnaWidget: number[] = [];
        const filaWidget: number[] = [];

        layout.forEach((l) => {
            widgetIds.push(Number(l.i));
            columnaWidget.push(l.x);
            filaWidget.push(l.y);
        });

        const resultado: boolean[] = verificarResultadoEjercicio4(
            widgetIds,
            columnaWidget,
            filaWidget
        );

        verificarRespuesta(resultado);
    };

    const verificarRespuesta = async (resultado: boolean[]) => {
        const pasos = [
            { imagen: 'https://i.imgur.com/8Oalgpj.png', estado: resultado[0] }, //inicio
            { imagen: 'https://i.imgur.com/G9A6r4u.png', estado: resultado[1] }, //flecha 1
            { imagen: 'https://i.imgur.com/hUCWk5Q.png', estado: resultado[2] }, //inicio variables
            { imagen: 'https://i.imgur.com/G9A6r4u.png', estado: resultado[3] }, //flecha 2
            { imagen: 'https://i.imgur.com/nigQnxc.png', estado: resultado[4] }, //leer base altura
            { imagen: 'https://i.imgur.com/G9A6r4u.png', estado: resultado[5] }, //flecha 3
            { imagen: 'https://i.imgur.com/duXzF5m.png', estado: resultado[6] }, //calcular area
            { imagen: 'https://i.imgur.com/G9A6r4u.png', estado: resultado[7] }, //flecha 4
            { imagen: 'https://i.imgur.com/I9rPg9Q.png', estado: resultado[8] }, //mostrar area
            { imagen: 'https://i.imgur.com/G9A6r4u.png', estado: resultado[9] }, //flecha 5
            { imagen: 'https://i.imgur.com/RESU9Wb.png', estado: resultado[10] }, //fin
        ];

        const htmlContenido = `
  <div style="
      display: grid; 
      grid-template-columns: repeat(3, 100px); 
      gap: 15px; 
      margin: 10px 0;
      justify-content: center;
  ">
    ${pasos
        .map((paso, index) => {
            const borderColor = paso.estado ? 'green' : 'red';
            return `
              <img src="${paso.imagen}" 
                   alt="Paso ${index + 1}" 
                   style="width:100px; height:50px; border:3px solid ${borderColor}; border-radius:6px;" />
            `;
        })
        .join('')}
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
            resultado[10] === true
        ) {
            Swal.fire({
                title: 'Ejercicio completado',
                html: `<div style="text-align:center; padding:10px;">${htmlContenido}</div>`,
                icon: 'success',
                iconColor: 'green',
                confirmButtonText: 'Siguiente',
                customClass: {
                    confirmButton: 'btn-semitransparente',
                },
                width: '90%',
            }).then((result) => {
                if (result.isConfirmed) {
                    ejecutarOtroMetodo();
                }
            });

            await IncrementarPuntuacionEjercicio();
        } else {
            Swal.fire({
                title: 'Ejercicio incompleto',
                html: `<div style="text-align:center; padding:10px;">${htmlContenido}</div>`,
                icon: 'error',
                iconColor: 'red',
                width: '90%',
                confirmButtonText: 'Cerrar',
                customClass: {
                    confirmButton: 'btn-cierre',
                },
            });
        }
    };

    const IncrementarPuntuacionEjercicio = async () => {
        if (counterRate === 1) {
            await incrementarPuntuacionApi(claveAcceso, ejerciciosId[3]);
        }
        setcounterRate((prev) => prev + 1);
    };

    const ejecutarOtroMetodo = async () => {
        navigate('/ejercicio5');
    };

    const returnDashboard = () => {
        navigate('/ejercicios');
    };

    return (
        <>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    padding: '10px 15px',
                }}
            >
                <svg
                    fill="#E11919"
                    onClick={returnDashboard}
                    width="30px"
                    height="30px"
                    viewBox="0 0 32 32"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{ cursor: 'pointer' }}
                >
                    <title>cancel</title>
                    <path d="M10.771 8.518c-1.144 0.215-2.83 2.171-2.086 2.915l4.573 4.571-4.573 4.571c-0.915 0.915 1.829 3.656 2.744 2.742l4.573-4.571 4.573 4.571c0.915 0.915 3.658-1.829 2.744-2.742l-4.573-4.571 4.573-4.571c0.915-0.915-1.829-3.656-2.744-2.742l-4.573 4.571-4.573-4.571c-0.173-0.171-0.394-0.223-0.657-0.173v0zM16 1c-8.285 0-15 6.716-15 15s6.715 15 15 15 15-6.716 15-15-6.715-15-15-15zM16 4.75c6.213 0 11.25 5.037 11.25 11.25s-5.037 11.25-11.25 11.25-11.25-5.037-11.25-11.25c0.001-6.213 5.037-11.25 11.25-11.25z"></path>
                </svg>
            </div>

            <div className="contenedor-diagramaflujo-ejercicio1">
                <h1>Diagramas de Flujo</h1>
            </div>
            <br />
            <div className="contenedor-diagramaflujo-ejercicio1-explicacion">
                <h1>
                    Diseñar el diagrama de flujo para calcular el área de un
                    triángulo.
                </h1>
            </div>

            <BarraControlesEjercicio
                onEjecutar={imprimirPosiciones}
                onGuardar={guardarManual}
                onReiniciar={reiniciarTablero}
                cargando={cargando}
                guardando={guardando}
                guardado={guardado}
            />

            <br />
            <div
                style={{
                    background: 'white',
                    width: '100%',
                    maxWidth: GRID_COLS * CELL_WIDTH,
                    height: GRID_ROWS * CELL_HEIGHT,
                    border: '5px solid #000',
                    margin: '0 auto',
                    overflowX: 'auto',
                }}
            >
                <GridLayout
                    layout={layout}
                    cols={GRID_COLS}
                    rowHeight={CELL_HEIGHT}
                    width={GRID_COLS * CELL_WIDTH}
                    margin={[0, 0]}
                    containerPadding={[0, 0]}
                    onLayoutChange={setLayout}
                    isResizable={false}
                    compactType={null}
                    preventCollision={true}
                    style={{
                        background: 'white',
                        border: '3px solid #ffffffff',
                        padding: '0px',
                    }}
                >
                    {initialWidgetsEjercicio4.map((w) => (
                        <div
                            key={w.id}
                            style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}
                        >
                            <img
                                src={w.content}
                                alt=""
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'fill',
                                }}
                            />
                        </div>
                    ))}
                </GridLayout>
            </div>
        </>
    );
};

export default Ejercicio4Phone;
