import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../../../components/layout/AppShell';
import { TokenContext } from '../../../Context/TokenContext';
import {
    obtenerCuotaGeneracionIA,
    traerJuegosIA,
    traerJuegosIAPseudo,
    traerTemariosIA,
} from '../../../api/ejerciciosIA/ejercicioIAapi';
import type { CuotaGeneracionIA } from '../../../api/ejerciciosIA/ejercicioIAapi';
import { generarEjercicioHandler } from './generarEjercicioHandler';
import { generarEjercicioHandlerPseudo } from './generarEjercicioHandlerPseudo';
import ModalInf1 from '../Presentation/ModalInf1';
import ModalInf2 from '../Presentation/ModalInf2';

interface TemarioIA {
    id: number;
    nombre: string;
    orden: number;
}

interface JuegoIA {
    id: number;
    descripcion: string;
    tipo_juego: string;
    usuario_id: number;
    completado: boolean | number;
    puntos: number;
    temario_id?: number | null;
    temario_nombre?: string | null;
    createdAt: string;
    updatedAt: string;
}

const DashboardIA = () => {
    const { claveAcceso } = useContext(TokenContext);
    const [juegosIA, setJuegosIA] = useState<JuegoIA[]>([]);
    const [juegosIAPseudo, setJuegosIAPseudo] = useState<JuegoIA[]>([]);
    const [temarios, setTemarios] = useState<TemarioIA[]>([]);
    const [cuotaGeneracion, setCuotaGeneracion] =
        useState<CuotaGeneracionIA | null>(null);
    const [temarioFiltroDiagrama, setTemarioFiltroDiagrama] = useState<
        number | null
    >(null);
    const [temarioFiltro, setTemarioFiltro] = useState<number | null>(null);

    const [modalAbierto, setModalAbierto] = useState(false);
    const alternarModal = () => setModalAbierto(!modalAbierto);

    const [modalAbierto2, setModalAbierto2] = useState(false);
    const alternarModal2 = () => setModalAbierto2(!modalAbierto2);

    const navigate = useNavigate();

    const temariosDiagrama = temarios.filter(
        (temario) => temario.nombre !== 'Funciones y SubProcesos'
    );

    useEffect(() => {
        if (!claveAcceso) return;

        let activo = true;
        setCuotaGeneracion(null);

        const cargarDatos = async () => {
            const [dataIA, dataIAPseudo, dataTemarios] = await Promise.all([
                traerJuegosIA(claveAcceso),
                traerJuegosIAPseudo(claveAcceso),
                traerTemariosIA(claveAcceso),
            ]);

            if (!activo) return;

            if (dataIA?.juegosIA) {
                setJuegosIA(dataIA.juegosIA);
            }
            if (dataIAPseudo?.juegosIA) {
                setJuegosIAPseudo(dataIAPseudo.juegosIA);
            }
            if (Array.isArray(dataTemarios)) {
                setTemarios(dataTemarios);
            }
        };

        void cargarDatos();
        void obtenerCuotaGeneracionIA(claveAcceso)
            .then((cuota) => {
                if (activo) setCuotaGeneracion(cuota);
            })
            .catch((error) => {
                console.error('Error al consultar el límite diario de IA:', error);
            });

        return () => {
            activo = false;
        };
    }, [claveAcceso]);

    const actualizarCuotaGeneracion = async () => {
        if (!claveAcceso) return;

        try {
            setCuotaGeneracion(
                await obtenerCuotaGeneracionIA(claveAcceso)
            );
        } catch (error) {
            console.error('Error al actualizar el límite diario de IA:', error);
        }
    };

    const limiteGeneracionAlcanzado =
        cuotaGeneracion?.restantes === 0;

    const handleGenerarEjercicio = async () => {
        const temario = temariosDiagrama.find(
            (item) => item.id === temarioFiltroDiagrama
        );
        await generarEjercicioHandler(
            claveAcceso,
            setJuegosIA,
            temario ?? null
        );
        await actualizarCuotaGeneracion();
    };

    const handleGenerarEjercicioPseudo = async () => {
        // El temario del dropdown define el foco: null (Todos) deja
        // el flujo con selección en el modal de guardar
        const temario = temarioFiltro
            ? {
                  id: temarioFiltro,
                  nombre:
                      temarios.find((t) => t.id === temarioFiltro)?.nombre ??
                      '',
              }
            : null;
        await generarEjercicioHandlerPseudo(
            claveAcceso,
            setJuegosIAPseudo,
            temario && temario.nombre ? temario : null
        );
        await actualizarCuotaGeneracion();
    };

    // Ejercicios pseudo filtrados por el temario seleccionado
    // (null = Todos)
    const pseudoFiltrados =
        temarioFiltro === null
            ? juegosIAPseudo
            : juegosIAPseudo.filter(
                  (juego) => juego.temario_id === temarioFiltro
              );

    const diagramasFiltrados =
        temarioFiltroDiagrama === null
            ? juegosIA
            : juegosIA.filter(
                  (juego) => juego.temario_id === temarioFiltroDiagrama
              );

    const contadorTemarioDiagrama = (temarioId: number) => {
        const delTemario = juegosIA.filter(
            (juego) => juego.temario_id === temarioId
        );
        const completados = delTemario.filter((juego) =>
            Boolean(juego.completado)
        ).length;
        return { completados, total: delTemario.length };
    };

    // Contadores completados/total por temario
    const contadorTemario = (temarioId: number) => {
        const delTemario = juegosIAPseudo.filter(
            (juego) => juego.temario_id === temarioId
        );
        const completados = delTemario.filter((juego) =>
            Boolean(juego.completado)
        ).length;
        return { completados, total: delTemario.length };
    };

    return (
        <AppShell>
            <div className="px-4 pt-6 pb-2 sm:px-6">
                <div className="mx-auto max-w-3xl rounded-2xl border border-white/10 bg-white/5 p-5 text-center sm:p-6">
                    <h2 className="text-lg font-bold text-white sm:text-xl md:text-2xl">
                        🤖 Ejercicios generados con IA
                    </h2>
                    <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-gray-300 sm:text-base">
                        Retos creados dinámicamente para ti por Gemini y
                        organizados por temas. Usa el selector "Ejercicios
                        de:" para filtrar el tema con el que quieres
                        practicar.
                    </p>
                    {cuotaGeneracion && (
                        <p
                            className="mx-auto mt-3 max-w-xl text-sm font-medium text-emerald-200"
                            role="status"
                        >
                            Generaciones de hoy: {cuotaGeneracion.usados}/
                            {cuotaGeneracion.limite}
                            {limiteGeneracionAlcanzado
                                ? ' · Límite alcanzado; se renueva a medianoche (hora de Bolivia).'
                                : ` · Te quedan ${cuotaGeneracion.restantes}.`}
                        </p>
                    )}
                </div>
            </div>
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
                    disabled={limiteGeneracionAlcanzado}
                    style={{
                        backgroundColor: limiteGeneracionAlcanzado
                            ? '#6B7280'
                            : '#22C55E',
                        color: 'white',
                        border: 'none',
                        padding: '12px 30px',
                        borderRadius: '8px',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        cursor: limiteGeneracionAlcanzado
                            ? 'not-allowed'
                            : 'pointer',
                        opacity: limiteGeneracionAlcanzado ? 0.7 : 1,
                        transition: 'all 0.3s ease',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    }}
                    onMouseEnter={(e) => {
                        if (limiteGeneracionAlcanzado) return;
                        e.currentTarget.style.backgroundColor = '#16A34A';
                        e.currentTarget.style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor =
                            limiteGeneracionAlcanzado ? '#6B7280' : '#22C55E';
                        e.currentTarget.style.transform = 'scale(1)';
                    }}
                >
                    {limiteGeneracionAlcanzado
                        ? 'Límite diario alcanzado'
                        : 'Generar Ejercicio'}
                </button>
            </div>

            {/* Modal fijo */}
            <ModalInf1 isOpen={modalAbierto} onClose={alternarModal} />

            {/* Filtro de temarios para diagramas de flujo */}
            {temariosDiagrama.length > 0 && (
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: 10,
                        flexWrap: 'wrap',
                        padding: '4px 20px 0 20px',
                    }}
                >
                    <label
                        htmlFor="select-temarios-diagrama-ia"
                        style={{
                            fontSize: 12,
                            fontWeight: 600,
                            color: '#d1d5db',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        Ejercicios de:
                    </label>
                    <select
                        id="select-temarios-diagrama-ia"
                        value={temarioFiltroDiagrama ?? ''}
                        onChange={(e) =>
                            setTemarioFiltroDiagrama(
                                e.target.value ? Number(e.target.value) : null
                            )
                        }
                        style={{
                            background: '#181818',
                            border: '1px solid rgba(255,255,255,0.25)',
                            borderRadius: 999,
                            color: '#fff',
                            fontSize: 13,
                            padding: '6px 30px 6px 14px',
                            cursor: 'pointer',
                            maxWidth: '100%',
                        }}
                    >
                        <option value="">Todos ({juegosIA.length})</option>
                        {temariosDiagrama.map((temario) => {
                            const { completados, total } =
                                contadorTemarioDiagrama(temario.id);
                            return (
                                <option key={temario.id} value={temario.id}>
                                    📚 {temario.nombre} ({completados}/{total})
                                </option>
                            );
                        })}
                    </select>
                </div>
            )}

            {/* Mostrar juegos IA dinamicamente */}
            {diagramasFiltrados.map((juego, index) => (
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
                    disabled={limiteGeneracionAlcanzado}
                    style={{
                        backgroundColor: limiteGeneracionAlcanzado
                            ? '#6B7280'
                            : '#22C55E',
                        color: 'white',
                        border: 'none',
                        padding: '12px 30px',
                        borderRadius: '8px',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        cursor: limiteGeneracionAlcanzado
                            ? 'not-allowed'
                            : 'pointer',
                        opacity: limiteGeneracionAlcanzado ? 0.7 : 1,
                        transition: 'all 0.3s ease',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    }}
                    onMouseEnter={(e) => {
                        if (limiteGeneracionAlcanzado) return;
                        e.currentTarget.style.backgroundColor = '#16A34A';
                        e.currentTarget.style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor =
                            limiteGeneracionAlcanzado ? '#6B7280' : '#22C55E';
                        e.currentTarget.style.transform = 'scale(1)';
                    }}
                >
                    {limiteGeneracionAlcanzado
                        ? 'Límite diario alcanzado'
                        : 'Generar Ejercicio Pseudocodigo'}
                </button>
            </div>

            <ModalInf2 isOpen={modalAbierto2} onClose={alternarModal2} />

            {/* Dropdown de temarios (Etapa 2 - Pseudocódigo) */}
            {temarios.length > 0 && (
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: 10,
                        flexWrap: 'wrap',
                        padding: '4px 20px 0 20px',
                    }}
                >
                    <label
                        htmlFor="select-temarios-ia"
                        style={{
                            fontSize: 12,
                            fontWeight: 600,
                            color: '#d1d5db',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        Ejercicios de:
                    </label>
                    <select
                        id="select-temarios-ia"
                        value={temarioFiltro ?? ''}
                        onChange={(e) =>
                            setTemarioFiltro(
                                e.target.value ? Number(e.target.value) : null
                            )
                        }
                        style={{
                            background: '#181818',
                            border: '1px solid rgba(255,255,255,0.25)',
                            borderRadius: 999,
                            color: '#fff',
                            fontSize: 13,
                            padding: '6px 30px 6px 14px',
                            cursor: 'pointer',
                            maxWidth: '100%',
                        }}
                    >
                        <option value="">
                            Todos ({juegosIAPseudo.length})
                        </option>
                        {temarios.map((temario) => {
                            const { completados, total } = contadorTemario(
                                temario.id
                            );
                            return (
                                <option key={temario.id} value={temario.id}>
                                    📚 {temario.nombre} ({completados}/{total})
                                </option>
                            );
                        })}
                    </select>
                </div>
            )}

            {/* Mostrar juegos IA dinÃ¡micamente para PseudocÃ³digo */}
            {pseudoFiltrados.map((juego, index) => (
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
