interface BarraProgresoProps {
    valor: number;
    color?: string;
    etiqueta?: string;
}

const BarraProgreso = ({
    valor,
    color = '#22C55E',
    etiqueta,
}: BarraProgresoProps) => {
    const porcentaje = Math.round(
        Math.max(0, Math.min(1, valor || 0)) * 100,
    );

    return (
        <div>
            {etiqueta && (
                <div className="mb-1 flex items-center justify-between text-xs text-gray-400">
                    <span>{etiqueta}</span>
                    <span>{porcentaje}%</span>
                </div>
            )}
            <div
                className="h-2.5 w-full overflow-hidden rounded-full bg-white/10"
                role="progressbar"
                aria-valuenow={porcentaje}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={etiqueta ?? 'Progreso'}
            >
                <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                        width: `${porcentaje}%`,
                        backgroundColor: color,
                    }}
                />
            </div>
        </div>
    );
};

export default BarraProgreso;
