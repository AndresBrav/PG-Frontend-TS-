import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Node, Edge } from '@xyflow/react';
import type { FlowExport } from '../types/flow';
import Swal from 'sweetalert2';
import { verificarDiagrama } from '../../../../api/ejerciciosIA/verificarDiagrama';
import { TokenContext } from '../../../../Context/TokenContext';
import { completarJuego } from '../../../../api/ejerciciosIA/ejercicios';

interface ToolbarProps {
    nodes: Node[];
    edges: Edge[];
    onClear: () => void;
    juegoId?: number;
    juegoDescripcion?: string;
    estadoGuardado?: 'guardado' | 'guardando' | 'sin_guardar';
    onGuardarManual?: () => void;
    onReiniciar?: () => void;
}

function Toolbar({
    nodes,
    edges,
    onClear,
    juegoId,
    juegoDescripcion,
    estadoGuardado = 'guardado',
    onGuardarManual,
    onReiniciar,
}: ToolbarProps) {
    const navigate = useNavigate();
    const { claveAcceso } = useContext(TokenContext);
    const [counterRate, setCounterRate] = useState<number>(1);

    const handleExport = async () => {
        const exportData: FlowExport = {
            nodes: nodes.map((node) => ({
                id: node.id,
                type: node.type || '',
                position: node.position,
                data: node.data as FlowExport['nodes'][0]['data'],
            })),
            edges: edges.map((edge) => ({
                id: edge.id,
                source: edge.source,
                target: edge.target,
                sourceHandle: edge.sourceHandle ?? null,
                targetHandle: edge.targetHandle ?? null,
                label: edge.label as string | undefined,
            })),
        };

        // Validar que hay diagrama
        if (nodes.length === 0) {
            Swal.fire({
                title: 'Diagrama vacio',
                text: 'Por favor, crea un diagrama antes de verificar',
                icon: 'warning',
                confirmButtonText: 'Entendido',
                customClass: {
                    title: 'titulo-celular',
                    confirmButton: 'btn-semitransparente',
                    icon: 'icono-celular',
                },
                width: '80%',
            });
            return;
        }

        // Mostrar loading
        Swal.fire({
            title: 'Verificando diagrama...',
            html: 'Por favor espera mientras se verifica tu diagrama',
            icon: 'info',
            iconColor: '#FF7C02',
            allowOutsideClick: false,
            allowEscapeKey: false,
            didOpen: () => {
                Swal.showLoading();
            },
        });

        try {
            // Verificar el diagrama con IA
            console.log('Datos enviados a verificarDiagrama:', exportData);
            const resultado = await verificarDiagrama(
                exportData,
                juegoDescripcion || ''
            );

            // Verificar si el resultado indica correccion
            const esValido =
                !resultado.toLowerCase().includes('incorrecto') &&
                !resultado.toLowerCase().includes('error') &&
                resultado.toLowerCase().includes('correcto');

            const swalResult = await Swal.fire({
                title: esValido
                    ? '✓ Diagrama Correcto'
                    : '✗ Diagrama Incorrecto',
                html: `<p style="text-align: left; color: #555;">${resultado}</p>`,
                icon: esValido ? 'success' : 'error',
                iconColor: esValido ? 'green' : '#e74c3c',
                confirmButtonText: esValido ? 'Excelente' : 'Reintentar',
                customClass: {
                    title: 'titulo-celular',
                    confirmButton: 'btn-semitransparente',
                    icon: 'icono-celular',
                },
                width: '80%',
            });

            // Si el usuario confirma y el diagrama es valido, llamar al endpoint para completar juego
            if (esValido && swalResult.isConfirmed) {
                if (juegoId) {
                    try {
                        if (counterRate === 1) {
                            await completarJuego(claveAcceso, juegoId);
                            console.log(
                                'Puntos incrementados para juego',
                                juegoId
                            );
                        } else {
                            console.log(
                                'Puntos ya incrementados anteriormente para este juego'
                            );
                        }
                    } catch (err) {
                        console.error('Error incrementando puntos:', err);
                    }
                    setCounterRate((prev) => prev + 1);
                } else {
                    console.warn(
                        'No se proporciono juegoId para completarJuego'
                    );
                }
            }
        } catch (error) {
            console.error('Error al verificar diagrama:', error);
            Swal.fire({
                title: 'Error',
                text: 'No se pudo verificar el diagrama. Intenta de nuevo.',
                icon: 'error',
                confirmButtonText: 'Cerrar',
                customClass: {
                    title: 'titulo-celular',
                    confirmButton: 'btn-semitransparente',
                    icon: 'icono-celular',
                },
                width: '80%',
            });
        }
    };

    return (
        <div className="toolbar">
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '15px',
                }}
            >
                <button
                    onClick={() => navigate('/ejercicios-ia')}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-h)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        fontSize: '20px',
                        fontWeight: 'bold',
                        padding: '5px',
                    }}
                    title="Volver a Ejercicios IA"
                >
                    ←
                </button>
                <h2
                    style={{
                        margin: 0,
                        fontSize: '20px',
                        color: 'var(--text-h)',
                    }}
                >
                    Editor de Diagramas de Flujo
                </h2>
            </div>
            <div
                className="toolbar-actions"
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                }}
            >
                {juegoId && (
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontSize: '13px',
                            fontWeight: '500',
                            color:
                                estadoGuardado === 'guardando'
                                    ? '#FBBF24'
                                    : estadoGuardado === 'guardado'
                                      ? '#34D399'
                                      : '#9CA3AF',
                        }}
                    >
                        <span
                            style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                backgroundColor:
                                    estadoGuardado === 'guardando'
                                        ? '#FBBF24'
                                        : estadoGuardado === 'guardado'
                                          ? '#34D399'
                                          : '#9CA3AF',
                            }}
                        />
                        <span>
                            {estadoGuardado === 'guardando'
                                ? 'Guardando...'
                                : estadoGuardado === 'guardado'
                                  ? 'Guardado'
                                  : 'Sin guardar'}
                        </span>
                    </div>
                )}
                {onReiniciar && (
                    <button
                        type="button"
                        onClick={onReiniciar}
                        disabled={estadoGuardado === 'guardando'}
                        style={{
                            backgroundColor: 'rgba(239, 68, 68, 0.2)',
                            color: '#fca5a5',
                            border: '1px solid rgba(239, 68, 68, 0.4)',
                            padding: '10px 18px',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor:
                                estadoGuardado === 'guardando'
                                    ? 'not-allowed'
                                    : 'pointer',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                        }}
                        onMouseEnter={(e) => {
                            if (estadoGuardado !== 'guardando') {
                                e.currentTarget.style.backgroundColor =
                                    'rgba(239, 68, 68, 0.35)';
                                e.currentTarget.style.color = '#ffffff';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (estadoGuardado !== 'guardando') {
                                e.currentTarget.style.backgroundColor =
                                    'rgba(239, 68, 68, 0.2)';
                                e.currentTarget.style.color = '#fca5a5';
                            }
                        }}
                        title="Restablecer diagrama al inicio"
                    >
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Reiniciar
                    </button>
                )}
                <button
                    className="btn btn-export"
                    onClick={handleExport}
                    style={{
                        backgroundColor: '#20FB1080',
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
                >
                    Ejecutar
                </button>
                {/* <button className="btn btn-clear" onClick={onClear}>
                    Limpiar
                </button> */}
            </div>
        </div>
    );
}

export default Toolbar;
