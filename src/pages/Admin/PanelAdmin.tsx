import {
    useCallback,
    useContext,
    useEffect,
    useState,
} from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import AppShell from '../../components/layout/AppShell';
import TarjetaResumen from '../../components/ui/TarjetaResumen';
import { TokenContext } from '../../Context/TokenContext';
import { UsuarioContext } from '../../Context/UsuarioContext';
import {
    crearProfesorAdmin,
    listarEstudiantesAdmin,
    listarGruposAdmin,
    listarProfesoresAdmin,
    obtenerEstadisticasAdmin,
} from '../../api/adminApi';
import { esErrorDeSesion, obtenerMensajeError } from '../../api/http';
import useCerrarSesion from '../../hooks/useCerrarSesion';
import type {
    DatosCrearProfesor,
    EstadisticasAdmin,
    EstudianteAdmin,
    GrupoAdmin,
    ProfesorAdmin,
} from '../../types/dominio';
import {
    formatearFecha,
    formatearFechaHora,
    formatearNumero,
} from '../../utils/fechas';

type TabAdmin = 'resumen' | 'profesores' | 'grupos' | 'estudiantes';

const TABS: { id: TabAdmin; nombre: string }[] = [
    { id: 'resumen', nombre: 'Resumen' },
    { id: 'profesores', nombre: 'Profesores' },
    { id: 'grupos', nombre: 'Grupos' },
    { id: 'estudiantes', nombre: 'Estudiantes' },
];

const FORMULARIO_INICIAL: DatosCrearProfesor = {
    codigo: '',
    username: '',
    edad: 0,
    password: '',
};

