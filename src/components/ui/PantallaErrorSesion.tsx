interface PantallaErrorSesionProps {
    mensaje: string;
    onReintentar: () => Promise<void>;
    onSalir: () => void;
}

const PantallaErrorSesion = ({
    mensaje,
    onReintentar,
    onSalir,
}: PantallaErrorSesionProps) => {
    return (
        <div className="flex min-h-screen items-center justify-center bg-[#181818] px-4 text-white">
            <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-6 text-center shadow-xl">
                <h1 className="text-xl font-bold text-white">
                    No se pudo cargar tu sesión
                </h1>
                <p className="mt-2 text-sm text-gray-300">{mensaje}</p>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                    <button
                        type="button"
                        className="rounded-xl bg-[#FF7C02] px-4 py-2 font-semibold text-black transition hover:bg-[#ff8f2b]"
                        onClick={() => {
                            void onReintentar();
                        }}
                    >
                        Reintentar
                    </button>
                    <button
                        type="button"
                        className="rounded-xl border border-white/20 px-4 py-2 font-semibold text-white transition hover:bg-white/10"
                        onClick={onSalir}
                    >
                        Volver al login
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PantallaErrorSesion;
