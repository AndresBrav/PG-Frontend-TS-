import axios from "axios";

interface UsuarioPerfil {
    nombre: string;
    edad: number;
    idAvatar: string;
}

interface Puntos {
    puntuacionTotal: number;
}

const API = import.meta.env.VITE_API_URL;

export const traerUsuarios = async (
    clave: string
): Promise<UsuarioPerfil | null> => {
    try {
        const response = await axios.get<UsuarioPerfil>(
            `${API}/usuarios/traerDatosUsuario`,
            {
                headers: {
                    Authorization: clave,
                    "ngrok-skip-browser-warning": "true", // ← ESTA LÍNEA ES LA CLAVE
                },
            }
        );

        if (!response.data) return null;

        const { nombre, edad, idAvatar } = response.data;
        return { nombre, edad, idAvatar };
    } catch (error) {
        console.error("Error fetching user:", error);
        return null;
    }
};

export const traerPuntuacion = async (
    clave: string
): Promise<Puntos | null> => {
    try {
        const response = await axios.get<Puntos>(
            `${API}/usuarios/traerPuntuacion`,
            {
                headers: {
                    Authorization: clave,
                    "ngrok-skip-browser-warning": "true", // ← ESTA LÍNEA ES LA CLAVE
                },
            }
        );
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error("Error fetching score:", error);
        return null;
    }
};

// export const actualizarFotoPerfil = async (clave: string, idAvatar: string) => {
//     console.log("la clave de acceso es ",clave)
//     try {
//         const response = await axios.put(`${API}/usuarios/actualizarPefilFoto/${idAvatar}`, {
//             headers: {
//                 Authorization: clave,
//                 "ngrok-skip-browser-warning": "true", // ← ESTA LÍNEA ES LA CLAVE
//             },
//         });

//         console.log(response)
//     } catch (error) {
//         console.log("error fetching data");
//     }
// };

export const actualizarFotoPerfil = async (clave: string, idAvatar: string) => {
    console.log("la clave de acceso es ", clave);
    try {
        const response = await axios.put(
            `${API}/usuarios/actualizarPefilFoto/${idAvatar}`, // ruta correcta
            {}, // body vacío
            {
                headers: {
                    Authorization: clave, // 🔑 agrega Bearer si tu backend lo espera
                    "ngrok-skip-browser-warning": "true",
                },
            }
        );

        console.log(response.data);
    } catch (error: any) {
        console.error(
            "error fetching data:",
            error.response?.status,
            error.response?.data
        );
    }
};
