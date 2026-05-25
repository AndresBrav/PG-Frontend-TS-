import useAuthRedirect from '../../../hooks/useAuthRedirect';
import profileIcon from '../../../assets/filesSvg/filesdashboardSvg/profile.svg';
import { useContext, useEffect, useState } from 'react';
import ModalInf1 from '../Presentation/ModalInf1'; // 👈 Importamos el modal fijo
import { useNavigate } from 'react-router-dom';
import useCerrarSesion from '../../../hooks/useCerrarSesion';
import { TokenContext } from '../../../Context/TokenContext';
import Swal from 'sweetalert2';
import {
    actualizarFotoPerfil,
    traerPuntuacion,
    traerUsuarios,
} from '../../../api/usuarioApi';
import avatars from '../../users/avatars';
import {
    enviarIdNotificacion,
    traerNotificaciones,
} from '../../../api/notificacionApi';
import { consultarEjercicio } from '../../../api/ejerciciosIA/consultaEjercicio';
import {
    traerNotificaciones as traerJuegosIA,
    guardarJuegoIA,
} from '../../../api/ejerciciosIA/ejercicioIAapi';

interface Notificacion {
    id: number;
    descripcion: string;
    fecha: string;
}

interface JuegoIA {
    id: number;
    descripcion: string;
    tipo_juego: string;
    usuario_id: number;
    completado: number;
    puntos: number;
    createdAt: string;
    updatedAt: string;
}

