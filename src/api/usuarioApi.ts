import axios from "axios";

interface UsuarioPerfil {
    nombre: string;
    edad: number;
    idAvatar: string;
}

interface Puntos {
    puntuacionTotal: number;
}

export const traerUsuarios = async (
    clave: string
): Promise<UsuarioPerfil | null> => {
    try {
        const response = await axios.get<UsuarioPerfil>(
            "http://localhost:3000/usuarios/traerDatosUsuario",
            {
                headers: {
                    Authorization: clave,
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
            "http://localhost:3000/usuarios/traerPuntuacion",
            {
                headers: {
                    Authorization: clave,
                },
            }
        );
        console.log(response.data)
        return response.data;
    } catch (error) {
        console.error("Error fetching score:", error);
        return null;
    }
};
