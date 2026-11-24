import type { CSSProperties } from 'react';

interface ReproductorEjecucionProps {
    /** Cantidad de capturas disponibles en la traza recortada. */
    total: number;
    /** true = siguiendo la ejecución en vivo; false = viendo un paso grabado. */
    modoVivo: boolean;
    /** Índice de captura seleccionado cuando modoVivo es false. */
    indice: number;
    /** Número de instrucción (paso) de la captura seleccionada. */
    paso: number;
    /** Cantidad de instrucciones capturadas (puede ser menor que el total real). */
    pasoUltimo: number;
    /** true mientras corre el pseudocódigo. */
    enEjecucion: boolean;
    /** true si el reproducido está avanzando. */
    reproduciendo: boolean;
    /** Multiplicador de velocidad del reproducido. */
    velocidad: number;
    /** Cambia la vista a un índice de captura concreto (slider). */
    onSeleccionar: (indice: number) => void;
    /** Retrocede una captura y pausa el modo película. */
    onPasoAnterior: () => void;
    /** Avanza una captura y pausa el modo película. */
    onPasoSiguiente: () => void;
    /** Vuelve a seguir la ejecución en vivo. */
    onIrVivo: () => void;
    /** Alterna ▶/⏸ del modo película. */
    onTogglePlay: () => void;
    /** Cambia la velocidad (0.5, 1, 2, 4). */
    onVelocidad: (velocidad: number) => void;
}

const VELOCIDADES = [0.5, 1, 2, 4];

const estiloBoton = (activo: boolean): CSSProperties => ({
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: 6,
    backgroundColor: activo ? 'rgba(255,124,2,0.18)' : 'transparent',
    color: activo ? '#FF9D3D' : 'var(--text)',
    cursor: 'pointer',
    fontSize: 12,
    fontWeight: 700,
    padding: '3px 9px',
    lineHeight: '16px',
});

/**
 * Barra de reproducción del "modo película": permite pausar la ejecución,
 * rebobinar con un slider a cualquier paso grabado y reproducirlos a
 * velocidad seleccionable. Al mover el slider, el paso activo alimenta
 * las pestañas de Evolución/Barras/Arreglos y el resalta de línea.
 */
const ReproductorEjecucion = ({
    total,
    modoVivo,
    indice,
    paso,
    pasoUltimo,
    enEjecucion,
    reproduciendo,
    velocidad,
    onSeleccionar,
    onPasoAnterior,
    onPasoSiguiente,
    onIrVivo,
    onTogglePlay,
    onVelocidad,
}: ReproductorEjecucionProps) => {
    const hayPasoAnterior = total > 0 && indice > 0;
    const hayPasoSiguiente = total > 0 && indice < total - 1;

    return (
        <div
            style={{
                borderTop: '1px solid var(--border)',
                paddingTop: 8,
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
                flexShrink: 0,
                backgroundColor: 'var(--sidebar-bg)',
            }}
        >
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 6,
                    flexWrap: 'wrap',
                }}
            >
                {/* Grupo de Controles: Anterior, Play/Pausa, Siguiente, En Vivo */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        flexShrink: 0,
                    }}
                >
                    <button
                        type="button"
                        onClick={onPasoAnterior}
                        disabled={!hayPasoAnterior}
                        style={{
                            ...estiloBoton(false),
                            opacity: hayPasoAnterior ? 1 : 0.4,
                            cursor: hayPasoAnterior ? 'pointer' : 'not-allowed',
                            minWidth: 26,
                            padding: '3px 6px',
                        }}
                        title="Ir al paso anterior"
                        aria-label="Ir al paso anterior"
                    >
                        ←
                    </button>
                    <button
                        type="button"
                        onClick={onTogglePlay}
                        style={{
                            ...estiloBoton(reproduciendo),
                            minWidth: 28,
                            padding: '3px 6px',
                        }}
                        title={
                            modoVivo
                                ? 'Reproducir la ejecución desde el inicio'
                                : reproduciendo
                                  ? 'Pausar'
                                  : 'Continuar'
                        }
                    >
                        {modoVivo ? '▶' : reproduciendo ? '⏸' : '▶'}
                    </button>
                    <button
                        type="button"
                        onClick={onPasoSiguiente}
                        disabled={!hayPasoSiguiente}
                        style={{
                            ...estiloBoton(false),
                            opacity: hayPasoSiguiente ? 1 : 0.4,
                            cursor: hayPasoSiguiente ? 'pointer' : 'not-allowed',
                            minWidth: 26,
                            padding: '3px 6px',
                        }}
                        title="Ir al paso siguiente"
                        aria-label="Ir al paso siguiente"
                    >
                        →
                    </button>
                    <button
                        type="button"
                        onClick={onIrVivo}
                        style={{
                            ...estiloBoton(modoVivo),
                            padding: '3px 7px',
                            fontSize: 11,
                        }}
                        title="Seguir los pasos a medida que se ejecutan"
                    >
                        {enEjecucion ? '● vivo' : 'en vivo'}
                    </button>
                </div>

                {/* Indicador de Paso */}
                <span
                    style={{
                        fontFamily: 'var(--mono)',
                        fontSize: 11,
                        color: '#aaa',
                        whiteSpace: 'nowrap',
                        margin: '0 2px',
                    }}
                >
                    {modoVivo ? 'paso ' : 'viendo '}
                    <b style={{ color: 'var(--text)' }}>{paso}</b>
                    {modoVivo ? '' : ' / '}
                    {modoVivo ? ` (${pasoUltimo} instr.)` : `${pasoUltimo}`}
                </span>

                {/* Botones de Velocidad */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 3,
                        flexShrink: 0,
                    }}
                >
                    {VELOCIDADES.map((v) => (
                        <button
                            key={v}
                            type="button"
                            onClick={() => onVelocidad(v)}
                            style={{
                                ...estiloBoton(velocidad === v),
                                fontSize: 10,
                                padding: '2px 5px',
                                minWidth: 24,
                            }}
                            title={`Velocidad ${v}×`}
                        >
                            {v}×
                        </button>
                    ))}
                </div>
            </div>

            <input
                type="range"
                min={0}
                max={Math.max(total - 1, 0)}
                value={modoVivo ? Math.max(total - 1, 0) : Math.min(indice, total - 1)}
                onChange={(e) => onSeleccionar(Number(e.target.value))}
                disabled={total === 0}
                style={{
                    width: '100%',
                    accentColor: '#FF7C02',
                    cursor: 'pointer',
                    margin: 0,
                }}
                aria-label="Línea de tiempo de la ejecución"
            />
            {total === 0 && (
                <span style={{ fontSize: 10, color: '#888' }}>
                    Sin capturas aún
                </span>
            )}
        </div>
    );
};

export default ReproductorEjecucion;
