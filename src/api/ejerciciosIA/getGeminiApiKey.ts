import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';

let cachedApiKey: string | null = null;

export async function getGeminiApiKey(claveAcceso?: string): Promise<string> {
    if (cachedApiKey) {
        return cachedApiKey;
    }

    try {
        const token = claveAcceso || localStorage.getItem('token') || '';
        const response = await axios.get<{ apiKey: string }>(`${API}/juegos/gemini-key`, {
            headers: {
                Authorization: token,
                'ngrok-skip-browser-warning': 'true',
            },
        });

        if (response.data && response.data.apiKey) {
            cachedApiKey = response.data.apiKey;
            return cachedApiKey;
        }
        return '';
    } catch (error) {
        console.error('Error al obtener la Gemini API Key desde el servidor:', error);
        return '';
    }
}