const PanelAdmin = () => {
    const navigate = useNavigate();
    const { claveAcceso } = useContext(TokenContext);
    const { usuario } = useContext(UsuarioContext);
    const cerrarSesion = useCerrarSesion();
    const [searchParams, setSearchParams] = useSearchParams();

    const tabParam = searchParams.get('tab');
    const tab: TabAdmin = TABS.some((item) => item.id === tabParam)
        ? (tabParam as TabAdmin)
        : 'resumen';

    const [estadisticas, setEstadisticas] =
        useState<EstadisticasAdmin | null>(null);
    const [profesores, setProfesores] = useState<ProfesorAdmin[]>([]);
    const [grupos, setGrupos] = useState<GrupoAdmin[]>([]);
    const [estudiantes, setEstudiantes] = useState<EstudianteAdmin[]>([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [formulario, setFormulario] =
        useState<DatosCrearProfesor>(FORMULARIO_INICIAL);
    const [creando, setCreando] = useState(false);
    const [errorFormulario, setErrorFormulario] = useState<string | null>(
        null,
    );
    const [mensajeExito, setMensajeExito] = useState<string | null>(null);

    const manejarErrorSesion = useCallback(
        (errorDesconocido: unknown) => {
            if (esErrorDeSesion(errorDesconocido)) {
                cerrarSesion();
                navigate('/');
                return true;
            }

            return false;
        },
        [cerrarSesion, navigate],
    );

    const cargarTodo = useCallback(async () => {
        if (!claveAcceso) return;

        setCargando(true);
        setError(null);

        try {
            const [
                datosEstadisticas,
                datosProfesores,
                datosGrupos,
                datosEstudiantes,
            ] = await Promise.all([
                obtenerEstadisticasAdmin(claveAcceso),
                listarProfesoresAdmin(claveAcceso),
                listarGruposAdmin(claveAcceso),
                listarEstudiantesAdmin(claveAcceso),
            ]);

            setEstadisticas(datosEstadisticas);
            setProfesores(datosProfesores);
            setGrupos(datosGrupos);
            setEstudiantes(datosEstudiantes);
        } catch (errorDesconocido) {
            if (manejarErrorSesion(errorDesconocido)) return;

            setError(
                obtenerMensajeError(
                    errorDesconocido,
                    'No se pudo cargar el panel administrativo',
                ),
            );
        } finally {
            setCargando(false);
        }
    }, [claveAcceso, manejarErrorSesion]);

    useEffect(() => {
        void cargarTodo();
    }, [cargarTodo]);

    const cambiarTab = (nuevoTab: TabAdmin) => {
        setSearchParams({ tab: nuevoTab }, { replace: true });
        setMensajeExito(null);
    };

    const actualizarCampo = (
        campo: keyof DatosCrearProfesor,
        valor: string,
    ) => {
        setFormulario((anterior) => ({
            ...anterior,
            [campo]: campo === 'edad' ? Number(valor) : valor,
        }));
        setErrorFormulario(null);
        setMensajeExito(null);
    };

    const crearProfesor = async (evento: FormEvent<HTMLFormElement>) => {
        evento.preventDefault();

        const codigo = formulario.codigo.trim().toUpperCase();
        const username = formulario.username.trim();
        const edad = Number(formulario.edad);

        if (!/^[A-Z0-9]{4,20}$/.test(codigo)) {
            setErrorFormulario(
                'El código debe ser alfanumérico de 4 a 20 caracteres',
            );
            return;
        }

        if (username.length < 3) {
            setErrorFormulario('El usuario debe tener al menos 3 caracteres');
            return;
        }

        if (!Number.isInteger(edad) || edad <= 0 || edad > 120) {
            setErrorFormulario('La edad debe estar entre 1 y 120 años');
            return;
        }

        if (formulario.password.length < 4) {
            setErrorFormulario('La contraseña debe tener al menos 4 caracteres');
            return;
        }

        setCreando(true);
        setErrorFormulario(null);
        setMensajeExito(null);

        try {
            const creado = await crearProfesorAdmin(claveAcceso, {
                codigo,
                username,
                edad,
                password: formulario.password,
            });

            setMensajeExito(
                `Profesor ${creado.username} creado con el código ${creado.codigo}`,
            );
            setFormulario(FORMULARIO_INICIAL);
            await cargarTodo();
        } catch (errorDesconocido) {
            if (manejarErrorSesion(errorDesconocido)) return;

            setErrorFormulario(
                obtenerMensajeError(
                    errorDesconocido,
                    'No se pudo crear el profesor',
                ),
            );
        } finally {
            setCreando(false);
        }
    };

    if (!usuario || usuario.rol !== 'admin') return null;

    return (
        <AppShell>
            <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:py-10">
                <div className="rounded-3xl border border-purple-400/20 bg-gradient-to-br from-purple-400/10 via-white/5 to-transparent p-6 shadow-2xl sm:p-8">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-purple-300">
                        Administración
                    </p>
                    <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-white sm:text-4xl">
                        Panel administrativo
                    </h1>
                    <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-300 sm:text-base">
                        Gestiona profesores y revisa la información global de
                        grupos, estudiantes y reportes.
                    </p>
                </div>

                <nav
                    className="mt-6 flex gap-2 overflow-x-auto rounded-2xl border border-white/10 bg-white/5 p-2"
                    style={{ scrollbarWidth: 'thin' }}
                >
                    {TABS.map((item) => (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() => cambiarTab(item.id)}
                            className={`whitespace-nowrap rounded-xl px-4 py-2 text-sm font-semibold transition ${
                                tab === item.id
                                    ? 'bg-[#FF7C02] text-black'
                                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                            }`}
                        >
                            {item.nombre}
                        </button>
                    ))}
                </nav>

                {cargando ? (
                    <div className="mt-6 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-gray-400">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-[#FF7C02]" />
                        Cargando información...
                    </div>
                ) : error ? (
                    <p className="mt-6 rounded-2xl border border-red-400/20 bg-red-500/10 p-5 text-sm text-red-300">
                        {error}
                    </p>
                ) : (
                    <div className="mt-6">
                        {tab === 'resumen' && (
                            <TabResumen estadisticas={estadisticas} />
                        )}

                        {tab === 'profesores' && (
                            <div className="grid gap-6 xl:grid-cols-[0.7fr_1.3fr]">
                                <section className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg sm:p-6">
                                    <h2 className="text-xl font-bold text-white">
                                        Crear profesor
                                    </h2>
                                    <p className="mt-1 text-sm text-gray-400">
                                        El profesor podrá iniciar sesión y crear
                                        sus propios grupos.
                                    </p>

                                    <form
                                        onSubmit={(evento) => {
                                            void crearProfesor(evento);
                                        }}
                                        className="mt-5 space-y-3"
                                    >
                                        <CampoFormulario
                                            id="profesor-codigo"
                                            etiqueta="Código institucional"
                                            valor={formulario.codigo}
                                            onChange={(valor) =>
                                                actualizarCampo(
                                                    'codigo',
                                                    valor.toUpperCase(),
                                                )
                                            }
                                            placeholder="Ej. PROF-2026-01"
                                            autoComplete="off"
                                        />
                                        <CampoFormulario
                                            id="profesor-username"
                                            etiqueta="Usuario"
                                            valor={formulario.username}
                                            onChange={(valor) =>
                                                actualizarCampo(
                                                    'username',
                                                    valor,
                                                )
                                            }
                                            placeholder="Nombre de usuario"
                                            autoComplete="off"
                                        />
                                        <div>
                                            <label
                                                htmlFor="profesor-edad"
                                                className="mb-1.5 block text-sm font-medium text-gray-200"
                                            >
                                                Edad
                                            </label>
                                            <input
                                                id="profesor-edad"
                                                type="number"
                                                min={1}
                                                max={120}
                                                value={
                                                    formulario.edad || ''
                                                }
                                                onChange={(evento) =>
                                                    actualizarCampo(
                                                        'edad',
                                                        evento.target.value,
                                                    )
                                                }
                                                className="w-full rounded-xl border border-white/15 bg-[#181818] px-4 py-2.5 text-sm text-white outline-none transition placeholder:text-gray-500 focus:border-[#FF7C02]"
                                                placeholder="Años"
                                            />
                                        </div>
                                        <CampoFormulario
                                            id="profesor-password"
                                            etiqueta="Contraseña"
                                            tipo="password"
                                            valor={formulario.password}
                                            onChange={(valor) =>
                                                actualizarCampo(
                                                    'password',
                                                    valor,
                                                )
                                            }
                                            placeholder="Contraseña temporal"
                                            autoComplete="new-password"
                                        />
                                        <button
                                            type="submit"
                                            disabled={creando}
                                            className="w-full rounded-xl bg-[#FF7C02] px-4 py-2.5 text-sm font-bold text-black transition hover:bg-[#ff8f2b] disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            {creando
                                                ? 'Creando profesor...'
                                                : 'Crear profesor'}
                                        </button>
                                    </form>

                                    {errorFormulario && (
                                        <p className="mt-3 rounded-xl border border-red-400/20 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                                            {errorFormulario}
                                        </p>
                                    )}
                                    {mensajeExito && (
                                        <p className="mt-3 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-sm text-emerald-300">
                                            {mensajeExito}
                                        </p>
                                    )}
                                </section>

                                <TablaProfesores profesores={profesores} />
                            </div>
                        )}

                        {tab === 'grupos' && (
                            <TablaGrupos grupos={grupos} />
                        )}

                        {tab === 'estudiantes' && (
                            <TablaEstudiantes estudiantes={estudiantes} />
                        )}
                    </div>
                )}
            </main>
        </AppShell>
    );
};

interface CampoFormularioProps {
    id: string;
    etiqueta: string;
    valor: string;
    onChange: (valor: string) => void;
    placeholder?: string;
    tipo?: 'text' | 'password';
    autoComplete?: string;
}

const CampoFormulario = ({
    id,
    etiqueta,
    valor,
    onChange,
    placeholder,
    tipo = 'text',
    autoComplete,
}: CampoFormularioProps) => (
    <div>
        <label
            htmlFor={id}
            className="mb-1.5 block text-sm font-medium text-gray-200"
        >
            {etiqueta}
        </label>
        <input
            id={id}
            type={tipo}
            value={valor}
            onChange={(evento) => onChange(evento.target.value)}
            placeholder={placeholder}
            autoComplete={autoComplete}
            className="w-full rounded-xl border border-white/15 bg-[#181818] px-4 py-2.5 text-sm text-white outline-none transition placeholder:text-gray-500 focus:border-[#FF7C02]"
        />
    </div>
);

const TabResumen = ({
    estadisticas,
}: {
    estadisticas: EstadisticasAdmin | null;
}) => {
    if (!estadisticas) {
        return (
            <p className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-gray-400">
                No hay estadísticas disponibles.
            </p>
        );
    }

    return (
        <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <TarjetaResumen
                    titulo="Estudiantes"
                    valor={formatearNumero(estadisticas.usuarios.estudiantes)}
                    detalle="Cuentas registradas"
                    acento="azul"
                />
                <TarjetaResumen
                    titulo="Profesores"
                    valor={formatearNumero(estadisticas.usuarios.profesores)}
                    detalle={`${formatearNumero(estadisticas.usuarios.admins)} administradores`}
                    acento="naranja"
                />
                <TarjetaResumen
                    titulo="Grupos y matrículas"
                    valor={formatearNumero(estadisticas.grupos)}
                    detalle={`${formatearNumero(estadisticas.matriculas)} matrículas`}
                    acento="verde"
                />
                <TarjetaResumen
                    titulo="Puntos totales"
                    valor={formatearNumero(estadisticas.puntos.total)}
                    detalle={`${formatearNumero(estadisticas.completados.fijos + estadisticas.completados.ia)} ejercicios completados`}
                    acento="blanco"
                />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <section className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg">
                    <h2 className="text-lg font-bold text-white">
                        Actividad global
                    </h2>
                    <dl className="mt-4 space-y-3 text-sm">
                        <div className="flex items-center justify-between gap-3">
                            <dt className="text-gray-400">
                                Ejercicios fijos completados
                            </dt>
                            <dd className="font-bold text-sky-400">
                                {formatearNumero(
                                    estadisticas.completados.fijos,
                                )}
                            </dd>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                            <dt className="text-gray-400">
                                Ejercicios con IA completados
                            </dt>
                            <dd className="font-bold text-[#FF7C02]">
                                {formatearNumero(estadisticas.completados.ia)}
                            </dd>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                            <dt className="text-gray-400">Puntos fijos</dt>
                            <dd className="font-bold text-white">
                                {formatearNumero(estadisticas.puntos.fijos)}
                            </dd>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                            <dt className="text-gray-400">Puntos con IA</dt>
                            <dd className="font-bold text-white">
                                {formatearNumero(estadisticas.puntos.ia)}
                            </dd>
                        </div>
                    </dl>
                    <p className="mt-4 rounded-xl bg-[#181818] px-3 py-2.5 text-xs text-gray-400">
                        Última actividad:{' '}
                        <span className="font-semibold text-gray-200">
                            {formatearFechaHora(
                                estadisticas.ultimaActividad,
                            )}
                        </span>
                    </p>
                </section>

                <section className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg">
                    <h2 className="text-lg font-bold text-white">
                        Distribución de usuarios
                    </h2>
                    <div className="mt-4 space-y-3">
                        {[
                            {
                                nombre: 'Estudiantes',
                                valor: estadisticas.usuarios.estudiantes,
                                color: 'bg-sky-400',
                            },
                            {
                                nombre: 'Profesores',
                                valor: estadisticas.usuarios.profesores,
                                color: 'bg-[#FF7C02]',
                            },
                            {
                                nombre: 'Administradores',
                                valor: estadisticas.usuarios.admins,
                                color: 'bg-purple-400',
                            },
                        ].map((item) => {
                            const total =
                                estadisticas.usuarios.estudiantes +
                                estadisticas.usuarios.profesores +
                                estadisticas.usuarios.admins;
                            const porcentaje = total
                                ? Math.round((item.valor / total) * 100)
                                : 0;

                            return (
                                <div key={item.nombre}>
                                    <div className="mb-1 flex items-center justify-between text-xs text-gray-400">
                                        <span>{item.nombre}</span>
                                        <span>
                                            {formatearNumero(item.valor)} (
                                            {porcentaje}%)
                                        </span>
                                    </div>
                                    <div className="h-2 overflow-hidden rounded-full bg-white/10">
                                        <div
                                            className={`h-full rounded-full ${item.color}`}
                                            style={{
                                                width: `${porcentaje}%`,
                                            }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>
            </div>
        </div>
    );
};

const TablaProfesores = ({
    profesores,
}: {
    profesores: ProfesorAdmin[];
}) => (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
                <h2 className="text-xl font-bold text-white">Profesores</h2>
                <p className="mt-1 text-sm text-gray-400">
                    Cuentas con rol de profesor y sus grupos.
                </p>
            </div>
            <span className="rounded-full bg-[#FF7C02]/15 px-3 py-1 text-xs font-bold text-[#FF9D3D]">
                {profesores.length}
            </span>
        </div>

        {profesores.length === 0 ? (
            <p className="mt-6 rounded-xl border border-dashed border-white/15 px-4 py-8 text-center text-sm text-gray-400">
                Todavía no hay profesores registrados.
            </p>
        ) : (
            <>
                <div className="mt-5 hidden overflow-x-auto lg:block">
                    <table className="w-full min-w-[720px] border-separate border-spacing-y-2 text-left text-sm">
                        <thead>
                            <tr className="text-xs uppercase tracking-wider text-gray-400">
                                <th className="px-3 py-2">Profesor</th>
                                <th className="px-3 py-2">Código</th>
                                <th className="px-3 py-2">Edad</th>
                                <th className="px-3 py-2">Grupos</th>
                                <th className="px-3 py-2">Estudiantes</th>
                                <th className="px-3 py-2">Registro</th>
                            </tr>
                        </thead>
                        <tbody>
                            {profesores.map((profesor) => (
                                <tr
                                    key={profesor.id}
                                    className="bg-[#181818]"
                                >
                                    <td className="rounded-l-xl px-3 py-3 font-semibold text-white">
                                        {profesor.username}
                                    </td>
                                    <td className="px-3 py-3 font-mono text-xs text-gray-300">
                                        {profesor.codigo}
                                    </td>
                                    <td className="px-3 py-3 text-gray-300">
                                        {profesor.edad}
                                    </td>
                                    <td className="px-3 py-3 text-sky-300">
                                        {profesor.grupos}
                                    </td>
                                    <td className="px-3 py-3 text-emerald-300">
                                        {profesor.estudiantes}
                                    </td>
                                    <td className="rounded-r-xl px-3 py-3 text-xs text-gray-400">
                                        {formatearFecha(
                                            profesor.createdAt,
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="mt-5 grid gap-3 lg:hidden">
                    {profesores.map((profesor) => (
                        <article
                            key={profesor.id}
                            className="rounded-2xl border border-white/10 bg-[#181818] p-4"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <h3 className="font-bold text-white">
                                        {profesor.username}
                                    </h3>
                                    <p className="mt-1 font-mono text-xs text-gray-400">
                                        {profesor.codigo}
                                    </p>
                                </div>
                                <span className="text-xs text-gray-400">
                                    {profesor.edad} años
                                </span>
                            </div>
                            <div className="mt-3 flex flex-wrap gap-2 text-xs">
                                <span className="rounded-lg bg-white/5 px-2 py-1 text-sky-300">
                                    {profesor.grupos} grupos
                                </span>
                                <span className="rounded-lg bg-white/5 px-2 py-1 text-emerald-300">
                                    {profesor.estudiantes} estudiantes
                                </span>
                                <span className="rounded-lg bg-white/5 px-2 py-1 text-gray-400">
                                    {formatearFecha(profesor.createdAt)}
                                </span>
                            </div>
                        </article>
                    ))}
                </div>
            </>
        )}
    </section>
);

const TablaGrupos = ({ grupos }: { grupos: GrupoAdmin[] }) => (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
                <h2 className="text-xl font-bold text-white">Grupos</h2>
                <p className="mt-1 text-sm text-gray-400">
                    Todos los grupos de la plataforma y su profesor.
                </p>
            </div>
            <span className="rounded-full bg-sky-400/15 px-3 py-1 text-xs font-bold text-sky-300">
                {grupos.length}
            </span>
        </div>

        {grupos.length === 0 ? (
            <p className="mt-6 rounded-xl border border-dashed border-white/15 px-4 py-8 text-center text-sm text-gray-400">
                Todavía no hay grupos creados.
            </p>
        ) : (
            <>
                <div className="mt-5 hidden overflow-x-auto lg:block">
                    <table className="w-full min-w-[760px] border-separate border-spacing-y-2 text-left text-sm">
                        <thead>
                            <tr className="text-xs uppercase tracking-wider text-gray-400">
                                <th className="px-3 py-2">Grupo</th>
                                <th className="px-3 py-2">Código</th>
                                <th className="px-3 py-2">Profesor</th>
                                <th className="px-3 py-2">Estudiantes</th>
                                <th className="px-3 py-2">Creado</th>
                                <th className="px-3 py-2" />
                            </tr>
                        </thead>
                        <tbody>
                            {grupos.map((grupo) => (
                                <tr key={grupo.id} className="bg-[#181818]">
                                    <td className="rounded-l-xl px-3 py-3 font-semibold text-white">
                                        {grupo.nombre}
                                    </td>
                                    <td className="px-3 py-3 font-mono text-xs text-[#FF9D3D]">
                                        {grupo.codigo}
                                    </td>
                                    <td className="px-3 py-3 text-gray-300">
                                        {grupo.profesor?.username ??
                                            'Sin asignar'}
                                    </td>
                                    <td className="px-3 py-3 text-sky-300">
                                        {grupo.estudiantes}
                                    </td>
                                    <td className="px-3 py-3 text-xs text-gray-400">
                                        {formatearFecha(grupo.createdAt)}
                                    </td>
                                    <td className="rounded-r-xl px-3 py-3 text-right">
                                        <Link
                                            to={`/grupos/${grupo.id}`}
                                            className="rounded-lg bg-[#FF7C02] px-3 py-1.5 text-xs font-bold text-black transition hover:bg-[#ff8f2b]"
                                        >
                                            Ver reporte
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="mt-5 grid gap-3 lg:hidden">
                    {grupos.map((grupo) => (
                        <article
                            key={grupo.id}
                            className="rounded-2xl border border-white/10 bg-[#181818] p-4"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <h3 className="font-bold text-white">
                                        {grupo.nombre}
                                    </h3>
                                    <p className="mt-1 text-xs text-gray-400">
                                        Profesor:{' '}
                                        {grupo.profesor?.username ??
                                            'Sin asignar'}
                                    </p>
                                </div>
                                <span className="rounded-lg bg-[#FF7C02]/15 px-2 py-1 font-mono text-[11px] font-bold tracking-wider text-[#FF9D3D]">
                                    {grupo.codigo}
                                </span>
                            </div>
                            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-gray-400">
                                <span className="rounded-lg bg-white/5 px-2 py-1">
                                    {grupo.estudiantes} estudiantes
                                </span>
                                <span className="rounded-lg bg-white/5 px-2 py-1">
                                    {formatearFecha(grupo.createdAt)}
                                </span>
                            </div>
                            <Link
                                to={`/grupos/${grupo.id}`}
                                className="mt-3 inline-block rounded-xl bg-[#FF7C02] px-3 py-2 text-xs font-bold text-black transition hover:bg-[#ff8f2b]"
                            >
                                Ver reporte
                            </Link>
                        </article>
                    ))}
                </div>
            </>
        )}
    </section>
);

const TablaEstudiantes = ({
    estudiantes,
}: {
    estudiantes: EstudianteAdmin[];
}) => (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
                <h2 className="text-xl font-bold text-white">Estudiantes</h2>
                <p className="mt-1 text-sm text-gray-400">
                    Puntos, grupos y ejercicios completados por estudiante.
                </p>
            </div>
            <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-bold text-emerald-300">
                {estudiantes.length}
            </span>
        </div>

        {estudiantes.length === 0 ? (
            <p className="mt-6 rounded-xl border border-dashed border-white/15 px-4 py-8 text-center text-sm text-gray-400">
                Todavía no hay estudiantes registrados.
            </p>
        ) : (
            <>
                <div className="mt-5 hidden overflow-x-auto lg:block">
                    <table className="w-full min-w-[780px] border-separate border-spacing-y-2 text-left text-sm">
                        <thead>
                            <tr className="text-xs uppercase tracking-wider text-gray-400">
                                <th className="px-3 py-2">Estudiante</th>
                                <th className="px-3 py-2">Código</th>
                                <th className="px-3 py-2">Edad</th>
                                <th className="px-3 py-2">Grupos</th>
                                <th className="px-3 py-2">Puntos</th>
                                <th className="px-3 py-2">Completados</th>
                                <th className="px-3 py-2" />
                            </tr>
                        </thead>
                        <tbody>
                            {estudiantes.map((estudiante) => (
                                <tr
                                    key={estudiante.id}
                                    className="bg-[#181818]"
                                >
                                    <td className="rounded-l-xl px-3 py-3 font-semibold text-white">
                                        {estudiante.username}
                                    </td>
                                    <td className="px-3 py-3 font-mono text-xs text-gray-300">
                                        {estudiante.codigo}
                                    </td>
                                    <td className="px-3 py-3 text-gray-300">
                                        {estudiante.edad}
                                    </td>
                                    <td className="px-3 py-3 text-sky-300">
                                        {estudiante.grupos}
                                    </td>
                                    <td className="px-3 py-3 font-bold text-[#FF7C02]">
                                        {formatearNumero(estudiante.puntos)}
                                    </td>
                                    <td className="px-3 py-3 text-emerald-300">
                                        {estudiante.completados}
                                    </td>
                                    <td className="rounded-r-xl px-3 py-3 text-right">
                                        <Link
                                            to={`/estudiantes/${estudiante.id}`}
                                            className="rounded-lg bg-[#FF7C02] px-3 py-1.5 text-xs font-bold text-black transition hover:bg-[#ff8f2b]"
                                        >
                                            Ver reporte
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="mt-5 grid gap-3 lg:hidden">
                    {estudiantes.map((estudiante) => (
                        <article
                            key={estudiante.id}
                            className="rounded-2xl border border-white/10 bg-[#181818] p-4"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <h3 className="font-bold text-white">
                                        {estudiante.username}
                                    </h3>
                                    <p className="mt-1 font-mono text-xs text-gray-400">
                                        {estudiante.codigo}
                                    </p>
                                </div>
                                <span className="text-sm font-bold text-[#FF7C02]">
                                    {formatearNumero(estudiante.puntos)} pts
                                </span>
                            </div>
                            <div className="mt-3 flex flex-wrap gap-2 text-xs">
                                <span className="rounded-lg bg-white/5 px-2 py-1 text-gray-400">
                                    {estudiante.edad} años
                                </span>
                                <span className="rounded-lg bg-white/5 px-2 py-1 text-sky-300">
                                    {estudiante.grupos} grupos
                                </span>
                                <span className="rounded-lg bg-white/5 px-2 py-1 text-emerald-300">
                                    {estudiante.completados} completados
                                </span>
                            </div>
                            <Link
                                to={`/estudiantes/${estudiante.id}`}
                                className="mt-3 inline-block rounded-xl bg-[#FF7C02] px-3 py-2 text-xs font-bold text-black transition hover:bg-[#ff8f2b]"
                            >
                                Ver reporte
                            </Link>
                        </article>
                    ))}
                </div>
            </>
        )}
    </section>
);

export default PanelAdmin;
