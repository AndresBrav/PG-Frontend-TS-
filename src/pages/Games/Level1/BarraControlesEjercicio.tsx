import React from 'react';

interface Props {
    onEjecutar: () => void;
    onGuardar?: () => void;
    onReiniciar: () => void;
    cargando?: boolean;
    guardando?: boolean;
    guardado?: boolean;
}

export const BarraControlesEjercicio: React.FC<Props> = ({
    onEjecutar,
    onReiniciar,
    cargando = false,
    guardando = false,
    guardado = false,
}) => {
    return (
        <div className="flex flex-wrap items-center justify-center gap-3 my-3 px-4">
            {/* Botón Ejecutar */}
            <button
                type="button"
                onClick={onEjecutar}
                className="button-execute-flowchart cursor-pointer transition transform hover:scale-105 active:scale-95 shadow-md"
                title="Ejecutar y validar diagrama"
            >
                <h1>Ejecutar</h1>
            </button>

            {/* Botón Reiniciar */}
            <button
                type="button"
                onClick={onReiniciar}
                disabled={cargando}
                className="px-4 py-2 rounded-full font-semibold text-white bg-red-600/80 hover:bg-red-600 active:scale-95 transition shadow cursor-pointer disabled:opacity-50 text-sm md:text-base flex items-center gap-2"
                title="Restablecer tablero al inicio"
            >
                <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                </svg>
                Reiniciar
            </button>

            {/* Indicador de estado de sincronización */}
            <div className="text-xs md:text-sm font-medium px-3 py-1 rounded-full backdrop-blur-sm transition-all">
                {cargando ? (
                    <span className="text-amber-300 flex items-center gap-1">
                        <span className="animate-spin inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full" />
                        Cargando progreso...
                    </span>
                ) : guardando ? (
                    <span className="text-blue-300 flex items-center gap-1">
                        <span className="animate-spin inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full" />
                        Guardando cambios...
                    </span>
                ) : guardado ? (
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        ✓ Guardado en la nube
                    </span>
                ) : (
                    <span className="text-gray-300/80 flex items-center gap-1">
                        ☁ Auto-guardado activo
                    </span>
                )}
            </div>
        </div>
    );
};
