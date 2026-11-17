import { useContext, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import AppShell from '../../components/layout/AppShell';
import PantallaCargando from '../../components/ui/PantallaCargando';
import { TokenContext } from '../../Context/TokenContext';
import { UsuarioContext } from '../../Context/UsuarioContext';
import { esErrorDeSesion, obtenerMensajeError } from '../../api/http';
import {
    crearGrupo,
    eliminarGrupo,
    listarMisGruposEstudiante,
    listarMisGruposProfesor,
    salirDeGrupo,
    unirseAGrupo,
} from '../../api/gruposApi';
import type {
    GrupoEstudiante,
    GrupoProfesor,
} from '../../types/dominio';

/**
 * /grupos — Inicio del módulo según el rol:
 * - Profesor: lista sus grupos y crea uno nuevo.
 * - Estudiante: ve sus grupos, se une con el código y puede salir.
 */
const GruposInicio = () => {
    const { claveAcceso } = useContext(TokenContext);
    const { usuario } = useContext(UsuarioContext);
    const navigate = useNavigate();

    const [cargando, setCargando] = useState(true);
    const [gruposProfesor, setGruposProfesor] = useState<GrupoProfesor[]>([]);
    const [gruposEstudiante, setGruposEstudiante] = useState<GrupoEstudiante[]>(
        [],
    );
    const [nombreNuevo, setNombreNuevo] = useState('');
    const [codigoUnion, setCodigoUnion] = useState('');
    const [creando, setCreando] = useState(false);
    const [uniendo, setUniendo] = useState(false);

    const cargarGrupos = async () => {
        if (!claveAcceso || !usuario) return;
        setCargando(true);
        try {
            if (usuario.rol === 'profesor') {
                setGruposProfesor(await listarMisGruposProfesor(claveAcceso));
            } else {
                setGruposEstudiante(
                    await listarMisGruposEstudiante(claveAcceso),
                );
            }
        } catch (error) {
            if (esErrorDeSesion(error)) return;
            const mensaje = obtenerMensajeError(
                error,
                'No se pudieron cargar tus grupos',
            );
            await Swal.fire({
                icon: 'error',
                title: 'Error',
                text: mensaje,
            });
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        void cargarGrupos();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [claveAcceso, usuario?.rol]);

    const crearGrupoNuevo = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!claveAcceso) return;

        setCreando(true);
        try {
            const grupo = await crearGrupo(claveAcceso, nombreNuevo.trim());
            await Swal.fire({
                icon: 'success',
                title: 'Grupo creado',
                html: `Comparte este código con tus estudiantes:<br><b style="font-size:2rem;letter-spacing:4px">${grupo.codigo}</b>`,
            });
            setNombreNuevo('');
            void cargarGrupos();
        } catch (error) {
            const mensaje = obtenerMensajeError(
                error,
                'No se pudo crear el grupo',
            );
            await Swal.fire({ icon: 'error', title: 'Error', text: mensaje });
        } finally {
            setCreando(false);
        }
    };

    const unirseConCodigo = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!claveAcceso) return;

        setUniendo(true);
        try {
            const grupo = await unirseAGrupo(
                claveAcceso,
                codigoUnion.trim().toUpperCase(),
            );
            await Swal.fire({
                icon: 'success',
                title: 'Te uniste al grupo',
                text: `Ahora estás en "${grupo.nombre}"`,
                timer: 1600,
                showConfirmButton: false,
            });
            setCodigoUnion('');
            void cargarGrupos();
        } catch (error) {
            const mensaje = obtenerMensajeError(
                error,
                'No se pudo unir al grupo',
            );
            await Swal.fire({ icon: 'error', title: 'Error', text: mensaje });
        } finally {
            setUniendo(false);
        }
    };

    const salir = async (grupo: GrupoEstudiante) => {
        if (!claveAcceso) return;

        const confirmar = await Swal.fire({
            icon: 'warning',
            title: '¿Salir del grupo?',
            text: `Vas a salir de "${grupo.nombre}"`,
            showCancelButton: true,
            confirmButtonText: 'Salir',
            cancelButtonText: 'Cancelar',
        });

        if (!confirmar.isConfirmed) return;

        try {
            await salirDeGrupo(claveAcceso, grupo.id);
            void cargarGrupos();
        } catch (error) {
            const mensaje = obtenerMensajeError(
                error,
                'No se pudo salir del grupo',
            );
            await Swal.fire({ icon: 'error', title: 'Error', text: mensaje });
        }
    };

    const eliminar = async (grupo: GrupoProfesor) => {
        if (!claveAcceso) return;

        const confirmar = await Swal.fire({
            icon: 'warning',
            title: '¿Eliminar grupo?',
            text: `Se borrarán "${grupo.nombre}", sus temarios, ejercicios y entregas.`,
            showCancelButton: true,
            confirmButtonText: 'Eliminar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#d33',
        });

        if (!confirmar.isConfirmed) return;

        try {
            await eliminarGrupo(claveAcceso, grupo.id);
            void cargarGrupos();
        } catch (error) {
            const mensaje = obtenerMensajeError(
                error,
                'No se pudo eliminar el grupo',
            );
            await Swal.fire({ icon: 'error', title: 'Error', text: mensaje });
        }
    };

    if (!usuario) return null;

    if (cargando) {
        return (
            <AppShell>
                <PantallaCargando mensaje="Cargando tus grupos..." />
            </AppShell>
        );
    }

    const esProfesor = usuario.rol === 'profesor';

    return (
        <AppShell>
            <div className="mx-auto w-full max-w-5xl px-4 py-8">
                <div className="mb-6 flex items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white">
                            Grupos
                        </h1>
                        <p className="text-sm text-gray-400">
                            {esProfesor
                                ? 'Crea grupos, comparte el código y publica ejercicios por temario.'
                                : 'Únete con el código que te dio tu profesor.'}
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/20"
                    >
                        Volver
                    </button>
                </div>

                {esProfesor ? (
                    <form
                        onSubmit={crearGrupoNuevo}
                        className="mb-8 flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4"
                    >
                        <input
                            value={nombreNuevo}
                            onChange={(e) => setNombreNuevo(e.target.value)}
                            placeholder="Nombre del nuevo grupo (ej. 5to A)"
                            className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/30 px-4 py-2 text-white placeholder:text-gray-500 focus:border-[#FF7C02] focus:outline-none"
                            maxLength={80}
                            required
                        />
                        <button
                            type="submit"
                            disabled={creando || nombreNuevo.trim().length < 2}
                            className="rounded-xl bg-[#FF7C02] px-5 py-2 font-semibold text-black disabled:opacity-50"
                        >
                            {creando ? 'Creando...' : '+ Crear grupo'}
                        </button>
                    </form>
                ) : (
                    <form
                        onSubmit={unirseConCodigo}
                        className="mb-8 flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4"
                    >
                        <input
                            value={codigoUnion}
                            onChange={(e) =>
                                setCodigoUnion(e.target.value.toUpperCase())
                            }
                            placeholder="Código del grupo (6 caracteres)"
                            className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/30 px-4 py-2 font-mono text-lg tracking-widest text-white placeholder:text-gray-500 focus:border-[#FF7C02] focus:outline-none"
                            maxLength={6}
                            required
                        />
                        <button
                            type="submit"
                            disabled={uniendo || codigoUnion.length !== 6}
                            className="rounded-xl bg-[#FF7C02] px-5 py-2 font-semibold text-black disabled:opacity-50"
                        >
                            {uniendo ? 'Uniéndo...' : 'Unirme'}
                        </button>
                    </form>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                    {esProfesor &&
                        gruposProfesor.map((grupo) => (
                            <div
                                key={grupo.id}
                                className="rounded-2xl border border-white/10 bg-white/5 p-5"
                            >
                                <div className="mb-3 flex items-start justify-between gap-3">
                                    <div>
                                        <h2 className="text-lg font-bold text-white">
                                            {grupo.nombre}
                                        </h2>
                                        <p className="mt-1 font-mono text-sm tracking-widest text-[#FF7C02]">
                                            {grupo.codigo}
                                        </p>
                                    </div>
                                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-gray-300">
                                        {grupo.estudiantes}{' '}
                                        {grupo.estudiantes === 1
                                            ? 'estudiante'
                                            : 'estudiantes'}
                                    </span>
                                </div>
                                <div className="flex gap-2">
                                    <Link
                                        to={`/grupos/${grupo.id}`}
                                        className="flex-1 rounded-xl bg-[#FF7C02] px-4 py-2 text-center text-sm font-semibold text-black hover:brightness-110"
                                    >
                                        Abrir grupo
                                    </Link>
                                    <button
                                        onClick={() => eliminar(grupo)}
                                        className="rounded-xl bg-red-500/20 px-3 py-2 text-sm text-red-300 hover:bg-red-500/30"
                                        title="Eliminar grupo"
                                    >
                                        🗑
                                    </button>
                                </div>
                            </div>
                        ))}

                    {!esProfesor &&
                        gruposEstudiante.map((grupo) => (
                            <div
                                key={grupo.id}
                                className="rounded-2xl border border-white/10 bg-white/5 p-5"
                            >
                                <div className="mb-3">
                                    <h2 className="text-lg font-bold text-white">
                                        {grupo.nombre}
                                    </h2>
                                    <p className="text-sm text-gray-400">
                                        Profesor: {grupo.profesor} · Desde{' '}
                                        {grupo.fecha_union}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <Link
                                        to={`/grupos/${grupo.id}`}
                                        className="flex-1 rounded-xl bg-[#FF7C02] px-4 py-2 text-center text-sm font-semibold text-black hover:brightness-110"
                                    >
                                        Abrir grupo
                                    </Link>
                                    <button
                                        onClick={() => salir(grupo)}
                                        className="rounded-xl bg-red-500/20 px-3 py-2 text-sm text-red-300 hover:bg-red-500/30"
                                        title="Salir del grupo"
                                    >
                                        Salir
                                    </button>
                                </div>
                            </div>
                        ))}
                </div>

                {((esProfesor && gruposProfesor.length === 0) ||
                    (!esProfesor && gruposEstudiante.length === 0)) && (
                    <p className="mt-6 text-center text-sm text-gray-500">
                        {esProfesor
                            ? 'Aún no tienes grupos. Crea el primero arriba.'
                            : 'Aún no perteneces a ningún grupo. Únete con un código.'}
                    </p>
                )}

                {usuario.rol === 'estudiante' && (
                    <p className="mt-10 text-center text-xs text-gray-600">
                        Tus puntos de grupos se suman a tu puntuación total.
                    </p>
                )}
            </div>
        </AppShell>
    );
};

export default GruposInicio;
