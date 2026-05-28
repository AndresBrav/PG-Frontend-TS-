import type { Node, Edge } from '@xyflow/react';
import type { FlowExport } from '../types/flow';
import Swal from 'sweetalert2';
import { verificarDiagrama } from '../../../../api/ejerciciosIA/verificarDiagrama';

interface ToolbarProps {
    nodes: Node[];
    edges: Edge[];
    onClear: () => void;
    juegoId?: number;
    juegoDescripcion?: string;
}

function Toolbar({
    nodes,
    edges,
    onClear,
    juegoId,
    juegoDescripcion,
}: ToolbarProps) {
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
                title: 'Diagrama vacío',
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
            html: 'Por favor espera mientras se verifica tu diagrama con IA',
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

            // Verificar si el resultado indica corrección
            const esValido =
                !resultado.toLowerCase().includes('incorrecto') &&
                !resultado.toLowerCase().includes('error') &&
                resultado.toLowerCase().includes('correcto');

            Swal.fire({
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
            <h2>Flowchart Editor</h2>
            <div className="toolbar-actions">
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
