import type { EstadoEjecucion } from './pseintCompiler';
import type { PerfilVariable } from './visualUtils';
import { colorDeVariable } from './visualUtils';

interface BarrasEjecucionProps {
    /** Perfiles calculados sobre la traza recortada al paso elegido. */
    perfiles: PerfilVariable[];
    /** Captura del paso activo (los valores que se dibujan). */
    captura: EstadoEjecucion | null;
    /** Captura inmediatamente anterior (para resalar el cambio). */
    anterior: EstadoEjecucion | null;
}

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

    const barras: BarraInfo[] = perfiles
        .filter((p) => p.tipo === 'numero' && p.serie.length > 0)
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

    if (barras.length === 0) {
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
                                    fontSize: 12,
                                    fontWeight: 700,
                                    color,
                                }}
                            >
                                {barra.nombre}
                            </span>
                            <span
                                style={{
                                    fontFamily: 'var(--mono)',
                                    fontSize: 12,
                                    fontWeight: 700,
                                    color: barra.cambio
                                        ? '#FBBF24'
                                        : 'var(--text)',
                                    backgroundColor: barra.cambio
                                        ? 'rgba(251,191,36,0.12)'
                                        : 'transparent',
                                    padding: '1px 7px',
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
