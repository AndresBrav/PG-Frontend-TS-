import axios from 'axios';
const API = import.meta.env.VITE_API_URL;

export const traerJuegosIA = async (clave: string): Promise<any> => {
    try {
        // Axios devuelve un objeto AxiosResponse, y el dato útil está en .data
        const response = await axios.get(`${API}/juegos/traerJuegosConIA`, {
            headers: {
                Authorization: clave,
                'ngrok-skip-browser-warning': 'true',
            },
        });

        //
        if (!response.data) return null;
        console.log(
            'el arreglo que se trae es .................. ',
            response.data.juegosIA
        );
        const { juegosIA, msg } = response.data;
        return { juegosIA, msg };
    } catch (error) {
        console.error('Error fetching notifications:', error);
        return null;
    }
};

export const traerJuegosIAPseudo = async (clave: string): Promise<any> => {
    try {
        // Axios devuelve un objeto AxiosResponse, y el dato útil está en .data
        const response = await axios.get(
            `${API}/juegos/traerJuegosConIAPseudo`,
            {
                headers: {
                    Authorization: clave,
                    'ngrok-skip-browser-warning': 'true',
                },
            }
        );

        //
        if (!response.data) return null;
        console.log(
            'el arreglo que se trae es .................. ',
            response.data.juegosIA
        );
        const { juegosIA, msg } = response.data;
        return { juegosIA, msg };
    } catch (error) {
        console.error('Error fetching notifications:', error);
        return null;
    }
};

interface DatosJuegoIA {
    descripcion: string;
    tipo_juego: string;
    completado: boolean;
    puntos: number;
}

export const guardarJuegoIA = async (
    clave: string,
    datos: DatosJuegoIA
): Promise<any> => {
    try {
        const response = await axios.post(
            `${API}/juegosIA/guardarjuegoIA`,
            datos,
            {
                headers: {
                    Authorization: clave,
                    'ngrok-skip-browser-warning': 'true',
                },
            }
        );

        if (!response.data) return null;
        console.log('Juego guardado exitosamente:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error guardando juego:', error);
        return null;
    }
};