const DashboardIA = () => {
    useAuthRedirect(); //redirecciona si no hay token

    const a = useCerrarSesion(); // Hook para cerrar sesión
    const { claveAcceso } = useContext(TokenContext); //usamos el contexto para obtener la clave de acceso
    const [nombre, setNombre] = useState<string>('');
    const [edad, setEdad] = useState<number>(0);
    const [idAvatar, setIdAvatar] = useState<string>('');
    const [puntuacion, setPuntuacion] = useState<number>(0);
    const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
    const [juegosIA, setJuegosIA] = useState<JuegoIA[]>([]);

    const [openAvatarModal, setOpenAvatarModal] = useState(false);
    const [selectedAvatar, setSelectedAvatar] = useState<number | null>(null);

    const [openNotifications, setOpenNotifications] = useState(false);

    useEffect(() => {
        // console.log("la calve de accesssooooo es " + claveAcceso);

        if (!claveAcceso) {
            console.log('no tienes una clave valida');
            // redirectToHome();
        } else {
            //traer datos del usuario
            const obtenerDatosUsuario = async () => {
                console.log('la clave de acceso es ' + claveAcceso);
                const data = await traerUsuarios(claveAcceso);
                setNombre(data?.nombre ?? '');
                setEdad(data?.edad ?? 0);
                setIdAvatar(data?.idAvatar ?? '');
            };
            // traer puntuacion del usuario
            const traerPuntosUsuario = async () => {
                const data = await traerPuntuacion(claveAcceso);
                setPuntuacion(data?.puntuacionTotal ?? 0);
            };

            const cargarNotificaciones = async () => {
                const data = await traerNotificaciones(claveAcceso);
                console.log(data?.arreglonoti);
                if (data) {
                    setNotificaciones(data?.arreglonoti);
                }
            };

            const cargarJuegosIA = async () => {
                const data = await traerJuegosIA(claveAcceso);
                console.log('Juegos IA cargados:', data?.juegosIA);
                if (data && data.juegosIA) {
                    setJuegosIA(data.juegosIA);
                }
            };

            obtenerDatosUsuario();
            traerPuntosUsuario();
            cargarNotificaciones();
            cargarJuegosIA();
        }
    }, [claveAcceso]);

    const [modalAbierto, setModalAbierto] = useState(false);
    const alternarModal = () => setModalAbierto(!modalAbierto);
    const [open, setOpen] = useState(false);

    // ahora haremos lo mismo para el segundo modal
    // const [modalAbierto2, setModalAbierto2] = useState(false);
    // const alternarModal2 = () => setModalAbierto2(!modalAbierto2);

    const navigate = useNavigate(); // Hook que te da la función navigate

    // Función para generar ejercicio con modal
    const handleGenerarEjercicio = async () => {
        // Mostrar loading
        Swal.fire({
            title: 'Generando ejercicio...',
            html: 'Por favor espera mientras se genera tu ejercicio con IA',
            icon: 'info',
            iconColor: '#FF7C02',
            allowOutsideClick: false,
            allowEscapeKey: false,
            didOpen: () => {
                Swal.showLoading();
            },
        });

        try {
            // Consultar el ejercicio a la IA
            const ejercicioGenerado = await consultarEjercicio();

            // Mostrar el ejercicio generado
            const result = await Swal.fire({
                title: 'Ejercicio Generado por IA',
                html: `
                    <div style="text-align: left; padding: 20px; background: rgba(217, 217, 217, 0.3); border-radius: 10px; margin: 15px 0;">
                        <h2 style="color: #333; margin-bottom: 15px; font-size: 18px;">Problema:</h2>
                        <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
                            ${ejercicioGenerado}
                        </p>
                    </div>
                `,
                icon: 'info',
                iconColor: '#FF7C02',
                confirmButtonText: 'Guardar',
                showCancelButton: true,
                cancelButtonText: 'Cancelar',
                customClass: {
                    title: 'titulo-celular',
                    confirmButton: 'btn-semitransparente',
                    cancelButton: 'btn-cancelar',
                    icon: 'icono-celular',
                },
                width: '80%',
            });

            if (result.isConfirmed) {
                try {
                    // Guardar el juego en la base de datos
                    if (claveAcceso) {
                        const datosJuego = {
                            descripcion: ejercicioGenerado,
                            tipo_juego: 'ia',
                            completado: false,
                            puntos: 0,
                        };
                        await guardarJuegoIA(claveAcceso, datosJuego);

                        // Recargar los juegos IA después de guardar
                        const dataJuegos = await traerJuegosIA(claveAcceso);
                        if (dataJuegos && dataJuegos.juegosIA) {
                            setJuegosIA(dataJuegos.juegosIA);
                        }
                    }

                    // Mostrar mensaje de confirmación
                    await Swal.fire({
                        title: 'Ejercicio Guardado',
                        text: '¡Ejercicio guardado exitosamente!',
                        icon: 'success',
                        iconColor: 'green',
                        confirmButtonText: 'Continuar',
                        customClass: {
                            title: 'titulo-celular',
                            confirmButton: 'btn-semitransparente',
                            icon: 'icono-celular',
                        },
                        width: '80%',
                    });
                } catch (error) {
                    console.error('Error al guardar el juego:', error);
                    await Swal.fire({
                        title: 'Error',
                        text: 'No se pudo guardar el ejercicio',
                        icon: 'error',
                        confirmButtonText: 'Cerrar',
                        customClass: {
                            title: 'titulo-celular',
                            confirmButton: 'btn-semitransparente',
                            icon: 'icono-celular',
                        },
                        width: '80%',
                    });
                }
            }
        } catch (error) {
            console.error('Error al generar ejercicio:', error);
            Swal.fire({
                title: 'Error',
                text: 'No se pudo generar el ejercicio. Intenta de nuevo.',
                icon: 'error',
                confirmButtonText: 'Cerrar',
                customClass: {
                    title: 'titulo-celular',
                    confirmButton: 'btn-semitransparente',
                    icon: 'icono-celular',
                },
                width: '80%',
            });
        }
    };

    return (
        <>
            {/* <div className="header-dashboard-container"> */}
            <div className="flex justify-end items-center flex-row flex-nowrap">
                <div className="mt-[10px] text-white mr-[20px] rounded-[5px] ml-0 text-[20px]">
                    <svg
                        className="w-[30px] h-[30px] sm:w-[50px] sm:h-[50px]"
                        viewBox="415 411 26 32"
                        fill="#FF7C02"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M428.5,441 C422.148,441 417,435.641 417,429.625 C417,428.228 417.031,427.094 418,426 C417.895,426.634 419.397,432.055 424.305,431.771 C424.092,427.652 422.978,417.561 428.152,414.073 C427.695,419.557 429.038,426.924 435.029,428 C434.686,425.801 434.727,422.143 436.267,421.467 C436.433,424.836 438.924,426.914 438.924,430.152 C438.924,436.016 433.251,441 428.5,441 L428.5,441 Z M437.905,417.953 C433.52,419.203 432.717,422.748 433,425 C429.872,421.322 430,417.093 430,411 C419.968,414.783 422.301,425.688 422,429 C419.477,426.935 419,422 419,422 C416.336,423.371 415,427.031 415,430 C415,437.18 420.82,443 428,443 C435.18,443 441,437.18 441,430 C441,425.733 437.867,423.765 437.905,417.953 L437.905,417.953 Z"
                            fill="#FF7C02"
                        />
                    </svg>
                </div>
                <div className="mt-[10px] text-white mr-[20px] rounded-[5px] ml-0 text-[20px]">
                    {puntuacion} pts
                </div>

                <div className="relative mt-[10px] mr-[20px]">
                    <svg
                        onClick={() => setOpenNotifications(!openNotifications)}
                        className="w-[30px] h-[30px] sm:w-[50px] sm:h-[50px] cursor-pointer"
                        fill="#ffffff"
                        viewBox="0 0 512 512"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path d="M256,48C141.31,48,48,141.31,48,256s93.31,208,208,208,208-93.31,208-208S370.69,48,256,48Zm0,336c-20.9,0-37.52-8.86-39.75-27.58a4,4,0,0,1,4-4.42h71.45a4,4,0,0,1,4,4.48C293.15,374.85,276.68,384,256,384Zm98-48H158c-11.84,0-18-15-11.19-23,16.33-19.34,27.87-27.47,27.87-80.8,0-48.87,25.74-66.21,47-74.67a11.35,11.35,0,0,0,6.33-6.68C231.7,138.6,242.14,128,256,128s24.28,10.6,28,22.86a11.39,11.39,0,0,0,6.34,6.68c21.21,8.44,47,25.81,47,74.67,0,53.33,11.53,61.46,27.86,80.8C371.94,321,365.77,336,354,336Z" />
                    </svg>

                    {openNotifications && (
                        <div className="fixed top-[70px] left-0 w-full px-4 sm:absolute sm:right-0 sm:left-auto sm:w-[350px] z-50">
                            <div className="bg-white text-black rounded-lg shadow-lg p-3 max-h-[300px] overflow-y-auto">
                                <p className="font-bold mb-2">Notificaciones</p>

                                <ul className="flex flex-col gap-y-3">
                                    {notificaciones.map((noti) => (
                                        <li
                                            key={noti.id}
                                            onClick={() => {
                                                if (!claveAcceso) return;

                                                enviarIdNotificacion(
                                                    noti.id,
                                                    claveAcceso
                                                );

                                                setNotificaciones((prev) =>
                                                    prev.filter(
                                                        (n) => n.id !== noti.id
                                                    )
                                                );
                                            }}
                                            className="bg-gray-50 hover:bg-orange-50 border border-gray-200 hover:border-orange-300 rounded-xl p-3 cursor-pointer transition-all duration-200 shadow-sm"
                                        >
                                            <div className="flex flex-col">
                                                <span className="text-[15px] text-gray-800 font-medium">
                                                    {noti.descripcion}
                                                </span>

                                                <span className="text-[12px] text-gray-500 mt-1">
                                                    {new Date(
                                                        noti.fecha
                                                    ).toLocaleString('es-ES', {
                                                        day: '2-digit',
                                                        month: 'short',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </span>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}
                </div>

                {/* <img src={profileIcon} alt="Profile Icon" /> */}
                <div className="item-header-dashboard-profile">
                    <img
                        src={idAvatar ? idAvatar : profileIcon}
                        alt="Profile Icon"
                        onClick={() => setOpen(true)}
                        style={{
                            cursor: 'pointer',
                            width: '70px', // tamaño que tú quieras
                            height: '70px', // mismo que width para que sea círculo
                            borderRadius: '10%',
                        }}
                    />
                </div>

                {open && (
                    <div className="modal">
                        <div className="modal-box">
                            <svg
                                className="modal-close"
                                fill="#E11919"
                                onClick={() => {
                                    setOpen(false);
                                }}
                                width="35px"
                                height="35px"
                                viewBox="0 0 32 32"
                                xmlns="http://www.w3.org/2000/svg"
                                style={{ cursor: 'pointer' }}
                            >
                                <title>cancel</title>
                                <path d="M10.771 8.518c-1.144 0.215-2.83 2.171-2.086 2.915l4.573 4.571-4.573 4.571c-0.915 0.915 1.829 3.656 2.744 2.742l4.573-4.571 4.573 4.571c0.915 0.915 3.658-1.829 2.744-2.742l-4.573-4.571 4.573-4.571c0.915-0.915-1.829-3.656-2.744-2.742l-4.573 4.571-4.573-4.571c-0.173-0.171-0.394-0.223-0.657-0.173v0zM16 1c-8.285 0-15 6.716-15 15s6.715 15 15 15 15-6.716 15-15-6.715-15-15-15zM16 4.75c6.213 0 11.25 5.037 11.25 11.25s-5.037 11.25-11.25 11.25-11.25-5.037-11.25-11.25c0.001-6.213 5.037-11.25 11.25-11.25z"></path>
                            </svg>

                            <br />
                            <br />
                            <br />
                            <br />

                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    position: 'relative', // Importante para posicionar el botón encima
                                    margin: '20px 0',
                                }}
                                onMouseEnter={(e) =>
                                    (e.currentTarget.style.cursor = 'pointer')
                                } // opcional: cursor pointer
                            >
                                {/* Contenedor de la imagen con overlay */}
                                <div
                                    style={{
                                        position: 'relative',
                                        display: 'inline-block',
                                    }}
                                >
                                    <img
                                        style={{
                                            height: '150px',
                                            width: '150px',
                                            borderRadius: '50%', // círculo perfecto
                                            objectFit: 'cover',
                                            border: '4px solid #fff',
                                            boxShadow:
                                                '0 4px 10px rgba(0,0,0,0.2)',
                                        }}
                                        src={idAvatar || profileIcon}
                                        alt="Foto de perfil"
                                    />

                                    {/* Overlay oscuro + botón que aparece al hover */}
                                    <div
                                        style={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            width: '100%',
                                            height: '100%',
                                            borderRadius: '50%',
                                            backgroundColor:
                                                'rgba(0, 0, 0, 0.5)', // fondo oscuro semi-transparente
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            opacity: 0, // oculto por defecto
                                            transition: 'opacity 0.3s ease', // animación suave
                                        }}
                                        className="overlay-boton-avatar"
                                        onMouseEnter={(e) =>
                                            (e.currentTarget.style.opacity =
                                                '1')
                                        }
                                        onMouseLeave={(e) =>
                                            (e.currentTarget.style.opacity =
                                                '0')
                                        }
                                        onClick={() => {
                                            // Aquí pones la lógica para cambiar la foto (abrir input file, etc.)
                                            console.log(
                                                'Abrir selector de foto'
                                            );
                                            setOpenAvatarModal(true);
                                            // Ejemplo: document.getElementById('input-foto')?.click();
                                        }}
                                    >
                                        <span
                                            style={{
                                                color: 'white',
                                                fontWeight: 'bold',
                                                fontSize: '14px',
                                                textAlign: 'center',
                                                padding: '10px',
                                            }}
                                        >
                                            Cambiar foto de perfil
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <p>
                                <strong>Nombre:</strong> {nombre}
                            </p>

                            <p>
                                <strong>Edad:</strong> {edad}
                            </p>
                            <br />
                            <button
                                className="cerrar-sesion-usuario"
                                onClick={a}
                            >
                                Cerrar Sesion
                            </button>
                        </div>
                    </div>
                )}

                {openAvatarModal && (
                    <div className="modal">
                        <div className="modal-box">
                            <h2 style={{ textAlign: 'center' }}>
                                Selecciona un avatar
                            </h2>

                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(3, 1fr)',
                                    gap: '15px',
                                    marginTop: '20px',
                                }}
                            >
                                {avatars.map((avatar) => (
                                    <img
                                        key={avatar.id}
                                        src={avatar.url}
                                        alt={`avatar-${avatar.id}`}
                                        onClick={() =>
                                            setSelectedAvatar(avatar.id)
                                        }
                                        style={{
                                            width: '80px',
                                            height: '80px',
                                            borderRadius: '50%',
                                            cursor: 'pointer',
                                            border:
                                                selectedAvatar === avatar.id
                                                    ? '4px solid #FF7C02'
                                                    : '2px solid transparent',
                                            boxShadow:
                                                selectedAvatar === avatar.id
                                                    ? '0 0 10px rgba(255,124,2,0.8)'
                                                    : 'none',
                                        }}
                                    />
                                ))}
                            </div>

                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    marginTop: '30px',
                                }}
                            >
                                <button
                                    className="cerrar-sesion-usuario"
                                    onClick={() => {
                                        setOpenAvatarModal(false);
                                        setSelectedAvatar(null);
                                    }}
                                >
                                    Cancelar
                                </button>

                                <button
                                    className="aceptar-seccion-avatar"
                                    onClick={async () => {
                                        if (!selectedAvatar) return;

                                        const avatarElegido = avatars.find(
                                            (a) => a.id === selectedAvatar
                                        );

                                        if (!avatarElegido || !claveAcceso)
                                            return;

                                        try {
                                            // esperar a que se guarde en backend
                                            await actualizarFotoPerfil(
                                                claveAcceso,
                                                String(avatarElegido.id)
                                            );

                                            // actualizar UI SOLO si backend respondió bien
                                            setIdAvatar(avatarElegido.url);

                                            setOpenAvatarModal(false);
                                            setSelectedAvatar(null);
                                        } catch (error) {
                                            console.error(
                                                'Error al actualizar avatar',
                                                error
                                            );
                                        }
                                    }}
                                >
                                    Guardar imagen
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="information-design-level-style-container-grid">
                <div className="item-information-design-level-style-1">
                    <h1 className="design-font-information-1">Etapa 1</h1>
                    <h1 className="design-font-information-2">
                        Diagramas de flujo
                    </h1>
                </div>
                <div className="item-information-design-level-style-2">
                    <svg
                        className="item-information-design"
                        onClick={alternarModal}
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        style={{ cursor: 'pointer' }}
                    >
                        <path
                            d="M21 16C21 18.8284 21 20.2426 20.1213 21.1213C19.2426 22 17.8284 22 15 22H9C6.17157 22 4.75736 22 3.87868 21.1213C3 20.2426 3 18.8284 3 16V8C3 5.17157 3 3.75736 3.87868 2.87868C4.75736 2 6.17157 2 9 2H15C17.8284 2 19.2426 2 20.1213 2.87868C21 3.75736 21 5.17157 21 8V12"
                            stroke="#000000"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                        />
                        <path
                            d="M8 2V6M8 22V10"
                            stroke="#000000"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                        />
                        <path
                            d="M2 12H4"
                            stroke="#000000"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                        />
                        <path
                            d="M2 16H4"
                            stroke="#000000"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                        />
                        <path
                            d="M2 8H4"
                            stroke="#000000"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                        />
                        <path
                            d="M11.5 6.5H16.5"
                            stroke="#000000"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                        />
                        <path
                            d="M11.5 10H16.5"
                            stroke="#000000"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                        />
                    </svg>
                </div>
            </div>

            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '20px',
                    margin: '20px 0',
                }}
            >
                <button
                    onClick={handleGenerarEjercicio}
                    style={{
                        backgroundColor: '#22C55E',
                        color: 'white',
                        border: 'none',
                        padding: '12px 30px',
                        borderRadius: '8px',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#16A34A';
                        e.currentTarget.style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#22C55E';
                        e.currentTarget.style.transform = 'scale(1)';
                    }}
                >
                    Generar Ejercicio
                </button>
            </div>

            {/* Modal fijo */}
            <ModalInf1 isOpen={modalAbierto} onClose={alternarModal} />

            {/* Mostrar juegos IA dinámicamente */}
            {juegosIA.map((juego, index) => (
                <div
                    key={juego.id}
                    className="contenedo-diagrama-flujo-primer-ejercicio"
                >
                    <div
                        className={
                            index % 2 === 0
                                ? 'circle-outer-1'
                                : 'circle-outer-2'
                        }
                        onClick={() =>
                            navigate('/designboard', {
                                state: {
                                    juegoId: juego.id,
                                    juegoDescripcion: juego.descripcion,
                                },
                            })
                        }
                    >
                        <div className="circle-inner">{index + 1}</div>
                    </div>
                </div>
            ))}
            <br />
        </>
    );
};

export default DashboardIA;
