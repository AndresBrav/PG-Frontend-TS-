import axios from "axios";

const API = import.meta.env.VITE_API_URL;

export interface LoginResponse {
    token: string;
}

export const loginuser = async (
    username: string,
    password: string
): Promise<LoginResponse> => {
    // Por eso, aunque no escribas response.data en el genérico,
    //  TypeScript sabe que lo que importa es el tipo de data
    //  dentro de response.
    const { data } = await axios.post<LoginResponse>(
        `${API}/usuarios/login/iniciar`,
        { username, password },
        { headers: { "Content-Type": "application/json" } }
    );
    return data;
};
