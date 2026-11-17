import type { Rol } from '../../types/dominio';

interface EtiquetaRolProps {
    rol: Rol;
}

const ESTILOS: Record<Rol, string> = {
    estudiante: 'border-sky-400/30 bg-sky-400/10 text-sky-300',
    profesor: 'border-amber-400/30 bg-amber-400/10 text-amber-300',
    admin: 'border-purple-400/30 bg-purple-400/10 text-purple-300',
};

const NOMBRES: Record<Rol, string> = {
    estudiante: 'Estudiante',
    profesor: 'Profesor',
    admin: 'Administrador',
};

const EtiquetaRol = ({ rol }: EtiquetaRolProps) => {
    return (
        <span
            className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${ESTILOS[rol]}`}
        >
            {NOMBRES[rol]}
        </span>
    );
};

export default EtiquetaRol;
