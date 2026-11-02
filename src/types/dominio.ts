export type Rol = 'estudiante' | 'profesor' | 'admin';

/** Roles que un usuario puede elegir desde el registro pÃºblico. */
export type RolDeRegistro = Exclude<Rol, 'admin'>;

export interface PerfilUsuario {
    id: number;
    codigo: string;
    username: string;
    edad: number;
    rol: Rol;
    avatarUrl: string | null;
    puntos: number;
}

export interface ProfesorBasico {
    id: number;
    codigo: string;
    username: string;
}

export interface GrupoEstudiante {
    id: number;
    nombre: string;
    codigo: string;
    profesor_id?: number;
    createdAt?: string;
    updatedAt?: string;
    profesor?: ProfesorBasico | null;
}

export interface GrupoProfesor {
    id: number;
    nombre: string;
    codigo: string;
    createdAt: string;
    estudiantes: number;
}

export interface GrupoAdmin {
    id: number;
    nombre: string;
    codigo: string;
    profesor?: ProfesorBasico | null;
    estudiantes: number;
    createdAt: string;
}

export interface GrupoCreado {
    id: number;
    nombre: string;
    codigo: string;
}

export interface EstudianteBasico {
    id: number;
    codigo: string;
    username: string;
    edad?: number;
}

export interface GrupoDetalle {
    id: number;
    nombre: string;
    codigo: string;
    profesor?: ProfesorBasico | null;
    estudiantes: EstudianteBasico[];
}

export interface ResumenReporteGrupo {
    estudiantes: number;
    promedioPuntos: number;
    promedioProgreso: number;
    completadosEnRango: number;
}

export interface EstudianteReporteGrupo {
    id: number;
    codigo: string;
    username: string;
    puntos: number;
    fijosCompletados: number;
    iaCompletados: number;
    fijosTotales: number;
    iaGenerados: number;
    progreso: number;
    ultimaActividad: string | null;
}

export interface SerieEvolucion {
    estudiante_id: number;
    codigo: string;
    username: string;
    acumulado: number[];
}

export interface ReporteGrupo {
    grupo: {
        id: number;
        nombre: string;
        codigo: string;
    };
    rango: {
        desde: string | null;
        hasta: string | null;
    };
    resumen: ResumenReporteGrupo;
    estudiantes: EstudianteReporteGrupo[];
    evolucion: {
        fechas: string[];
        series: SerieEvolucion[];
    };
}

export interface EjercicioReporte {
    juego_id: number;
    nombre: string;
    nivel: number;
    completado: boolean;
    puntos: number;
    intentos: number;
    fecha_completado: string | null;
    ultima_actividad: string | null;
}

export interface JuegoIAReporte {
    id: number;
    descripcion: string;
    tipo: string;
    completado: boolean;
    puntos: number;
    fecha_completado: string | null;
}

export interface ActividadDia {
    fecha: string;
    completados: number;
    puntos: number;
}

export interface ResumenReporteEstudiante {
    puntos: number;
    fijosCompletados: number;
    fijosTotales: number;
    iaCompletados: number;
    iaGenerados: number;
    progreso: number;
}

export interface ReporteEstudiante {
    usuario: {
        id: number;
        codigo: string;
        username: string;
        edad: number;
        rol: Rol;
    };
    resumen: ResumenReporteEstudiante;
    ejercicios: EjercicioReporte[];
    ia: JuegoIAReporte[];
    actividadPorDia: ActividadDia[];
}

export interface EstadisticasAdmin {
    usuarios: {
        estudiantes: number;
        profesores: number;
        admins: number;
    };
    grupos: number;
    matriculas: number;
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

export interface ProfesorAdmin {
    id: number;
    codigo: string;
    username: string;
    edad: number;
    createdAt: string;
    grupos: number;
    estudiantes: number;
}

export interface EstudianteAdmin {
    id: number;
    codigo: string;
    username: string;
    edad: number;
    grupos: number;
    puntos: number;
    completados: number;
}

export interface DatosCrearProfesor {
    codigo: string;
    username: string;
    edad: number;
    password: string;
}

export type TipoEjercicioGrupo = 'diagrama' | 'pseudocodigo';

export interface EjercicioGrupoProfesor {
    id: number;
    grupo_id: number;
    titulo: string;
    enunciado: string;
    tipo: TipoEjercicioGrupo;
    puntos: number;
    createdAt: string;
    updatedAt: string;
    completados: number;
    totalEstudiantes: number;
}

export interface EjercicioGrupoEstudiante {
    id: number;
    grupo_id: number;
    titulo: string;
    enunciado: string;
    tipo: TipoEjercicioGrupo;
    puntos: number;
    completado: boolean;
    puntosObtenidos: number;
    fecha_completado: string | null;
    ultima_actividad: string | null;
    estado_tablero?: string | null;
}

export interface SolucionEstudianteGrupo {
    usuario: {
        id: number;
        codigo: string;
        username: string;
    };
    completado: boolean;
    puntos: number;
    fecha_completado: string | null;
    ultima_actividad: string | null;
    tieneSolucion: boolean;
    estado_tablero: string | null;
}

export interface DetalleSolucionesGrupo {
    ejercicio: {
        id: number;
        grupo_id: number;
        titulo: string;
        enunciado: string;
        tipo: TipoEjercicioGrupo;
        puntos: number;
    };
    soluciones: SolucionEstudianteGrupo[];
}

export interface DatosCrearEjercicioGrupo {
    titulo: string;
    enunciado: string;
    tipo: TipoEjercicioGrupo;
    puntos: number;
}
