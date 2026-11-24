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
        profesores: number;
        admins: number;
    };
    completados: {
        fijos: number;
        ia: number;
        grupos: number;
    };
    puntos: {
        fijos: number;
        ia: number;
        grupos: number;
        total: number;
    };
    grupos: {
        total: number;
        ejercicios: number;
        pendientes: number;
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
    puntosFijos: number;
    puntosIA: number;
    puntosGrupos: number;
    completadosFijos: number;
    completadosIA: number;
    completadosGrupos: number;
    pendientesGrupos: number;
    grupos: number;
}

export interface GrupoAdmin {
    id: number;
    nombre: string;
    createdAt: string;
    profesor: string;
    estudiantes: number;
    ejercicios: number;
    completados: number;
    pendientes: number;
}

// ===================== GRUPOS (profesor + estudiante) =====================

export interface MetricasProgresoGrupo {
    ejerciciosTotales: number;
    completados: number;
    enProgreso: number;
    sinIniciar: number;
    calificados: number;
    pendientesCalificar: number;
    puntosCalificados: number;
    puntosMaximosCalificados: number;
    avancePorcentaje: number;
    ultimaActividad: string | null;
}

export interface ReporteGrupo {
    grupo: {
        id: number;
        nombre: string;
        createdAt: string;
        profesor: { id: number; username: string };
    };
    resumen: {
        estudiantes: number;
        ejercicios: number;
        tareasPosibles: number;
        completados: number;
        enProgreso: number;
        sinIniciar: number;
        calificados: number;
        pendientesCalificar: number;
        avancePorcentaje: number;
    };
    temarios: Array<{ id: number; nombre: string; orden: number }>;
    ejercicios: Array<{
        id: number;
        titulo: string;
        temario_id: number;
        temario: string;
        puntos: number;
        fecha_limite: string | null;
        tipo: 'diagrama' | 'pseudocodigo';
        asignacion: 'todos' | 'seleccionados';
        estudiantes_asignados_ids: number[];
        createdAt: string;
        iniciados: number;
        completados: number;
        enProgreso: number;
        sinIniciar: number;
        calificados: number;
        pendientesCalificar: number;
        estudiantesAsignados: number;
    }>;
    estudiantes: Array<
        {
            id: number;
            codigo: string;
            username: string;
            fecha_union: string | null;
            porTemario: Array<
                MetricasProgresoGrupo & { temario_id: number }
            >;
        } & MetricasProgresoGrupo
    >;
    entregas: Array<{
        ejercicio_id: number;
        usuario_id: number;
        estado_tablero: string | null;
        completado: boolean;
        calificado: boolean;
        puntos: number;
        puntos_profesor: number | null;
        comentario_profesor: string | null;
        fecha_completado: string | null;
        ultima_actividad: string | null;
    }>;
}

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
export interface CasoPruebaGrupo {
    entradas: string[];
    salidas_esperadas: string[];
}

/** Resultado reportado por el navegador al entregar el ejercicio. */
export interface ResultadoCasoPrueba {
    indice: number;
    aprobado: boolean;
    salida_obtenida: string[];
    error: string | null;
}

export interface EjercicioGrupo {
    id: number;
    grupo_id: number;
    temario_id: number;
    titulo: string;
    enunciado: string;
    tipo: 'diagrama' | 'pseudocodigo';
    asignacion?: 'todos' | 'seleccionados';
    estudiantes_asignados_ids?: number[];
    puntos: number;
    fecha_limite: string | null;
    casos_prueba?: CasoPruebaGrupo[] | null;
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
    resultado_casos_prueba: ResultadoCasoPrueba[] | null;
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
