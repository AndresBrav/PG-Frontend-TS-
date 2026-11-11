import type { PerfilVariable } from './visualUtils';
import { colorDeVariable, escalaSerie } from './visualUtils';

interface GraficaEvolucionProps {
    /** Perfiles calculados sobre la traza recortada al paso elegido. */
    perfiles: PerfilVariable[];
}

const ALTURA_SERIE = 52;
const MAX_SEGMENTOS_BOOL = 240;

/**
 * Pestaña "Evolución": pequeñas gráficas de línea (una por variable
 * numérica)con la escala automática de cada una, y bandas de color
 * VERDADERO/FALSO para las booleanas. Los arreglos y el texto no se
 * grafican (viven en sus pestañas correspondientes).
 */
const GraficaEvolucion = ({ perfiles }: GraficaEvolucionProps) => {
    const numericas = perfiles.filter(
        (p) => p.tipo === 'numero' && p.serie.length > 0
    );
    const booleanas = perfiles.filter(
        (p) => p.tipo === 'booleano' && p.serieBool.length > 0
    );

    if (numericas.length === 0 && booleanas.length === 0) {
        return (
            <p
                style={{
                    fontSize: 12,
                    color: '#888',
                    padding: '6px 2px',
                }}
            >
                Sin variables numéricas o booleanas para graficar todavía.
            </p>
        );
    }

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
                overflowY: 'auto',
                flex: 1,
                minHeight: 0,
            }}
        >
            {numericas.map((perfil) => {
                const serie = perfil.serie;
                const ultimo = serie[serie.length - 1];
                const color = colorDeVariable(perfil.indice);
                // Escala sobre toda la serie visible (recortada al paso activo)
                const escala = escalaSerie(serie, ALTURA_SERIE);

                const puntos = serie
                    .map((p, i) => {
                        const n = serie.length;
                        const x =
                            n === 1 ? 0 : (i / (n - 1)) * 100;
                        return `${x.toFixed(2)},${escala.yDe(p.valor).toFixed(2)}`;
                    })
                    .join(' ');

                // Punto final marcado
                const xFinal =
                    serie.length === 1 ? 0 : 100;
                const yFinal = escala.yDe(ultimo.valor);

                return (
                    <div
                        key={perfil.nombre}
                        style={{
                            border: '1px solid var(--border)',
                            borderRadius: 8,
                            padding: '6px 10px 8px',
                            backgroundColor: 'rgba(255,255,255,0.02)',
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'baseline',
                                gap: 8,
                            }}
                        >
                            <span
                                style={{
                                    fontFamily: 'var(--mono)',
                                    fontSize: 12,
                                    fontWeight: 700,
                                    color,
                                }}
                            >
                                {perfil.nombre}
                            </span>
                            <span
                                style={{
                                    fontFamily: 'var(--mono)',
                                    fontSize: 13,
                                    fontWeight: 700,
                                    color: 'var(--text)',
                                }}
                            >
                                {ultimo.valor}
                            </span>
                        </div>
                        <svg
                            width="100%"
                            height={ALTURA_SERIE}
                            viewBox="0 0 100 52"
                            preserveAspectRatio="none"
                            style={{
                                display: 'block',
                                marginTop: 4,
                                backgroundColor: 'rgba(0,0,0,0.15)',
                                borderRadius: 4,
                            }}
                        >
                            {/* línea base ligera */}
                            <line
                                x1="0"
                                y1={escala.yDe(0)}
                                x2="100"
                                y2={escala.yDe(0)}
                                stroke="rgba(255,255,255,0.08)"
                                strokeWidth="1"
                                vectorEffect="non-scaling-stroke"
                            />
                            {serie.length === 1 ? (
                                <circle
                                    cx="0"
                                    cy={escala.yDe(ultimo.valor)}
                                    r="3"
                                    fill={color}
                                    vectorEffect="non-scaling-stroke"
                                />
                            ) : (
                                <polyline
                                    points={puntos}
                                    fill="none"
                                    stroke={color}
                                    strokeWidth="2"
                                    vectorEffect="non-scaling-stroke"
                                    strokeLinejoin="round"
                                />
                            )}
                            <circle
                                cx={xFinal}
                                cy={yFinal}
                                r="2.5"
                                fill="#fff"
                                stroke={color}
                                strokeWidth="1.5"
                                vectorEffect="non-scaling-stroke"
                            />
                        </svg>
                    </div>
                );
            })}

            {booleanas.map((perfil) => {
                const serie = perfil.serieBool;
                const visibles = serie.slice(-MAX_SEGMENTOS_BOOL);
                const color = colorDeVariable(perfil.indice);

                return (
                    <div
                        key={perfil.nombre}
                        style={{
                            border: '1px solid var(--border)',
                            borderRadius: 8,
                            padding: '6px 10px 8px',
                            backgroundColor: 'rgba(255,255,255,0.02)',
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'baseline',
                                gap: 8,
                            }}
                        >
                            <span
                                style={{
                                    fontFamily: 'var(--mono)',
                                    fontSize: 12,
                                    fontWeight: 700,
                                    color,
                                }}
                            >
                                {perfil.nombre}
                            </span>
                            <span
                                style={{
                                    fontFamily: 'var(--mono)',
                                    fontSize: 12,
                                    fontWeight: 700,
                                    color: visibles[visibles.length - 1].valor
                                        ? '#4ADE80'
                                        : '#F87171',
                                }}
                            >
                                {visibles[visibles.length - 1].valor
                                    ? 'VERDADERO'
                                    : 'FALSO'}
                            </span>
                        </div>
                        <div
                            style={{
                                display: 'flex',
                                gap: 1,
                                height: 18,
                                marginTop: 6,
                                borderRadius: 4,
                                overflow: 'hidden',
                                backgroundColor: 'rgba(0,0,0,0.25)',
                            }}
                        >
                            {visibles.map((p, indice) => (
                                <div
                                    key={`${p.paso}-${indice}`}
                                    style={{
                                        flex: 1,
                                        backgroundColor: p.valor
                                            ? 'rgba(74, 222, 128, 0.85)'
                                            : 'rgba(248, 113, 113, 0.85)',
                                    }}
                                    title={`Paso ${p.paso}: ${
                                        p.valor ? 'VERDADERO' : 'FALSO'
                                    }`}
                                />
                            ))}
                        </div>
                        {serie.length > MAX_SEGMENTOS_BOOL && (
                            <div
                                style={{
                                    fontSize: 10,
                                    color: '#888',
                                    marginTop: 3,
                                }}
                            >
                                Últimos {MAX_SEGMENTOS_BOOL} cambios
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default GraficaEvolucion;
