import React, { useState } from "react";

const Dashboard: React.FC = () => {
    const [modalOpen, setModalOpen] = useState(false);
    const [activeSubModal, setActiveSubModal] = useState<number | null>(null);

    const toggleModal = () => {
        setModalOpen(!modalOpen);
        if (modalOpen) setActiveSubModal(null);
    };

    const toggleSubModal = (id: number) => {
        setActiveSubModal(activeSubModal === id ? null : id);
    };

    return (
        <>
            <button onClick={toggleModal} style={{ padding: 10, margin: 20 }}>
                Abrir Modal Principal
            </button>

            {modalOpen && (
                <div
                    onClick={toggleModal}
                    style={{
                        position: "fixed",
                        inset: 0,
                        backgroundColor: "rgba(0,0,0,0.4)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        zIndex: 9999,
                    }}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            backgroundColor: "white",
                            padding: 30,
                            borderRadius: 10,
                            width: 500,
                            height: 300,
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                            position: "relative",
                            textAlign: "center",
                        }}
                    >
                        <h2>Modal Principal</h2>
                        <p>Este modal tiene 3 botones para abrir submodales.</p>

                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-around",
                            }}
                        >
                            {[1, 2, 3].map((id) => (
                                <button
                                    key={id}
                                    onClick={() => toggleSubModal(id)}
                                    style={{
                                        padding: "10px 15px",
                                        backgroundColor:
                                            activeSubModal === id
                                                ? "#FF7C02"
                                                : "#ccc",
                                        color:
                                            activeSubModal === id
                                                ? "white"
                                                : "black",
                                        border: "none",
                                        borderRadius: 5,
                                        cursor: "pointer",
                                        minWidth: 90,
                                    }}
                                >
                                    Botón {id}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={toggleModal}
                            style={{
                                padding: "10px 20px",
                                borderRadius: 5,
                                border: "none",
                                backgroundColor: "#FF7C02",
                                color: "white",
                                cursor: "pointer",
                                alignSelf: "center",
                            }}
                        >
                            Cerrar Modal Principal
                        </button>

                        {activeSubModal && (
                            <div
                                style={{
                                    position: "absolute",
                                    top: "10%",
                                    left: "10%",
                                    width: "80%",
                                    height: "60%",
                                    backgroundColor: "white",
                                    borderRadius: 10,
                                    boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                                    padding: 20,
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "space-between",
                                    zIndex: 10000,
                                }}
                            >
                                <h3>Submodal {activeSubModal}</h3>
                                <p>
                                    Aquí va la información del submodal número{" "}
                                    {activeSubModal}.
                                </p>
                                <button
                                    onClick={() =>
                                        toggleSubModal(activeSubModal)
                                    }
                                    style={{
                                        padding: "8px 16px",
                                        borderRadius: 5,
                                        border: "none",
                                        backgroundColor: "#FF7C02",
                                        color: "white",
                                        cursor: "pointer",
                                        alignSelf: "center",
                                    }}
                                >
                                    Cerrar Submodal
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default Dashboard;
