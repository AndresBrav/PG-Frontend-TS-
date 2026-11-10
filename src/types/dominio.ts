export type Rol = 'estudiante' | 'admin';

export interface PerfilUsuario {
    id: number;
    codigo: string;
    username: string;
    edad: number;
    rol: Rol;
    avatarUrl: string | null;
    puntos: number;
}

/** Resumen de progreso propio (suma de ejercicios fijos y con IA). */
export interface MiProgreso {
    usuario: {
        id: number;
        codigo: string;
        username: string;
        edad: number;
        rol: Rol;
    };
    resumen: {
        fijosCompletados: number;
        fijosTotales: number;
        iaCompletados: number;
        iaGenerados: number;
        /** Progreso total entre 0 y 1. */
        progreso: number;
    };
}

export interface EstadisticasAdmin {
    usuarios: {
        estudiantes: number;
        admins: number;
    };
    completados: {
        fijos: number;
        ia: number;
    };
    puntos: {
        fijos: number;
        ia: number;
        total: number;
    };
    ultimaActividad: string | null;
}

export interface EstudianteAdmin {
    id: number;
    codigo: string;
    username: string;
    edad: number;
    createdAt: string;
    puntos: number;
    completados: number;
}
