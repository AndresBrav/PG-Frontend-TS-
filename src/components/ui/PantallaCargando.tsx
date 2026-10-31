interface PantallaCargandoProps {
    mensaje?: string;
}

const PantallaCargando = ({
    mensaje = 'Cargando...',
}: PantallaCargandoProps) => {
    return (
        <div className="flex min-h-screen items-center justify-center bg-[#181818] px-4 text-white">
            <div className="flex flex-col items-center gap-4">
                <div className="h-11 w-11 animate-spin rounded-full border-4 border-white/20 border-t-[#FF7C02]" />
                <p className="text-sm text-gray-300">{mensaje}</p>
            </div>
        </div>
    );
};

export default PantallaCargando;
