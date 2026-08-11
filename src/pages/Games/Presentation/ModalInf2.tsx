import React, { useState } from 'react';
import '../../../assets/styles/stylesModal/designModals.css';
import ExplicationModal from './ExplicationModal';

import Escribir from '/images/pseint/Escribir.png';
import Leer from '/images/pseint/Leer.png';
import asignar from '/images/pseint/asignar.png';
import Si from '/images/pseint/Si.png';
import Mientras from '/images/pseint/Mientras.png';
import Para from '/images/pseint/Para.png';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const Titulos = {
    a: 'Escribir',
    b: 'Leer',
    c: 'Asignar',
    d: 'Si',
    e: 'Mientras',
    f: 'Para',
} as const;

const Descripciones = {
    a: 'Nos permite mostrar en pantalla algún tipo de dato, o varios separados por una coma (,) y esos datos deben estar entre comillas ("")',
    b: 'Nos permite recibir valores por teclado y guardarlos en variables.',
    c: 'nos permite guardar un valor en una variable',
    d: 'Nos permite evaluar la propiedad de una variable, y en función de esta, realizar una acción determinada',
    e: 'Permite realizar cierta acción determinada por la condición del Mientras',
    f: 'Presenta un cierto rango de valores, y para ellos realiza una determinada acción',
};

const Enlaces = {
    a: Escribir,
    b: Leer,
    c: asignar,
    d: Si,
    e: Mientras,
    f: Para,
} as const;

const ModalInf2: React.FC<ModalProps> = ({ isOpen, onClose }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [titulo, setTitulo] = useState<string>('');
    const [images, setimages] = useState<string>('');
    const [descripcion, setDescripcion] = useState<string>('');

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
    // const manejarClick7 = () => {
    //     setTitulo(Titulos.g);
    //     setimages(Enlaces.g);
    //     setDescripcion(Descripciones.g);
    //     setIsModalOpen(true); /* abrimos el segundo modal */
    // };
    // const manejarClick8 = () => {
    //     setTitulo(Titulos.h);
    //     setimages(Enlaces.h);
    //     setDescripcion(Descripciones.h);
    //     setIsModalOpen(true); /* abrimos el segundo modal */
    // };

    return (
        <>
            <div
                style={{
                    position: 'fixed',
                    inset: 0,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 9999,
                }}
            >
                <div
                    style={{
                        background: 'rgba(24, 24, 24, 1)',
                        borderRadius: 15,
                        width: '80vw',
                        height: '80vh',
                        overflowY: 'auto',
                        border: '2px solid white',
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    {/* 🔹 Encabezado con flex */}
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
                            onClick={onClose}
                            width="30px"
                            height="30px"
                            viewBox="0 0 32 32"
                            xmlns="http://www.w3.org/2000/svg"
                            style={{
                                cursor: 'pointer',
                            }}
                        >
                            <title>cancel</title>
                            <path d="M10.771 8.518c-1.144 0.215-2.83 2.171-2.086 2.915l4.573 4.571-4.573 4.571c-0.915 0.915 1.829 3.656 2.744 2.742l4.573-4.571 4.573 4.571c0.915 0.915 3.658-1.829 2.744-2.742l-4.573-4.571 4.573-4.571c0.915-0.915-1.829-3.656-2.744-2.742l-4.573 4.571-4.573-4.571c-0.173-0.171-0.394-0.223-0.657-0.173v0zM16 1c-8.285 0-15 6.716-15 15s6.715 15 15 15 15-6.716 15-15-6.715-15-15-15zM16 4.75c6.213 0 11.25 5.037 11.25 11.25s-5.037 11.25-11.25 11.25-11.25-5.037-11.25-11.25c0.001-6.213 5.037-11.25 11.25-11.25z"></path>
                        </svg>
                    </div>

                    {/* 🔹 Contenido */}
                    <div className="contenedor-diagramaflujo-ejercicio1">
                        <h1>Sintaxis del Pseudocodigo</h1>
                    </div>
                    <br />

                    <div className="contenedor-diagramaflujo-ejercicio1-explicacion">
                        <h1>
                            El pseudocódigo describe un algoritmo usando un
                            lenguaje estructurado y parecido al español, sin
                            depender de un lenguaje de programación concreto.
                        </h1>
                    </div>

                    <br />
                    <div className="contenedor-diagramaflujo-ejercicio1-imagen-flex">
                        <img
                            src={Enlaces.a}
                            alt="Símbolo de inicio/fin del diagrama de flujo"
                            onClick={manejarClick1}
                            className="w-[90px] h-[90px] md:w-[300px] md:h-[250px] object-fill"
                        />
                        <img
                            src={Enlaces.b}
                            alt="Símbolo de inicio/fin del diagrama de flujo"
                            onClick={manejarClick2}
                            className="w-[90px] h-[90px] md:w-[300px] md:h-[250px] object-fill"
                        />
                        <img
                            src={Enlaces.c}
                            alt="Símbolo de inicio/fin del diagrama de flujo"
                            onClick={manejarClick3}
                            className="w-[90px] h-[90px] md:w-[300px] md:h-[250px] object-fill"
                        />
                        <img
                            src={Enlaces.d}
                            alt="Símbolo de inicio/fin del diagrama de flujo"
                            onClick={manejarClick4}
                            className="w-[90px] h-[90px] md:w-[300px] md:h-[250px] object-fill"
                        />
                        <img />
                        <img
                            src={Enlaces.e}
                            alt="Símbolo de inicio/fin del diagrama de flujo"
                            onClick={manejarClick5}
                            className="w-[90px] h-[90px] md:w-[300px] md:h-[250px] object-fill"
                        />
                        <img
                            src={Enlaces.f}
                            alt="Símbolo de inicio/fin del diagrama de flujo"
                            onClick={manejarClick6}
                            className="w-[90px] h-[90px] md:w-[300px] md:h-[250px] object-fill"
                        />
                        {/* <img
                            src={Enlaces.g}
                            alt="Símbolo de inicio/fin del diagrama de flujo"
                            onClick={manejarClick7}
                            className="w-[90px] h-[90px] md:w-[300px] md:h-[250px] object-fill"
                        />
                        <img
                            src={Enlaces.h}
                            alt="Símbolo de inicio/fin del diagrama de flujo"
                            onClick={manejarClick8}
                            className="w-[90px] h-[90px] md:w-[300px] md:h-[250px] object-fill"
                        /> */}
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

export default ModalInf2;
