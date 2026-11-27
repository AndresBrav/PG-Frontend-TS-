import type { EstadoEjecucion } from '../compilador';
import type { PerfilVariable } from './visualUtils';
import { colorDeVariable } from './visualUtils';

interface BarrasEjecucionProps {
    /** Perfiles calculados sobre la traza recortada al paso elegido. */
    perfiles: PerfilVariable[];
    /** Captura del paso activo (los valores que se dibujan). */
    captura: EstadoEjecucion | null;
    /** Captura inmediatamente anterior (para resalar el cambio). */
    anterior: EstadoEjecucion | null;
    /** Variables que el usuario ocultó. */
    variablesOcultas?: Set<string>;
    /** Callback para alternar visibilidad. */
    onToggleVariable?: (nombre: string) => void;
}

/** Ojo SVG igual al de BotonMostrarPassword */
const IconoOjoBarras = ({ visible, size = 14 }: { visible: boolean; size?: number }) => {
    const color = visible ? 'var(--text)' : '#888';
    return (
        <svg
            width={size}
            height={size}
            viewBox='0 0 24 24'
            fill='none'
            stroke={color}
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
            style={{ display: 'block', flexShrink: 0 }}
        >
            {visible ? (
                <>
                    <path d='M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z' />
                    <circle cx='12' cy='12' r='3' />
                </>
            ) : (
                <path d='M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 10 8 10 8a13.16 13.16 0 0 1-1.67 2.68M6.61 6.61A13.53 13.53 0 0 0 2 12s3 8 10 8a9.74 9.74 0 0 0 5.39-1.61M2 2l20 20' />
            )}
        </svg>
    );
};

interface BarraInfo {
    nombre: string;
    indice: number;
    valor: number;
    cambio: boolean;
    positivo: boolean;
}

/**
 * Pestaña "Barras": todas las variables numéricas como barras animadas
 * contra una escala común del máximo absoluto. La variable que cambió
 * respecto al paso anterior se resalta en ámbar.
 */
const BarrasEjecucion = ({
    perfiles,
    captura,
    anterior,
    variablesOcultas = new Set(),
    onToggleVariable,
}: BarrasEjecucionProps) => {
    if (!captura) {
        return (
            <p style={{ fontSize: 12, color: '#888', padding: '6px 2px' }}>
                Ejecuta un algoritmo para ver las barras.
            </p>
        );
    }

    const valoresAnteriores = new Map<string, string>();
    if (anterior) {
        for (const v of anterior.variables) {
            valoresAnteriores.set(v.nombre, v.valor);
        }
    }

    const todasNumericas = perfiles.filter(
        (p) => p.tipo === 'numero' && p.serie.length > 0
    );

    const barras: BarraInfo[] = perfiles
        .filter((p) => p.tipo === 'numero' && p.serie.length > 0 && !variablesOcultas.has(p.nombre))
        .map((perfil) => {
            const textoActual = captura.variables.find(
                (v) => v.nombre === perfil.nombre
            )?.valor;
            const valor = textoActual !== undefined ? Number(textoActual) : 0;
            const previo = valoresAnteriores.get(perfil.nombre);

            return {
                nombre: perfil.nombre,
                indice: perfil.indice,
                valor,
                cambio: previo !== undefined && Number(previo) !== valor,
                positivo: valor >= 0,
            };
        });

    if (todasNumericas.length === 0) {
        return (
            <p style={{ fontSize: 12, color: '#888', padding: '6px 2px' }}>
                No hay variables numéricas en la traza todavía.
            </p>
        );
    }

    const escalaMax = Math.max(
        ...barras.map((b) => Math.abs(b.valor)),
        1e-9
    );

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                overflowY: 'auto',
                flex: 1,
                minHeight: 0,
            }}
        >
            {/* Chips de visibilidad por variable */}
            {onToggleVariable && todasNumericas.length > 0 && (
                <div
                    style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 4,
                        paddingBottom: 4,
                        borderBottom: '1px solid var(--border)',
                        marginBottom: 2,
                    }}
                >
                    {todasNumericas.map((p) => {
                        const oculta = variablesOcultas.has(p.nombre);
                        const color = colorDeVariable(p.indice);
                        return (
                            <button
                                key={p.nombre}
                                onClick={() => onToggleVariable(p.nombre)}
                                title={oculta ? 'Mostrar variable' : 'Ocultar variable'}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 5,
                                    padding: '3px 9px',
                                    borderRadius: 12,
                                    border: `1px solid ${oculta ? 'var(--border)' : color}`,
                                    backgroundColor: oculta ? 'transparent' : `${color}22`,
                                    cursor: 'pointer',
                                    fontFamily: 'var(--mono)',
                                    fontSize: 13,
                                    fontWeight: 700,
                                    color: oculta ? '#888' : color,
                                    opacity: oculta ? 0.6 : 1,
                                }}
                            >
                                <IconoOjoBarras visible={!oculta} size={14} />
                                {p.nombre}
                            </button>
                        );
                    })}
                </div>
            )}
            {barras.length === 0 && (
                <p style={{ fontSize: 12, color: '#888', padding: '6px 2px' }}>
                    Todas las variables están ocultas.
                </p>
            )}
            {barras.map((barra) => {
                const color = colorDeVariable(barra.indice);
                const ancho = Math.min(Math.abs(barra.valor) / escalaMax, 1);
                const porcentaje = Math.round(ancho * 100);

                return (
                    <div key={barra.nombre}>
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'baseline',
                                marginBottom: 3,
                            }}
                        >
                            <span
                                style={{
                                    fontFamily: 'var(--mono)',
                                    fontSize: 14,
                                    fontWeight: 700,
                                    color,
                                }}
                            >
                                {barra.nombre}
                            </span>
                            <span
                                style={{
                                    fontFamily: 'var(--mono)',
                                    fontSize: 14,
                                    fontWeight: 700,
                                    color: barra.cambio
                                        ? '#FBBF24'
                                        : 'var(--text)',
                                    backgroundColor: barra.cambio
                                        ? 'rgba(251,191,36,0.12)'
                                        : 'transparent',
                                    padding: '2px 8px',
                                    borderRadius: 5,
                                    outline: barra.cambio
                                        ? '1px solid rgba(251,191,36,0.5)'
                                        : '1px solid transparent',
                                }}
                            >
                                {barra.positivo ? '' : '-'}
                                {Math.abs(barra.valor)}
                            </span>
                        </div>
                        <div
                            style={{
                                height: 14,
                                borderRadius: 7,
                                backgroundColor: 'rgba(0,0,0,0.25)',
                                overflow: 'hidden',
                            }}
                        >
                            <div
                                style={{
                                    height: '100%',
                                    width: `${porcentaje}%`,
                                    borderRadius: 7,
                                    backgroundColor: barra.positivo
                                        ? color
                                        : '#F87171',
                                    opacity: barra.positivo ? 0.85 : 1,
                                    transition: 'width 0.25s ease-out',
                                }}
                            />
                        </div>
                    </div>
                );
            })}
            <div style={{ fontSize: 10, color: '#888' }}>
                Escala común: máximo {Math.abs(escalaMax) >= 1e8 ? escalaMax.toExponential(2) : Number(escalaMax.toFixed(2))}
            </div>
        </div>
    );
};

export default BarrasEjecucion;
