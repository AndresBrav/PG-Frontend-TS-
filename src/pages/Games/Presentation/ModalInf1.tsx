import React, { useState } from "react";
import "../../../assets/styles/stylesDashboard/modalDesigns/informationDesign.css";
import ExplicationModal from "./ExplicationModal";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const Titulos = {
    a: "Símbolo de Inicio / Final",
    b: "Símbolo de Proceso / Acción",
    c: "Símbolo de Documento",
    d: "Símbolo de Decisión",
    e: "Símbolo de Entrada / Salida",
    f: "Símbolo de Conector",
} as const;

const Descripciones = {
    a: "El símbolo de terminación marca el punto inicial o final del sistema. Por lo general, contiene la palabra Inicio o Fin.",
    b: "Un rectangulo solo puede representar un solo paso dentro de un processo (agregar dos tazas de harina), o un subproceso completo (hacer pan) dentro de un proceso más grande.",
    c: "Un documento o informe impreso",
    d: "Un punto de decisión o ramificación. Las líneas que representan diferentes decisiones surgen de diferentes puntos del diamante.",
    e: "Representa el material o la información que entra o sale del sistema, como una orden del cliente (entrada) o un producto (salida).",
    f: "Indica que el flujo continúa donde se ha colocado un símbolo identico (que contiene la misma letra).",
};

const Enlaces = {
    a: "https://www.smartdraw.com/flowchart/img/start-end-flowchart-symbol.png",
    b: "https://www.smartdraw.com/flowchart/img/action-process-flowchart-symbol.png",
    c: "https://www.smartdraw.com/flowchart/img/document-flowchart-symbol.png",
    d: "https://www.smartdraw.com/flowchart/img/decision-flowchart-symbol.png",
    e: "https://www.smartdraw.com/flowchart/img/imput-output-flowchart-symbol.png",
    f: "https://www.smartdraw.com/flowchart/img/connector-flowchart-symbol.png",
    g: "https://www.smartdraw.com/flowchart/img/predefined-process-flowchart-symbol.png",
} as const;

const ModalInf1: React.FC<ModalProps> = ({ isOpen, onClose }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [titulo, setTitulo] = useState<string>("");
    const [images, setimages] = useState<string>("");
    const [descripcion, setDescripcion] = useState<string>("");

    if (!isOpen) return null;

    const manejarClick1 = () => {
        setTitulo(Titulos.a);
        setimages(Enlaces.a);
        setDescripcion(Descripciones.a);
        setIsModalOpen(true); /* abrimos el segundo modal */
    };
    const manejarClick2 = () => {
        setTitulo(Titulos.b);
        setimages(Enlaces.b);
        setDescripcion(Descripciones.b);
        setIsModalOpen(true); /* abrimos el segundo modal */
    };
    const manejarClick3 = () => {
        setTitulo(Titulos.c);
        setimages(Enlaces.c);
        setDescripcion(Descripciones.c);
        setIsModalOpen(true); /* abrimos el segundo modal */
    };
    const manejarClick4 = () => {
        setTitulo(Titulos.d);
        setimages(Enlaces.d);
        setDescripcion(Descripciones.d);
        setIsModalOpen(true); /* abrimos el segundo modal */
    };
    const manejarClick5 = () => {
        setTitulo(Titulos.e);
        setimages(Enlaces.e);
        setDescripcion(Descripciones.e);
        setIsModalOpen(true); /* abrimos el segundo modal */
    };
    const manejarClick6 = () => {
        setTitulo(Titulos.f);
        setimages(Enlaces.f);
        setDescripcion(Descripciones.f);
        setIsModalOpen(true); /* abrimos el segundo modal */
    };

    return (
        <>
            <div
                style={{
                    position: "fixed",
                    inset: 0,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    zIndex: 9999,
                }}
            >
                <div
                    style={{
                        background: "rgba(24, 24, 24, 1)",
                        borderRadius: 15,
                        width: "80vw",
                        height: "80vh",
                        overflowY: "auto",
                        border: "2px solid white",
                        display: "flex",
                        flexDirection: "column",
                    }}
                >
                    {/* 🔹 Encabezado con flex */}
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
                            onClick={onClose}
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

                    {/* 🔹 Contenido */}
                    <div className="contenedor-diagramaflujo-ejercicio1">
                        <h1>Diagramas de Flujo</h1>
                    </div>
                    <br />

                    <div className="contenedor-diagramaflujo-ejercicio1-explicacion">
                        <h1>
                            Un diagrama de flujo es un diagrama que describe un
                            proceso, sistema o algoritmo informático.
                        </h1>
                    </div>

                    <br />
                    <div className="contenedor-diagramaflujo-ejercicio1-imagen-flex">
                        <img
                            src={Enlaces.a}
                            alt="Símbolo de inicio/fin del diagrama de flujo"
                            onClick={manejarClick1}
                        />
                        <img
                            src={Enlaces.b}
                            alt="Símbolo de inicio/fin del diagrama de flujo"
                            onClick={manejarClick2}
                        />
                        <img
                            src={Enlaces.c}
                            alt="Símbolo de inicio/fin del diagrama de flujo"
                            onClick={manejarClick3}
                        />
                        <img
                            src={Enlaces.d}
                            alt="Símbolo de inicio/fin del diagrama de flujo"
                            onClick={manejarClick4}
                        />
                        <img
                            src={Enlaces.e}
                            alt="Símbolo de inicio/fin del diagrama de flujo"
                            onClick={manejarClick5}
                        />
                        <img
                            src={Enlaces.f}
                            alt="Símbolo de inicio/fin del diagrama de flujo"
                            onClick={manejarClick6}
                        />
                    </div>
                    <br />
                </div>
            </div>

            <ExplicationModal
                isOpenSecondModal={isModalOpen}
                onCloseSecondModal={() => setIsModalOpen(false)}
                title={titulo}
                images={images}
                descripcion={descripcion}
            ></ExplicationModal>
        </>
    );
};

export default ModalInf1;
