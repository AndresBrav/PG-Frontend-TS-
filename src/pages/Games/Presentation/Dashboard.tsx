// import React, { useState } from "react";

// const Dashboard: React.FC = () => {
//     // Estado para saber si el modal principal está abierto o cerrado
//     const [modalAbierto, setModalAbierto] = useState(false);
//     // Estado para saber qué submodal está activo (null = ninguno)
//     const [submodalActivo, setSubmodalActivo] = useState<number | null>(null);

//     // Alterna la visibilidad del modal principal
//     const alternarModal = () => {
//         setModalAbierto(!modalAbierto);
//         if (modalAbierto) setSubmodalActivo(null); // Si se cierra, reinicia submodal
//     };

//     // Alterna la visibilidad de un submodal
//     const alternarSubmodal = (id: number) => {
//         setSubmodalActivo(submodalActivo === id ? null : id);
//     };

//     return (
//         <>
//             {/* Botón para abrir modal principal */}
//             <button onClick={alternarModal} style={{ padding: 10, margin: 20 }}>
//                 Abrir Modal
//             </button>

//             {/* Modal principal */}
//             {modalAbierto && (
//                 <div
//                     onClick={alternarModal} // Cierra al hacer clic fuera
//                     style={{
//                         position: "fixed",
//                         inset: 0,
//                         background: "rgba(0,0,0,0.4)",
//                         display: "flex",
//                         justifyContent: "center",
//                         alignItems: "center",
//                         zIndex: 9999,
//                     }}
//                 >
//                     {/* Contenido del modal principal */}
//                     <div
//                         onClick={(e) => e.stopPropagation()} // Evita cierre al hacer clic dentro
//                         style={{
//                             background: "white",
//                             padding: 30,
//                             borderRadius: 10,
//                             width: 500,
//                             height: 300,
//                             display: "flex",
//                             flexDirection: "column",
//                             justifyContent: "space-between",
//                             position: "relative",
//                             textAlign: "center",
//                         }}
//                     >
//                         <h2>Modal Principal</h2>
//                         <p>Este modal tiene 3 submodales.</p>

//                         {/* Botones para abrir cada submodal */}
//                         <div
//                             style={{
//                                 display: "flex",
//                                 justifyContent: "space-around",
//                             }}
//                         >
//                             {[1, 2, 3].map((id) => (
//                                 <button
//                                     key={id}
//                                     onClick={() => alternarSubmodal(id)}
//                                     style={{
//                                         padding: "10px 15px",
//                                         background:
//                                             submodalActivo === id
//                                                 ? "#FF7C02"
//                                                 : "#ccc",
//                                         color:
//                                             submodalActivo === id
//                                                 ? "white"
//                                                 : "black",
//                                         border: "none",
//                                         borderRadius: 5,
//                                         cursor: "pointer",
//                                     }}
//                                 >
//                                     Botón {id}
//                                 </button>
//                             ))}
//                         </div>

//                         {/* Botón para cerrar modal */}
//                         <button
//                             onClick={alternarModal}
//                             style={{
//                                 padding: "10px 20px",
//                                 borderRadius: 5,
//                                 border: "none",
//                                 background: "#FF7C02",
//                                 color: "white",
//                                 cursor: "pointer",
//                                 alignSelf: "center",
//                             }}
//                         >
//                             Cerrar Modal
//                         </button>

//                         {/* Submodal */}
//                         {submodalActivo && (
//                             <div
//                                 style={{
//                                     position: "absolute",
//                                     top: "10%",
//                                     left: "10%",
//                                     width: "80%",
//                                     height: "60%",
//                                     background: "white",
//                                     borderRadius: 10,
//                                     boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
//                                     padding: 20,
//                                     display: "flex",
//                                     flexDirection: "column",
//                                     justifyContent: "space-between",
//                                     zIndex: 10000,
//                                 }}
//                             >
//                                 <h3>Submodal {submodalActivo}</h3>
//                                 <p>Contenido del submodal {submodalActivo}.</p>
//                                 <button
//                                     onClick={() =>
//                                         alternarSubmodal(submodalActivo)
//                                     }
//                                     style={{
//                                         padding: "8px 16px",
//                                         borderRadius: 5,
//                                         border: "none",
//                                         background: "#FF7C02",
//                                         color: "white",
//                                         cursor: "pointer",
//                                         alignSelf: "center",
//                                     }}
//                                 >
//                                     Cerrar Submodal
//                                 </button>
//                             </div>
//                         )}
//                     </div>
//                 </div>
//             )}
//         </>
//     );
// };

// export default Dashboard;

import React, { useState } from "react";

const Dashboard = () => {
    // Estado para controlar si el modal está abierto
    const [modalAbierto, setModalAbierto] = useState(false);

    // Función para alternar el modal
    const alternarModal = () => {
        setModalAbierto(!modalAbierto);
    };

    return (
        <>
            {/* Botón para abrir modal */}
            <button onClick={alternarModal} style={{ padding: 10, margin: 20 }}>
                Abrir Modal
            </button>

            {/* Modal */}
            {modalAbierto && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(0,0,0,0.4)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        zIndex: 9999,
                    }}
                >
                    <div
                        style={{
                            background: "white",
                            padding: 30,
                            borderRadius: 10,
                            width: 400,
                            height: 200,
                            textAlign: "center",
                        }}
                    >
                        <h2>Modal</h2>
                        <p>Este es el contenido del modal.</p>
                        <p>Este es el contenido del modal.</p>

                        {/* Botón para cerrar modal */}
                        <button
                            onClick={alternarModal}
                            style={{
                                padding: "10px 20px",
                                borderRadius: 5,
                                border: "none",
                                background: "#FF7C02",
                                color: "white",
                                cursor: "pointer",
                                marginTop: 20,
                            }}
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default Dashboard;
