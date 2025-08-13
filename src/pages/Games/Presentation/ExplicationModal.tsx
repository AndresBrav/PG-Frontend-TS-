import React from "react";

interface ModalPropsInf {
    isOpenSecondModal: boolean;
    onCloseSecondModal: () => void;
    title: string;
    images?: string;
    descripcion?: string;
}

const ExplicationModal: React.FC<ModalPropsInf> = ({
    isOpenSecondModal,
    onCloseSecondModal,
    title,
    images,
    descripcion,
}) => {
    if (!isOpenSecondModal) return null; // No renderizar si no está abierto

    return (
        <div
            style={{
                position: "fixed",
                top: "10vh",
                left: "10vw",
                right: "10vw",
                bottom: "10vh",
                background: "rgba(24, 24, 24, 1)",
                borderRadius: 15,
                border: "2px solid white",
                zIndex: 10000,
            }}
        >
            <div
                style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "center",
                    padding: "10px 15px",
                }}
            >
                <svg
                    fill="#E11919"
                    onClick={onCloseSecondModal}
                    width="30px"
                    height="30px"
                    viewBox="0 0 32 32"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{
                        cursor: "pointer",
                    }}
                >
                    <title>cancel</title>
                    <path d="M10.771 8.518c-1.144 0.215-2.83 2.171-2.086 2.915l4.573 4.571-4.573 4.571c-0.915 0.915 1.829 3.656 2.744 2.742l4.573-4.571 4.573 4.571c0.915 0.915 3.658-1.829 2.744-2.742l-4.573-4.571 4.573-4.571c0.915-0.915-1.829-3.656-2.744-2.742l-4.573 4.571-4.573-4.571c-0.173-0.171-0.394-0.223-0.657-0.173v0zM16 1c-8.285 0-15 6.716-15 15s6.715 15 15 15 15-6.716 15-15-6.715-15-15-15zM16 4.75c6.213 0 11.25 5.037 11.25 11.25s-5.037 11.25-11.25 11.25-11.25-5.037-11.25-11.25c0.001-6.213 5.037-11.25 11.25-11.25z"></path>
                </svg>
            </div>
            <br />
            <div style={{ display: "flex", justifyContent: "center" }}>
                <h1 style={{ color: "white" }}>{title}</h1>
            </div>
            <div style={{ display: "flex", justifyContent: "center" }}>
                <img
                    style={{ height: "150px", width: "150px" }}
                    src={images}
                    alt="Símbolo de inicio/fin del diagrama de flujo"
                />
            </div>
            <div style={{ display: "flex", justifyContent: "center" }}>
                <h1 style={{font:"1.5rem",color:"white"}}>{descripcion}</h1>
            </div>
        </div>
    );
};

export default ExplicationModal;
