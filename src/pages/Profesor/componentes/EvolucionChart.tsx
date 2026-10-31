import type { SerieEvolucion } from '../../types/dominio';

interface EvolucionChartProps {
    fechas: string[];
    series: SerieEvolucion[];
}

const COLORES = [
    '#FF7C02',
    '#22C55E',
    '#38BDF8',
    '#F472B6',
    '#A78BFA',
    '#FACC15',
    '#FB7185',
    '#2DD4BF',
    '#FB923C',
    '#C084FC',
];

const obtenerColor = (indice: number) =>
    COLORES[indice % COLORES.length];

const EvolucionChart = ({ fechas, series }: EvolucionChartProps) => {
    if (fechas.length === 0 || series.length === 0) {
        return (
            <div className="rounded-xl border border-dashed border-white/15 px-4 py-10 text-center text-sm text-gray-400">
                No hay datos de evolución para el rango seleccionado.
            </div>
        );
    }

    const ancho = 920;
    const alto = 330;
    const margenIzquierdo = 42;
    const margenDerecho = 18;
    const margenSuperior = 20;
    const margenInferior = 45;
    const anchoGrafico = ancho - margenIzquierdo - margenDerecho;
    const altoGrafico = alto - margenSuperior - margenInferior;

    const maxReal = Math.max(
        1,
        ...series.flatMap((serie) => serie.acumulado),
    );
    const paso = Math.max(1, Math.ceil(maxReal / 4));
    const maxY = paso * 4;

    const posicionX = (indice: number) => {
        if (fechas.length === 1) {
            return margenIzquierdo + anchoGrafico / 2;
        }

        return (
            margenIzquierdo +
            (indice / (fechas.length - 1)) * anchoGrafico
        );
    };

    const posicionY = (valor: number) =>
        margenSuperior + altoGrafico - (valor / maxY) * altoGrafico;

    const marcasY = [0, 1, 2, 3, 4].map((indice) => {
        const valor = paso * indice;
        return {
            valor,
            y: posicionY(valor),
        };
    });

    const indicesFechas = Array.from(
        new Set([
            0,
            Math.floor((fechas.length - 1) * 0.25),
            Math.floor((fechas.length - 1) * 0.5),
            Math.floor((fechas.length - 1) * 0.75),
            fechas.length - 1,
        ]),
    );

    return (
        <div>
            <div
                className="overflow-x-auto pb-2"
                style={{ scrollbarWidth: 'thin' }}
            >
                <svg
                    viewBox={`0 0 ${ancho} ${alto}`}
                    className="h-auto w-full min-w-[680px]"
                    role="img"
                    aria-label="Evolución acumulada de ejercicios completados por estudiante"
                >
                    <title>
                        Evolución acumulada de ejercicios completados
                    </title>

                    {marcasY.map((marca) => (
                        <g key={marca.valor}>
                            <line
                                x1={margenIzquierdo}
                                y1={marca.y}
                                x2={ancho - margenDerecho}
                                y2={marca.y}
                                stroke="rgba(255,255,255,0.08)"
                                strokeDasharray="4 4"
                            />
                            <text
                                x={margenIzquierdo - 9}
                                y={marca.y + 4}
                                textAnchor="end"
                                fill="rgba(255,255,255,0.5)"
                                fontSize="11"
                            >
                                {marca.valor}
                            </text>
                        </g>
                    ))}

                    {indicesFechas.map((indice) => (
                        <g key={`${fechas[indice]}-${indice}`}>
                            <line
                                x1={posicionX(indice)}
                                y1={margenSuperior}
                                x2={posicionX(indice)}
                                y2={margenSuperior + altoGrafico}
                                stroke="rgba(255,255,255,0.06)"
                            />
                            <text
                                x={posicionX(indice)}
                                y={alto - 18}
                                textAnchor="middle"
                                fill="rgba(255,255,255,0.5)"
                                fontSize="11"
                            >
                                {fechas[indice]?.slice(5)}
                            </text>
                        </g>
                    ))}

                    {series.map((serie, indiceSerie) => {
                        const color = obtenerColor(indiceSerie);
                        const puntos = serie.acumulado
                            .map(
                                (valor, indice) =>
                                    `${posicionX(indice)},${posicionY(valor)}`,
                            )
                            .join(' ');
                        const ultimoIndice = Math.min(
                            serie.acumulado.length - 1,
                            fechas.length - 1,
                        );
                        const ultimoValor =
                            serie.acumulado[ultimoIndice] ?? 0;

                        return (
                            <g key={serie.estudiante_id}>
                                <polyline
                                    points={puntos}
                                    fill="none"
                                    stroke={color}
                                    strokeWidth="2.5"
                                    strokeLinejoin="round"
                                    strokeLinecap="round"
                                />
                                {ultimoIndice >= 0 && (
                                    <circle
                                        cx={posicionX(ultimoIndice)}
                                        cy={posicionY(ultimoValor)}
                                        r="4"
                                        fill={color}
                                        stroke="#181818"
                                        strokeWidth="2"
                                    />
                                )}
                            </g>
                        );
                    })}
                </svg>
            </div>

            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
                {series.map((serie, indice) => (
                    <div
                        key={serie.estudiante_id}
                        className="flex items-center gap-2 text-xs text-gray-300"
                    >
                        <span
                            className="h-2.5 w-2.5 shrink-0 rounded-full"
                            style={{
                                backgroundColor: obtenerColor(indice),
                            }}
                        />
                        <span className="max-w-[180px] truncate">
                            {serie.username}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default EvolucionChart;
