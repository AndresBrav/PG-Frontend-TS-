import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../../../components/layout/AppShell';
import { TokenContext } from '../../../Context/TokenContext';
import {
    traerJuegosIA,
    traerJuegosIAPseudo,
} from '../../../api/ejerciciosIA/ejercicioIAapi';
import { generarEjercicioHandler } from './generarEjercicioHandler';
import { generarEjercicioHandlerPseudo } from './generarEjercicioHandlerPseudo';
import ModalInf1 from '../Presentation/ModalInf1';
import ModalInf2 from '../Presentation/ModalInf2';

interface JuegoIA {
    id: number;
    descripcion: string;
    tipo_juego: string;
    usuario_id: number;
    completado: boolean | number;
    puntos: number;
    createdAt: string;
    updatedAt: string;
}

const DashboardIA = () => {
    const { claveAcceso } = useContext(TokenContext);
    const [juegosIA, setJuegosIA] = useState<JuegoIA[]>([]);
    const [juegosIAPseudo, setJuegosIAPseudo] = useState<JuegoIA[]>([]);

    const [modalAbierto, setModalAbierto] = useState(false);
    const alternarModal = () => setModalAbierto(!modalAbierto);

    const [modalAbierto2, setModalAbierto2] = useState(false);
    const alternarModal2 = () => setModalAbierto2(!modalAbierto2);

    const navigate = useNavigate();

    useEffect(() => {
        if (!claveAcceso) return;

        let activo = true;

        const cargarDatos = async () => {
            const [dataIA, dataIAPseudo] = await Promise.all([
                traerJuegosIA(claveAcceso),
                traerJuegosIAPseudo(claveAcceso),
            ]);

            if (!activo) return;

            if (dataIA?.juegosIA) {
                setJuegosIA(dataIA.juegosIA);
            }
            if (dataIAPseudo?.juegosIA) {
                setJuegosIAPseudo(dataIAPseudo.juegosIA);
            }
        };

        void cargarDatos();

        return () => {
            activo = false;
        };
    }, [claveAcceso]);

    const handleGenerarEjercicio = async () => {
        await generarEjercicioHandler(claveAcceso, setJuegosIA);
    };

    const handleGenerarEjercicioPseudo = async () => {
        await generarEjercicioHandlerPseudo(claveAcceso, setJuegosIAPseudo);
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

            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '20px',
                    margin: '20px 0',
                }}
            >
                <button
                    onClick={handleGenerarEjercicio}
                    style={{
                        backgroundColor: '#22C55E',
                        color: 'white',
                        border: 'none',
                        padding: '12px 30px',
                        borderRadius: '8px',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#16A34A';
                        e.currentTarget.style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#22C55E';
                        e.currentTarget.style.transform = 'scale(1)';
                    }}
                >
                    Generar Ejercicio
                </button>
            </div>

            {/* Modal fijo */}
            <ModalInf1 isOpen={modalAbierto} onClose={alternarModal} />

            {/* Mostrar juegos IA dinamicamente */}
            {juegosIA.map((juego, index) => (
                <div
                    key={juego.id}
                    className="contenedo-diagrama-flujo-primer-ejercicio"
                >
                    <div
                        className={`${
                            index % 2 === 0
                                ? 'circle-outer-1'
                                : 'circle-outer-2'
                        } ${Boolean(juego.completado) ? 'circle-completed' : ''}`}
                        onClick={() =>
                            navigate(`/designboard?id=${juego.id}`, {
                                state: {
                                    juegoId: juego.id,
                                    juegoDescripcion: juego.descripcion,
                                },
                            })
                        }
                    >
                        <div
                            className={`circle-inner ${Boolean(juego.completado) ? 'circle-completed' : ''}`}
                        >
                            {index + 1}
                        </div>
                    </div>
                </div>
            ))}
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

            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '20px',
                    margin: '20px 0',
                }}
            >
                <button
                    onClick={handleGenerarEjercicioPseudo}
                    style={{
                        backgroundColor: '#22C55E',
                        color: 'white',
                        border: 'none',
                        padding: '12px 30px',
                        borderRadius: '8px',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#16A34A';
                        e.currentTarget.style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#22C55E';
                        e.currentTarget.style.transform = 'scale(1)';
                    }}
                >
                    Generar Ejercicio Pseudocodigo
                </button>
            </div>

            <ModalInf2 isOpen={modalAbierto2} onClose={alternarModal2} />

            {/* Mostrar juegos IA dinÃ¡micamente para PseudocÃ³digo */}
            {juegosIAPseudo.map((juego, index) => (
                <div
                    key={`pseudo-${juego.id}`}
                    className="contenedo-diagrama-flujo-primer-ejercicio"
                >
                    <div
                        className={`${
                            index % 2 === 0
                                ? 'circle-outer-1'
                                : 'circle-outer-2'
                        } ${Boolean(juego.completado) ? 'circle-completed' : ''}`}
                        onClick={() =>
                            navigate(`/editingboard?id=${juego.id}`, {
                                state: {
                                    juegoId: juego.id,
                                    juegoDescripcion: juego.descripcion,
                                },
                            })
                        }
                    >
                        <div
                            className={`circle-inner ${Boolean(juego.completado) ? 'circle-completed' : ''}`}
                        >
                            {index + 1}
                        </div>
                    </div>
                </div>
            ))}
        </AppShell>
    );
};

export default DashboardIA;
