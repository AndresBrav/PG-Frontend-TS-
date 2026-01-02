import useAuthRedirect from "../../../hooks/useAuthRedirect";
import profileIcon from "../../../assets/filesSvg/filesdashboardSvg/profile.svg";
import { useContext, useEffect, useState } from "react";
import ModalInf1 from "./ModalInf1"; // 👈 Importamos el modal fijo
import { useNavigate } from "react-router-dom";
import useCerrarSesion from "../../../hooks/useCerrarSesion";
import { TokenContext } from "../../../Context/TokenContext";
import {
    actualizarFotoPerfil,
    traerPuntuacion,
    traerUsuarios,
} from "../../../api/usuarioApi";
import avatars from "../../users/avatars";

const Dashboard = () => {
    // useAuthRedirect(); //redirecciona si no hay token
    const a = useCerrarSesion(); // Hook para cerrar sesión
    const { claveAcceso } = useContext(TokenContext); //usamos el contexto para obtener la clave de acceso
    const [nombre, setNombre] = useState<string>("");
    const [edad, setEdad] = useState<number>(0);
    const [idAvatar, setIdAvatar] = useState<string>("");
    const [puntuacion, setPuntuacion] = useState<number>(0);

    const [openAvatarModal, setOpenAvatarModal] = useState(false);
    const [selectedAvatar, setSelectedAvatar] = useState<number | null>(null);

    useEffect(() => {
        //obtener la informacion del usuario
        const obtenerDatosUsuario = async () => {
            if (claveAcceso) {
                console.log("la clave de acceso es " + claveAcceso);
                const data = await traerUsuarios(claveAcceso);
                setNombre(data?.nombre ?? "");
                setEdad(data?.edad ?? 0);
                setIdAvatar(data?.idAvatar ?? "");
            }
        };
        obtenerDatosUsuario();

        // obtener los puntos del usuario

        const traerPuntosUsuario = async () => {
            if (claveAcceso) {
                const data = await traerPuntuacion(claveAcceso);
                console.log(data);
                setPuntuacion(data?.puntuacionTotal ?? 0);
            }
        };

        traerPuntosUsuario();
    }, [claveAcceso]);

    const [modalAbierto, setModalAbierto] = useState(false);
    const alternarModal = () => setModalAbierto(!modalAbierto);
    const [open, setOpen] = useState(false);

    const navigate = useNavigate(); // Hook que te da la función navigate

    const irEjercicio1 = () => {
        navigate("/ejercicio1");
    };

    const irEjercicio2 = () => {
        navigate("/ejercicio2");
    };

    const irEjercicio3 = () => {
        navigate("/ejercicio3");
    };

    const irEjercicio4 = () => {
        navigate("/ejercicio4");
    };

    const irEjercicio5 = () => {
        navigate("/ejercicio5");
    };

    return (
        <>
            <div className="header-dashboard-container">
                <div className="item-header-dashboard">
                    <svg
                        className="dashboard-icon-fire"
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
                <div className="item-header-dashboard">{puntuacion} pts</div>
                <div className="item-header-dashboard-profile">
                    {/* <img src={profileIcon} alt="Profile Icon" /> */}
                    <div className="item-header-dashboard-profile">
                        <img
                            src={idAvatar ? idAvatar : profileIcon}
                            alt="Profile Icon"
                            onClick={() => setOpen(true)}
                            style={{
                                cursor: "pointer",
                                width: "70px", // tamaño que tú quieras
                                height: "70px", // mismo que width para que sea círculo
                                borderRadius: "10%",
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
                                    style={{ cursor: "pointer" }}
                                >
                                    <title>cancel</title>
                                    <path d="M10.771 8.518c-1.144 0.215-2.83 2.171-2.086 2.915l4.573 4.571-4.573 4.571c-0.915 0.915 1.829 3.656 2.744 2.742l4.573-4.571 4.573 4.571c0.915 0.915 3.658-1.829 2.744-2.742l-4.573-4.571 4.573-4.571c0.915-0.915-1.829-3.656-2.744-2.742l-4.573 4.571-4.573-4.571c-0.173-0.171-0.394-0.223-0.657-0.173v0zM16 1c-8.285 0-15 6.716-15 15s6.715 15 15 15 15-6.716 15-15-6.715-15-15-15zM16 4.75c6.213 0 11.25 5.037 11.25 11.25s-5.037 11.25-11.25 11.25-11.25-5.037-11.25-11.25c0.001-6.213 5.037-11.25 11.25-11.25z"></path>
                                </svg>

                                <br />
                                <br />
                                <br />
                                <br />
                                {/* <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "center",
                                    }}
                                >
                                    <img
                                        style={{
                                            height: "150px",
                                            width: "150px",
                                        }}
                                        src={idAvatar ? idAvatar : profileIcon}
                                        alt="imagen de avatar usuario"
                                    />
                                </div> */}
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "center",
                                        position: "relative", // Importante para posicionar el botón encima
                                        margin: "20px 0",
                                    }}
                                    onMouseEnter={(e) =>
                                        (e.currentTarget.style.cursor =
                                            "pointer")
                                    } // opcional: cursor pointer
                                >
                                    {/* Contenedor de la imagen con overlay */}
                                    <div
                                        style={{
                                            position: "relative",
                                            display: "inline-block",
                                        }}
                                    >
                                        <img
                                            style={{
                                                height: "150px",
                                                width: "150px",
                                                borderRadius: "50%", // círculo perfecto
                                                objectFit: "cover",
                                                border: "4px solid #fff",
                                                boxShadow:
                                                    "0 4px 10px rgba(0,0,0,0.2)",
                                            }}
                                            src={idAvatar || profileIcon}
                                            alt="Foto de perfil"
                                        />

                                        {/* Overlay oscuro + botón que aparece al hover */}
                                        <div
                                            style={{
                                                position: "absolute",
                                                top: 0,
                                                left: 0,
                                                width: "100%",
                                                height: "100%",
                                                borderRadius: "50%",
                                                backgroundColor:
                                                    "rgba(0, 0, 0, 0.5)", // fondo oscuro semi-transparente
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                opacity: 0, // oculto por defecto
                                                transition: "opacity 0.3s ease", // animación suave
                                            }}
                                            className="overlay-boton-avatar"
                                            onMouseEnter={(e) =>
                                                (e.currentTarget.style.opacity =
                                                    "1")
                                            }
                                            onMouseLeave={(e) =>
                                                (e.currentTarget.style.opacity =
                                                    "0")
                                            }
                                            onClick={() => {
                                                // Aquí pones la lógica para cambiar la foto (abrir input file, etc.)
                                                console.log(
                                                    "Abrir selector de foto"
                                                );
                                                setOpenAvatarModal(true);
                                                // Ejemplo: document.getElementById('input-foto')?.click();
                                            }}
                                        >
                                            <span
                                                style={{
                                                    color: "white",
                                                    fontWeight: "bold",
                                                    fontSize: "14px",
                                                    textAlign: "center",
                                                    padding: "10px",
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
                                <h2 style={{ textAlign: "center" }}>
                                    Selecciona un avatar
                                </h2>

                                <div
                                    style={{
                                        display: "grid",
                                        gridTemplateColumns: "repeat(3, 1fr)",
                                        gap: "15px",
                                        marginTop: "20px",
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
                                                width: "80px",
                                                height: "80px",
                                                borderRadius: "50%",
                                                cursor: "pointer",
                                                border:
                                                    selectedAvatar === avatar.id
                                                        ? "4px solid #FF7C02"
                                                        : "2px solid transparent",
                                                boxShadow:
                                                    selectedAvatar === avatar.id
                                                        ? "0 0 10px rgba(255,124,2,0.8)"
                                                        : "none",
                                            }}
                                        />
                                    ))}
                                </div>

                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        marginTop: "30px",
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

                                    {/* <button
                                        className="aceptar-seccion"
                                        disabled={!selectedAvatar}
                                        onClick={() => {
                                            const avatarElegido = avatars.find(
                                                (a) => a.id === selectedAvatar
                                            );

                                            if (avatarElegido) {
                                                // Actualiza la imagen principal
                                                // setIdAvatar(avatarElegido.url);
                                            }

                                            setOpenAvatarModal(false);
                                            setSelectedAvatar(null);
                                        }}
                                    >
                                        Guardar imagen
                                    </button> */}
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
                                                    "Error al actualizar avatar",
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
            </div>

            <div className="information-design-level-style-container-grid">
                <div className="item-information-design-level-style-1">
                    <h1 className="design-font-information-1">
                        Etapa 1, Seccion 1
                    </h1>
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
                        style={{ cursor: "pointer" }}
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

            {/* Modal fijo */}
            <ModalInf1 isOpen={modalAbierto} onClose={alternarModal} />

            <div className="contenedo-diagrama-flujo-primer-ejercicio">
                <div className="circle-outer-1" onClick={irEjercicio1}>
                    <div className="circle-inner">1</div>
                </div>
            </div>
            <div className="contenedo-diagrama-flujo-primer-ejercicio">
                <div className="circle-outer-2" onClick={irEjercicio2}>
                    <div className="circle-inner">2</div>
                </div>
            </div>
            <div className="contenedo-diagrama-flujo-primer-ejercicio">
                <div className="circle-outer-1" onClick={irEjercicio3}>
                    <div className="circle-inner">3</div>
                </div>
            </div>
            <div className="contenedo-diagrama-flujo-primer-ejercicio">
                <div className="circle-outer-2" onClick={irEjercicio4}>
                    <div className="circle-inner">4</div>
                </div>
            </div>
            <div className="contenedo-diagrama-flujo-primer-ejercicio">
                <div className="circle-outer-1" onClick={irEjercicio5}>
                    <div className="circle-inner">5</div>
                </div>
            </div>
        </>
    );
};

export default Dashboard;
