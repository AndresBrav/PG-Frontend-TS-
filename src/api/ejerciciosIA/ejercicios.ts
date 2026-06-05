import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const completarJuego = async (
    clave: string,
    juego_id: string | number
) => {
    try {
        const response = await axios.put(
            `${API}/juegosIA/completar/${juego_id}`,
            {},
            {
                headers: {
                    Authorization: clave,
                    'ngrok-skip-browser-warning': 'true',
                },
            }
        );
        console.log('completarJuego response:', response.data);
        return response.data;
    } catch (error: any) {
        console.error('Error completarJuego:', error.response ?? error);
        throw error;
    }
};

export default completarJuego;
