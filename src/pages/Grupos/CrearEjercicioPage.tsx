import { useContext, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import AppShell from '../../components/layout/AppShell';
import { TokenContext } from '../../Context/TokenContext';
import { esErrorDeSesion, obtenerMensajeError } from '../../api/http';
import {
    crearEjercicioGrupo,
    listarTemariosGrupo,
    obtenerGrupoProfesor,
} from '../../api/gruposApi';
import type {
    CasoPruebaGrupo,
    EstudianteGrupo,
    TemarioGrupo,
} from '../../types/dominio';

interface CasoPruebaFormulario {
    entradas: string;
    salidasEsperadas: string;
}

const separarLineas = (texto: string): string[] =>
    texto === '' ? [] : texto.replace(/\r/g, '').split('\n');

/**
 * /profesor/grupos/:id/ejercicios/nuevo — Creación de ejercicio de
 * grupo como PÁGINA (no modal): título, enunciado, tipo, puntos,
 * temario obligatorio y fecha límite opcional.
 */
const CrearEjercicioPage = () => {
    const { id } = useParams<{ id: string }>();
    const { claveAcceso } = useContext(TokenContext);
    const navigate = useNavigate();

    const [temarios, setTemarios] = useState<TemarioGrupo[]>([]);
    const [estudiantes, setEstudiantes] = useState<EstudianteGrupo[]>([]);
    const [temarioId, setTemarioId] = useState<string>('');
    const [titulo, setTitulo] = useState('');
    const [enunciado, setEnunciado] = useState('');
    const [tipo, setTipo] = useState<'diagrama' | 'pseudocodigo'>(
        'pseudocodigo',
    );
    const [puntos, setPuntos] = useState('5');
    const [conLimite, setConLimite] = useState(false);
    const [fechaLimite, setFechaLimite] = useState('');
    const [casosPrueba, setCasosPrueba] = useState<CasoPruebaFormulario[]>(
        [],
    );
    const [asignacion, setAsignacion] = useState<
        'todos' | 'seleccionados'
    >('todos');
    const [estudiantesSeleccionados, setEstudiantesSeleccionados] = useState<
        number[]
    >([]);
    const [busquedaEstudiantes, setBusquedaEstudiantes] = useState('');
    const [cargandoEstudiantes, setCargandoEstudiantes] = useState(false);
    const [guardando, setGuardando] = useState(false);

    useEffect(() => {
        const cargar = async () => {
            if (!claveAcceso || !id) return;
            setCargandoEstudiantes(true);
            try {
                const [listaTemarios, grupo] = await Promise.all([
                    listarTemariosGrupo(claveAcceso, id),
                    obtenerGrupoProfesor(claveAcceso, id),
                ]);
                if (!grupo) {
                    throw new Error('No se encontró el grupo');
                }
                setTemarios(listaTemarios);
                setEstudiantes(grupo.estudiantes);
                if (listaTemarios.length > 0) {
                    setTemarioId(String(listaTemarios[0].id));
                }
            } catch (error) {
                if (esErrorDeSesion(error)) return;
                const mensaje = obtenerMensajeError(
                    error,
                    'No se pudieron cargar los datos del grupo',
                );
                await Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: mensaje,
                });
            } finally {
                setCargandoEstudiantes(false);
            }
        };
        void cargar();
    }, [claveAcceso, id]);

    const consultaEstudiantes = busquedaEstudiantes
        .trim()
        .toLocaleLowerCase();
    const estudiantesFiltrados = estudiantes.filter((estudiante) => {
        return (
            !consultaEstudiantes ||
            estudiante.username
                .toLocaleLowerCase()
                .includes(consultaEstudiantes) ||
            estudiante.codigo.toLocaleLowerCase().includes(consultaEstudiantes)
        );
    });

    const guardar = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!claveAcceso || !id) return;
        if (
            asignacion === 'seleccionados' &&
            estudiantesSeleccionados.length === 0
        ) {
            await Swal.fire({
                icon: 'warning',
                title: 'Selecciona estudiantes',
                text: 'Elige al menos un estudiante para asignar el ejercicio.',
            });
            return;
        }

        const casosNormalizados: CasoPruebaGrupo[] = casosPrueba.map(
            (caso) => ({
                entradas: separarLineas(caso.entradas),
                salidas_esperadas: separarLineas(caso.salidasEsperadas),
            }),
        );
        const casoInvalido = casosNormalizados.findIndex(
            (caso) =>
                caso.salidas_esperadas.length === 0 ||
                [...caso.entradas, ...caso.salidas_esperadas].some(
                    (linea) => linea.length > 500,
                ) ||
                caso.entradas.length > 20 ||
                caso.salidas_esperadas.length > 20,
        );
        if (casoInvalido !== -1) {
            await Swal.fire({
                icon: 'warning',
                title: 'Caso de prueba incompleto',
                text: `Revisa las entradas y salidas del caso ${casoInvalido + 1}. Cada caso necesita al menos una salida y admite hasta 20 líneas de 500 caracteres.`,
            });
            return;
        }

        setGuardando(true);
        try {
            await crearEjercicioGrupo(claveAcceso, id, {
                temario_id: Number(temarioId),
                titulo: titulo.trim(),
                enunciado: enunciado.trim(),
                tipo,
                puntos: Number(puntos),
                asignacion,
                estudiantes_ids:
                    asignacion === 'seleccionados'
                        ? estudiantesSeleccionados
                        : [],
                fecha_limite: conLimite && fechaLimite ? fechaLimite : null,
                casos_prueba:
                    casosNormalizados.length > 0
                        ? casosNormalizados
                        : undefined,
            });

            await Swal.fire({
                icon: 'success',
                title: 'Ejercicio publicado',
                text:
                    asignacion === 'todos'
                        ? 'Los integrantes actuales recibieron una notificación. Los futuros integrantes también podrán ver este ejercicio.'
                        : 'Los estudiantes seleccionados recibieron una notificación.',
                timer: 1800,
                showConfirmButton: false,
            });
            navigate(`/grupos/${id}`);
        } catch (error) {
            const mensaje = obtenerMensajeError(
                error,
                'No se pudo crear el ejercicio',
            );
            await Swal.fire({ icon: 'error', title: 'Error', text: mensaje });
        } finally {
            setGuardando(false);
        }
    };

    return (
        <AppShell>
            <div className="mx-auto w-full max-w-3xl px-4 py-8">
                <Link
                    to={`/grupos/${id}`}
                    className="text-sm text-gray-400 hover:text-white"
                >
                    ← Volver al grupo
                </Link>
                <h1 className="mb-6 text-3xl font-bold text-white">
                    Nuevo ejercicio
                </h1>

                <form onSubmit={guardar} className="grid gap-5">
                    <div>
                        <label className="mb-1 block text-sm text-gray-400">
                            Temario (obligatorio)
                        </label>
                        <select
                            value={temarioId}
                            onChange={(e) => setTemarioId(e.target.value)}
                            className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-2 text-white focus:border-[#FF7C02] focus:outline-none"
                            required
                        >
                            <option value="">Elige un temario…</option>
                            {temarios.map((t) => (
                                <option key={t.id} value={t.id}>
                                    {t.nombre}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="mb-1 block text-sm text-gray-400">
                            Título
                        </label>
                        <input
                            value={titulo}
                            onChange={(e) => setTitulo(e.target.value)}
                            placeholder="Ej. Sumar dos números"
                            className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-2 text-white placeholder:text-gray-500 focus:border-[#FF7C02] focus:outline-none"
                            maxLength={120}
                            required
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm text-gray-400">
                            Enunciado
                        </label>
                        <textarea
                            value={enunciado}
                            onChange={(e) => setEnunciado(e.target.value)}
                            placeholder="Describe lo que el estudiante debe resolver…"
                            rows={4}
                            className="w-full resize-y rounded-xl border border-white/10 bg-black/30 px-4 py-2 text-white placeholder:text-gray-500 focus:border-[#FF7C02] focus:outline-none"
                            required
                        />
                    </div>

                    <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <h2 className="font-semibold text-white">
                            Asignar ejercicio a
                        </h2>
                        <p className="mt-1 text-sm text-gray-400">
                            Elige quién podrá ver y resolver este ejercicio.
                        </p>
                        <div className="mt-4 grid gap-3">
                            <label className="flex items-start gap-3 rounded-xl border border-white/10 bg-black/20 p-3 text-white">
                                <input
                                    type="radio"
                                    name="asignacion"
                                    value="todos"
                                    checked={asignacion === 'todos'}
                                    onChange={() => setAsignacion('todos')}
                                    className="mt-1 accent-[#FF7C02]"
                                />
                                <span>
                                    <span className="block font-medium">
                                        Todo el grupo
                                    </span>
                                    <span className="mt-1 block text-sm text-gray-400">
                                        Incluye a los estudiantes que se unan al
                                        grupo más adelante.
                                    </span>
                                </span>
                            </label>
                            <label className="flex items-start gap-3 rounded-xl border border-white/10 bg-black/20 p-3 text-white">
                                <input
                                    type="radio"
                                    name="asignacion"
                                    value="seleccionados"
                                    checked={asignacion === 'seleccionados'}
                                    onChange={() =>
                                        setAsignacion('seleccionados')
                                    }
                                    disabled={
                                        cargandoEstudiantes ||
                                        estudiantes.length === 0
                                    }
                                    className="mt-1 accent-[#FF7C02]"
                                />
                                <span>
                                    <span className="block font-medium">
                                        Estudiantes específicos
                                    </span>
                                    <span className="mt-1 block text-sm text-gray-400">
                                        Busca por nombre o código SIS y
                                        selecciona uno o varios.
                                    </span>
                                </span>
                            </label>
                        </div>

                        {asignacion === 'seleccionados' && (
                            <div className="mt-4">
                                <label
                                    htmlFor="buscar-estudiante-ejercicio"
                                    className="mb-1 block text-sm text-gray-300"
                                >
                                    Buscar estudiante
                                </label>
                                <input
                                    id="buscar-estudiante-ejercicio"
                                    type="search"
                                    value={busquedaEstudiantes}
                                    onChange={(event) =>
                                        setBusquedaEstudiantes(
                                            event.target.value,
                                        )
                                    }
                                    placeholder="Nombre o código SIS"
                                    className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-2 text-white placeholder:text-gray-500 focus:border-[#FF7C02] focus:outline-none"
                                />
                                <p className="mt-2 text-sm text-gray-400">
                                    {estudiantesSeleccionados.length}{' '}
                                    seleccionados
                                </p>
                                <div className="mt-2 max-h-64 overflow-y-auto rounded-xl border border-white/10">
                                    {estudiantesFiltrados.length > 0 ? (
                                        estudiantesFiltrados.map(
                                            (estudiante) => (
                                                <label
                                                    key={estudiante.id}
                                                    className="flex cursor-pointer items-center gap-3 border-b border-white/5 px-3 py-2 text-white last:border-b-0 hover:bg-white/5"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={estudiantesSeleccionados.includes(
                                                            estudiante.id,
                                                        )}
                                                        onChange={(event) =>
                                                            setEstudiantesSeleccionados(
                                                                (actuales) =>
                                                                    event.target
                                                                        .checked
                                                                        ? [
                                                                              ...actuales,
                                                                              estudiante.id,
                                                                          ]
                                                                        : actuales.filter(
                                                                              (
                                                                                  idEstudiante,
                                                                              ) =>
                                                                                  idEstudiante !==
                                                                                  estudiante.id,
                                                                          ),
                                                            )
                                                        }
                                                        className="accent-[#FF7C02]"
                                                    />
                                                    <span>
                                                        <span className="block">
                                                            {estudiante.username}
                                                        </span>
                                                        <span className="text-xs text-gray-400">
                                                            SIS:{' '}
                                                            {estudiante.codigo}
                                                        </span>
                                                    </span>
                                                </label>
                                            ),
                                        )
                                    ) : (
                                        <p className="p-3 text-sm text-gray-400">
                                            {cargandoEstudiantes
                                                ? 'Cargando estudiantes…'
                                                : 'No hay estudiantes que coincidan con la búsqueda.'}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}
                        {!cargandoEstudiantes && estudiantes.length === 0 && (
                            <p className="mt-3 text-sm text-gray-400">
                                El grupo aún no tiene estudiantes inscritos.
                            </p>
                        )}
                    </section>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className="mb-1 block text-sm text-gray-400">
                                Tipo de tablero
                            </label>
                            <select
                                value={tipo}
                                onChange={(e) =>
                                    setTipo(
                                        e.target.value as
                                            | 'diagrama'
                                            | 'pseudocodigo',
                                    )
                                }
                                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-2 text-white focus:border-[#FF7C02] focus:outline-none"
                            >
                                <option value="pseudocodigo">
                                    Pseudocódigo (PSeInt)
                                </option>
                                <option value="diagrama">
                                    Diagrama de flujo
                                </option>
                            </select>
                        </div>

                        <div>
                            <label className="mb-1 block text-sm text-gray-400">
                                Puntos al completarlo (0–100)
                            </label>
                            <input
                                type="number"
                                value={puntos}
                                onChange={(e) => setPuntos(e.target.value)}
                                min={0}
                                max={100}
                                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-2 text-white focus:border-[#FF7C02] focus:outline-none"
                                required
                            />
                        </div>
                    </div>

                    <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <h2 className="font-semibold text-white">
                                    Casos de prueba (opcional)
                                </h2>
                                <p className="mt-1 text-xs text-gray-400">
                                    Cada línea de entrada se entrega a un
                                    <code className="mx-1">Leer</code> y cada
                                    línea esperada corresponde a un
                                    <code className="mx-1">Escribir</code>.
                                    Los estudiantes podrán ver estos casos.
                                </p>
                            </div>
                            <button
                                type="button"
                                disabled={casosPrueba.length >= 20}
                                onClick={() =>
                                    setCasosPrueba((actuales) => [
                                        ...actuales,
                                        { entradas: '', salidasEsperadas: '' },
                                    ])
                                }
                                className="rounded-lg border border-[#FF7C02]/50 px-3 py-2 text-sm text-[#FFB86C] disabled:opacity-50"
                            >
                                + Añadir caso
                            </button>
                        </div>

                        <div className="mt-4 grid gap-4">
                            {casosPrueba.map((caso, indice) => (
                                <div
                                    key={indice}
                                    className="rounded-xl border border-white/10 bg-black/20 p-4"
                                >
                                    <div className="mb-3 flex items-center justify-between">
                                        <h3 className="font-medium text-white">
                                            Caso {indice + 1}
                                        </h3>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setCasosPrueba((actuales) =>
                                                    actuales.filter(
                                                        (_, i) => i !== indice,
                                                    ),
                                                )
                                            }
                                            className="text-sm text-red-300 hover:text-red-200"
                                        >
                                            Quitar
                                        </button>
                                    </div>
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        <label className="grid gap-1 text-sm text-gray-300">
                                            Entradas (una por línea)
                                            <textarea
                                                value={caso.entradas}
                                                onChange={(event) =>
                                                    setCasosPrueba((actuales) =>
                                                        actuales.map((item, i) =>
                                                            i === indice
                                                                ? {
                                                                      ...item,
                                                                      entradas:
                                                                          event
                                                                              .target
                                                                              .value,
                                                                  }
                                                                : item,
                                                        ),
                                                    )
                                                }
                                                rows={4}
                                                maxLength={10000}
                                                placeholder={'5\n3'}
                                                className="w-full resize-y rounded-xl border border-white/10 bg-black/30 px-3 py-2 font-mono text-white placeholder:text-gray-500 focus:border-[#FF7C02] focus:outline-none"
                                            />
                                        </label>
                                        <label className="grid gap-1 text-sm text-gray-300">
                                            Salidas esperadas (una por línea)
                                            <textarea
                                                value={caso.salidasEsperadas}
                                                onChange={(event) =>
                                                    setCasosPrueba((actuales) =>
                                                        actuales.map((item, i) =>
                                                            i === indice
                                                                ? {
                                                                      ...item,
                                                                      salidasEsperadas:
                                                                          event
                                                                              .target
                                                                              .value,
                                                                  }
                                                                : item,
                                                        ),
                                                    )
                                                }
                                                rows={4}
                                                maxLength={10000}
                                                placeholder="8"
                                                className="w-full resize-y rounded-xl border border-white/10 bg-black/30 px-3 py-2 font-mono text-white placeholder:text-gray-500 focus:border-[#FF7C02] focus:outline-none"
                                            />
                                        </label>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {casosPrueba.length === 0 && (
                            <p className="mt-3 text-xs text-gray-500">
                                Si no agregas casos, el ejercicio conserva su
                                funcionamiento actual.
                            </p>
                        )}
                    </section>

                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <label className="flex items-center gap-3 text-sm text-white">
                            <input
                                type="checkbox"
                                checked={conLimite}
                                onChange={(e) => setConLimite(e.target.checked)}
                            />
                            Fecha límite (hasta qué día se puede resolver)
                        </label>
                        {conLimite && (
                            <input
                                type="date"
                                value={fechaLimite}
                                onChange={(e) => setFechaLimite(e.target.value)}
                                className="mt-3 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-2 text-white focus:border-[#FF7C02] focus:outline-none"
                                required
                            />
                        )}
                        <p className="mt-2 text-xs text-gray-500">
                            Vencida la fecha el estudiante puede ver el
                            ejercicio pero no guardar ni entregar.
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={
                            guardando ||
                            cargandoEstudiantes ||
                            (asignacion === 'seleccionados' &&
                                estudiantesSeleccionados.length === 0) ||
                            !temarioId ||
                            titulo.trim().length < 3 ||
                            enunciado.trim().length < 3
                        }
                        className="rounded-xl bg-[#FF7C02] px-5 py-3 font-semibold text-black disabled:opacity-50"
                    >
                        {guardando ? 'Publicando...' : 'Publicar ejercicio'}
                    </button>
                </form>
            </div>
        </AppShell>
    );
};

export default CrearEjercicioPage;
