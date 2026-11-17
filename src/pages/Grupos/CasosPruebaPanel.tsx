import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { ejecutarCasosPrueba } from '../Games/GeneradosPorIA/compilador/casosPrueba';
import type {
    CasoPruebaGrupo,
    ResultadoCasoPrueba,
} from '../../types/dominio';

interface CasosPruebaPanelProps {
    codigo: string | (() => string);
    codigoVersion: string;
    casosPrueba: CasoPruebaGrupo[];
    deshabilitado: boolean;
    onResultadosChange: (resultados: ResultadoCasoPrueba[] | null) => void;
}

const CasosPruebaPanel = ({
    codigo,
    codigoVersion,
    casosPrueba,
    deshabilitado,
    onResultadosChange,
}: CasosPruebaPanelProps) => {
    const [resultados, setResultados] = useState<ResultadoCasoPrueba[] | null>(
        null,
    );
    const [ejecutando, setEjecutando] = useState(false);
    const [expandido, setExpandido] = useState(false);

    useEffect(() => {
        setResultados(null);
        onResultadosChange(null);
    }, [codigoVersion, casosPrueba, onResultadosChange]);

    if (casosPrueba.length === 0) return null;

    const ejecutar = async () => {
        setEjecutando(true);
        try {
            const nuevosResultados = await ejecutarCasosPrueba(
                typeof codigo === 'function' ? codigo() : codigo,
                casosPrueba,
            );
            setResultados(nuevosResultados);
            onResultadosChange(nuevosResultados);
        } catch (error) {
            const mensaje =
                error instanceof Error ? error.message : String(error);
            await Swal.fire({
                icon: 'error',
                title: 'No se pudieron ejecutar los casos',
                text: mensaje,
            });
        } finally {
            setEjecutando(false);
        }
    };

    const aprobados =
        resultados?.filter((resultado) => resultado.aprobado).length ?? 0;

    return (
        <section
            style={{
                margin: '6px 10px 10px',
                padding: '8px 10px',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.12)',
                background: 'rgba(0,0,0,0.22)',
                color: '#fff',
                flexShrink: 0,
            }}
        >
            <div
                style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 8,
                }}
            >
                <div style={{ fontSize: 13, color: '#ddd' }}>
                    <strong>Casos de prueba ({casosPrueba.length})</strong>
                    <span style={{ marginLeft: 8, color: '#aaa' }}>
                        {resultados
                            ? `${aprobados}/${casosPrueba.length} aprobados`
                            : 'Aún no ejecutados'}
                    </span>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button
                        type="button"
                        onClick={() => setExpandido((actual) => !actual)}
                        style={{
                            border: '1px solid rgba(255,255,255,0.18)',
                            borderRadius: 7,
                            padding: '6px 9px',
                            background: 'transparent',
                            color: '#ddd',
                            fontSize: 12,
                            cursor: 'pointer',
                        }}
                    >
                        {expandido ? 'Ocultar casos' : 'Ver casos'}
                    </button>
                    <button
                        type="button"
                        onClick={() => void ejecutar()}
                        disabled={deshabilitado || ejecutando}
                        title="Ejecuta tu solución con las entradas de cada caso y compara las salidas."
                        style={{
                            border: 0,
                            borderRadius: 7,
                            padding: '6px 10px',
                            background: '#FF7C02',
                            color: '#111',
                            fontSize: 12,
                            fontWeight: 700,
                            cursor:
                                deshabilitado || ejecutando
                                    ? 'wait'
                                    : 'pointer',
                            opacity: deshabilitado || ejecutando ? 0.6 : 1,
                        }}
                    >
                        {ejecutando
                            ? 'Probando...'
                            : 'Ejecutar automáticamente'}
                    </button>
                </div>
            </div>

            {expandido && (
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns:
                            'repeat(auto-fit, minmax(220px, 1fr))',
                        gap: 8,
                        marginTop: 10,
                        maxHeight: 220,
                        overflowY: 'auto',
                    }}
                >
                    {casosPrueba.map((caso, indice) => {
                        const resultado = resultados?.[indice];
                        return (
                            <article
                                key={indice}
                                style={{
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: 7,
                                    padding: 9,
                                    fontSize: 12,
                                }}
                            >
                                <strong>
                                    Caso {indice + 1}
                                    {resultado
                                        ? resultado.aprobado
                                            ? ' — ✅'
                                            : ' — ❌'
                                        : ''}
                                </strong>
                                <div
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns:
                                            'repeat(auto-fit, minmax(120px, 1fr))',
                                        gap: 7,
                                        marginTop: 6,
                                        color: '#bbb',
                                    }}
                                >
                                    <div>
                                        <span>Entradas</span>
                                        <pre style={{ margin: '2px 0 0' }}>
                                            {caso.entradas.join('\n') ||
                                                '(ninguna)'}
                                        </pre>
                                    </div>
                                    <div>
                                        <span>Esperado</span>
                                        <pre style={{ margin: '2px 0 0' }}>
                                            {caso.salidas_esperadas.join('\n')}
                                        </pre>
                                    </div>
                                    {resultado && (
                                        <div>
                                            <span>Obtenido</span>
                                            <pre style={{ margin: '2px 0 0' }}>
                                                {resultado.salida_obtenida.join(
                                                    '\n',
                                                ) || '(sin salida)'}
                                            </pre>
                                        </div>
                                    )}
                                </div>
                                {resultado?.error && (
                                    <p
                                        style={{
                                            margin: '6px 0 0',
                                            color: '#fca5a5',
                                        }}
                                    >
                                        {resultado.error}
                                    </p>
                                )}
                            </article>
                        );
                    })}
                </div>
            )}
        </section>
    );
};

export default CasosPruebaPanel;
