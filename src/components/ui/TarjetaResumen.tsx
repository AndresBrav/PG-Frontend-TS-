import type { ReactNode } from 'react';

type Acento = 'naranja' | 'verde' | 'azul' | 'blanco';

interface TarjetaResumenProps {
    titulo: string;
    valor: ReactNode;
    detalle?: string;
    acento?: Acento;
    icono?: ReactNode;
}

const COLORES: Record<Acento, string> = {
    naranja: 'text-[#FF7C02]',
    verde: 'text-[#22C55E]',
    azul: 'text-sky-400',
    blanco: 'text-white',
};

const TarjetaResumen = ({
    titulo,
    valor,
    detalle,
    acento = 'naranja',
    icono,
}: TarjetaResumenProps) => {
    return (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg backdrop-blur-sm">
            <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-medium text-gray-300">{titulo}</p>
                {icono && (
                    <span className={COLORES[acento]} aria-hidden="true">
                        {icono}
                    </span>
                )}
            </div>
            <p
                className={`mt-2 text-3xl font-extrabold tracking-tight ${COLORES[acento]}`}
            >
                {valor}
            </p>
            {detalle && <p className="mt-1 text-xs text-gray-400">{detalle}</p>}
        </div>
    );
};

export default TarjetaResumen;
