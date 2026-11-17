export type Rol = 'estudiante' | 'profesor' | 'admin';

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

// ===================== GRUPOS (profesor + estudiante) =====================

/** Grupo visto por el profesor (con conteo de inscritos). */
export interface GrupoProfesor {
    id: number;
    nombre: string;
    codigo: string;
    createdAt: string;
    estudiantes: number;
}

/** Grupo visto por el estudiante (con su profesor). */
export interface GrupoEstudiante {
    id: number;
    nombre: string;
    codigo: string;
    profesor: string;
    fecha_union: string;
}

/** Estudiante inscrito en un grupo (vista del profesor). */
export interface EstudianteGrupo {
    id: number;
    codigo: string;
    username: string;
    fecha_union: string;
}

/** Temario dentro de un grupo. */
export interface TemarioGrupo {
    id: number;
    nombre: string;
    orden: number;
    /** Conteo de ejercicios (profesor) o avance (estudiante). */
    ejercicios?: number;
    total?: number;
    completados?: number;
}

/** Ejercicio de grupo creado por el profesor. */
export interface EjercicioGrupo {
    id: number;
    grupo_id: number;
    temario_id: number;
    titulo: string;
    enunciado: string;
    tipo: 'diagrama' | 'pseudocodigo';
    puntos: number;
    fecha_limite: string | null;
    createdAt: string;
    /** Vista del profesor: cuántos entregaron / completaron. */
    entregas?: number;
    completados?: number;
    /** Vista del estudiante. */
    vencido?: boolean;
    mi_entrega?: EstadoEntrega;
}

/** Estado de la entrega del estudiante para un ejercicio (su fila). */
export interface EstadoEntrega {
    completado: boolean;
    calificado: boolean;
    puntos: number;
    puntos_profesor: number | null;
}

/** Detalle al abrir un ejercicio como estudiante. */
export interface EjercicioAbierto {
    ejercicio: EjercicioGrupo;
    vencido: boolean;
    entrega: {
        estado_tablero: string | null;
        completado: boolean;
        calificado: boolean;
        puntos: number;
        puntos_profesor: number | null;
        comentario_profesor: string | null;
    };
}

/** Entrega de un estudiante (vista del profesor en "Soluciones"). */
export interface EntregaGrupo {
    id: number;
    usuario_id: number;
    estado_tablero: string | null;
    completado: boolean;
    puntos: number;
    calificado: boolean;
    puntos_profesor: number | null;
    comentario_profesor: string | null;
    fecha_completado: string | null;
    ultima_actividad: string | null;
    estudiante: {
        id: number;
        codigo: string;
        username: string;
    };
}

/** Fila del ranking de un grupo. */
export interface FilaRankingGrupo {
    estudiante: { id: number; codigo: string; username: string };
    completados: number;
    puntos: number;
}

export interface RankingGrupo {
    grupo: { id: number; nombre: string };
    ranking: FilaRankingGrupo[];
}
