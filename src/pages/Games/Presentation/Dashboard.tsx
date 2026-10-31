import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../../../components/layout/AppShell';
import { TokenContext } from '../../../Context/TokenContext';
import { traerJuegosCompletados } from '../../../api/usuarioApi';
import ModalInf1 from './ModalInf1';
import ModalInf2 from './ModalInf2';

const Dashboard = () => {
    const { claveAcceso } = useContext(TokenContext);
    const [juegosCompletados, setJuegosCompletados] = useState<number[]>([]);

    useEffect(() => {
        if (!claveAcceso) return;

        let activo = true;

        const cargarJuegos = async () => {
            const data = await traerJuegosCompletados(claveAcceso);
            if (activo && data) {
                setJuegosCompletados(data);
            }
        };

        void cargarJuegos();

        return () => {
            activo = false;
        };
    }, [claveAcceso]);

    const [modalAbierto, setModalAbierto] = useState(false);
    const alternarModal = () => setModalAbierto(!modalAbierto);

    const [modalAbierto2, setModalAbierto2] = useState(false);
    const alternarModal2 = () => setModalAbierto2(!modalAbierto2);

    const navigate = useNavigate();

    const irEjercicio1 = () => {
        navigate('/ejercicio1');
    };

    const irEjercicio2 = () => {
        navigate('/ejercicio2');
    };

    const irEjercicio3 = () => {
        navigate('/ejercicio3');
    };

    const irEjercicio4 = () => {
        navigate('/ejercicio4');
    };

    const irEjercicio5 = () => {
        navigate('/ejercicio5');
    };

    const irEjercicio1Pseudocodigo = () => {
        navigate('/ejercicio1-pseudocodigo');
    };

    const irEjercicio2Pseudocodigo = () => {
        navigate('/ejercicio2-pseudocodigo');
    };

    const irEjercicio3Pseudocodigo = () => {
        navigate('/ejercicio3-pseudocodigo');
    };
    const irEjercicio4Pseudocodigo = () => {
        navigate('/ejercicio4-pseudocodigo');
    };

    const irEjercicio5Pseudocodigo = () => {
        navigate('/ejercicio5-pseudocodigo');
    };

    const irEjercicio6Pseudocodigo = () => {
        navigate('/ejercicio6-pseudocodigo');
    };

    const irEjercicio7Pseudocodigo = () => {
        navigate('/ejercicio7-pseudocodigo');
    };

    const irEjercicio8Pseudocodigo = () => {
        navigate('/ejercicio8-pseudocodigo');
    };

    const irEjercicio9Pseudocodigo = () => {
        navigate('/ejercicio9-pseudocodigo');
    };

    const irEjercicio10Pseudocodigo = () => {
        navigate('/ejercicio10-pseudocodigo');
    };

    return (
        <AppShell>
            <div className="information-design-level-style-container-grid">
                <div className="item-information-design-level-style-1">
                    <h1 className="design-font-information-1">Etapa 1</h1>
                    <h1 className="design-font-information-2">
                        Diagramas de flujo
                    </h1>
                </div>
                <div className="item-information-design-level-style-2">
                    <svg
                        className="item-information-design"
                        onClick={alternarModal}
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        style={{ cursor: 'pointer' }}
                    >
                        <path
                            d="M21 16C21 18.8284 21 20.2426 20.1213 21.1213C19.2426 22 17.8284 22 15 22H9C6.17157 22 4.75736 22 3.87868 21.1213C3 20.2426 3 18.8284 3 16V8C3 5.17157 3 3.75736 3.87868 2.87868C4.75736 2 6.17157 2 9 2H15C17.8284 2 19.2426 2 20.1213 2.87868C21 3.75736 21 5.17157 21 8V12"
                            stroke="#000000"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                        />
                        <path
                            d="M8 2V6M8 22V10"
                            stroke="#000000"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                        />
                        <path
                            d="M2 12H4"
                            stroke="#000000"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                        />
                        <path
                            d="M2 16H4"
                            stroke="#000000"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                        />
                        <path
                            d="M2 8H4"
                            stroke="#000000"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                        />
                        <path
                            d="M11.5 6.5H16.5"
                            stroke="#000000"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                        />
                        <path
                            d="M11.5 10H16.5"
                            stroke="#000000"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                        />
                    </svg>
                </div>
            </div>

            {/* Modal fijo */}
            <ModalInf1 isOpen={modalAbierto} onClose={alternarModal} />

            <div className="contenedo-diagrama-flujo-primer-ejercicio">
                <div
                    className={`circle-outer-1 ${juegosCompletados.includes(1) ? 'circle-completed' : ''}`}
                    onClick={irEjercicio1}
                >
                    <div
                        className={`circle-inner ${juegosCompletados.includes(1) ? 'circle-completed' : ''}`}
                    >
                        1
                    </div>
                </div>
            </div>
            <div className="contenedo-diagrama-flujo-primer-ejercicio">
                <div
                    className={`circle-outer-2 ${juegosCompletados.includes(2) ? 'circle-completed' : ''}`}
                    onClick={irEjercicio2}
                >
                    <div
                        className={`circle-inner ${juegosCompletados.includes(2) ? 'circle-completed' : ''}`}
                    >
                        2
                    </div>
                </div>
            </div>
            <div className="contenedo-diagrama-flujo-primer-ejercicio">
                <div
                    className={`circle-outer-1 ${juegosCompletados.includes(3) ? 'circle-completed' : ''}`}
                    onClick={irEjercicio3}
                >
                    <div
                        className={`circle-inner ${juegosCompletados.includes(3) ? 'circle-completed' : ''}`}
                    >
                        3
                    </div>
                </div>
            </div>
            <div className="contenedo-diagrama-flujo-primer-ejercicio">
                <div
                    className={`circle-outer-2 ${juegosCompletados.includes(4) ? 'circle-completed' : ''}`}
                    onClick={irEjercicio4}
                >
                    <div
                        className={`circle-inner ${juegosCompletados.includes(4) ? 'circle-completed' : ''}`}
                    >
                        4
                    </div>
                </div>
            </div>
            <div className="contenedo-diagrama-flujo-primer-ejercicio">
                <div
                    className={`circle-outer-1 ${juegosCompletados.includes(5) ? 'circle-completed' : ''}`}
                    onClick={irEjercicio5}
                >
                    <div
                        className={`circle-inner ${juegosCompletados.includes(5) ? 'circle-completed' : ''}`}
                    >
                        5
                    </div>
                </div>
            </div>
            <br />

            {/* Seccion de los otros ejercicios */}
            <div className="information-design-level-style-container-grid">
                <div className="item-information-design-level-style-1">
                    <h1 className="design-font-information-1">Etapa 2</h1>
                    <h1 className="design-font-information-2">Pseudocodigo</h1>
                </div>
                <div className="item-information-design-level-style-2">
                    <svg
                        className="item-information-design"
                        onClick={alternarModal2}
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        style={{ cursor: 'pointer' }}
                    >
                        <path
                            d="M21 16C21 18.8284 21 20.2426 20.1213 21.1213C19.2426 22 17.8284 22 15 22H9C6.17157 22 4.75736 22 3.87868 21.1213C3 20.2426 3 18.8284 3 16V8C3 5.17157 3 3.75736 3.87868 2.87868C4.75736 2 6.17157 2 9 2H15C17.8284 2 19.2426 2 20.1213 2.87868C21 3.75736 21 5.17157 21 8V12"
                            stroke="#000000"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                        />
                        <path
                            d="M8 2V6M8 22V10"
                            stroke="#000000"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                        />
                        <path
                            d="M2 12H4"
                            stroke="#000000"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                        />
                        <path
                            d="M2 16H4"
                            stroke="#000000"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                        />
                        <path
                            d="M2 8H4"
                            stroke="#000000"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                        />
                        <path
                            d="M11.5 6.5H16.5"
                            stroke="#000000"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                        />
                        <path
                            d="M11.5 10H16.5"
                            stroke="#000000"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                        />
                    </svg>
                </div>
            </div>

            <ModalInf2 isOpen={modalAbierto2} onClose={alternarModal2} />

            <div className="contenedo-diagrama-flujo-primer-ejercicio">
                <div
                    className={`circle-outer-1 ${juegosCompletados.includes(6) ? 'circle-completed' : ''}`}
                    onClick={irEjercicio1Pseudocodigo}
                >
                    <div
                        className={`circle-inner ${juegosCompletados.includes(6) ? 'circle-completed' : ''}`}
                    >
                        1
                    </div>
                </div>
            </div>
            <div className="contenedo-diagrama-flujo-primer-ejercicio">
                <div
                    className={`circle-outer-2 ${juegosCompletados.includes(7) ? 'circle-completed' : ''}`}
                    onClick={irEjercicio2Pseudocodigo}
                >
                    <div
                        className={`circle-inner ${juegosCompletados.includes(7) ? 'circle-completed' : ''}`}
                    >
                        2
                    </div>
                </div>
            </div>

            <div className="contenedo-diagrama-flujo-primer-ejercicio">
                <div
                    className={`circle-outer-1 ${juegosCompletados.includes(8) ? 'circle-completed' : ''}`}
                    onClick={irEjercicio3Pseudocodigo}
                >
                    <div
                        className={`circle-inner ${juegosCompletados.includes(8) ? 'circle-completed' : ''}`}
                    >
                        3
                    </div>
                </div>
            </div>

            <div className="contenedo-diagrama-flujo-primer-ejercicio">
                <div
                    className={`circle-outer-2 ${juegosCompletados.includes(9) ? 'circle-completed' : ''}`}
                    onClick={irEjercicio4Pseudocodigo}
                >
                    <div
                        className={`circle-inner ${juegosCompletados.includes(9) ? 'circle-completed' : ''}`}
                    >
                        4
                    </div>
                </div>
            </div>
            <div className="contenedo-diagrama-flujo-primer-ejercicio">
                <div
                    className={`circle-outer-1 ${juegosCompletados.includes(10) ? 'circle-completed' : ''}`}
                    onClick={irEjercicio5Pseudocodigo}
                >
                    <div
                        className={`circle-inner ${juegosCompletados.includes(10) ? 'circle-completed' : ''}`}
                    >
                        5
                    </div>
                </div>
            </div>

            <div className="contenedo-diagrama-flujo-primer-ejercicio">
                <div
                    className={`circle-outer-2 ${juegosCompletados.includes(11) ? 'circle-completed' : ''}`}
                    onClick={irEjercicio6Pseudocodigo}
                >
                    <div
                        className={`circle-inner ${juegosCompletados.includes(11) ? 'circle-completed' : ''}`}
                    >
                        6
                    </div>
                </div>
            </div>

            <div className="contenedo-diagrama-flujo-primer-ejercicio">
                <div
                    className={`circle-outer-1 ${juegosCompletados.includes(12) ? 'circle-completed' : ''}`}
                    onClick={irEjercicio7Pseudocodigo}
                >
                    <div
                        className={`circle-inner ${juegosCompletados.includes(12) ? 'circle-completed' : ''}`}
                    >
                        7
                    </div>
                </div>
            </div>

            <div className="contenedo-diagrama-flujo-primer-ejercicio">
                <div
                    className={`circle-outer-2 ${juegosCompletados.includes(13) ? 'circle-completed' : ''}`}
                    onClick={irEjercicio8Pseudocodigo}
                >
                    <div
                        className={`circle-inner ${juegosCompletados.includes(13) ? 'circle-completed' : ''}`}
                    >
                        8
                    </div>
                </div>
            </div>

            <div className="contenedo-diagrama-flujo-primer-ejercicio">
                <div
                    className={`circle-outer-1 ${juegosCompletados.includes(14) ? 'circle-completed' : ''}`}
                    onClick={irEjercicio9Pseudocodigo}
                >
                    <div
                        className={`circle-inner ${juegosCompletados.includes(14) ? 'circle-completed' : ''}`}
                    >
                        9
                    </div>
                </div>
            </div>

            <div className="contenedo-diagrama-flujo-primer-ejercicio">
                <div
                    className={`circle-outer-2 ${juegosCompletados.includes(15) ? 'circle-completed' : ''}`}
                    onClick={irEjercicio10Pseudocodigo}
                >
                    <div
                        className={`circle-inner ${juegosCompletados.includes(15) ? 'circle-completed' : ''}`}
                    >
                        10
                    </div>
                </div>
            </div>
            <br />
        </AppShell>
    );
};

export default Dashboard;
