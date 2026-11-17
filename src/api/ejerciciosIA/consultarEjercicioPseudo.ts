import { generarEjercicioIA } from './ejercicioIAapi';

export async function consultarEjercicioPseudo(
    claveAcceso: string,
    temarioId?: number
): Promise<string> {
    const resultado = await generarEjercicioIA(
        claveAcceso,
        'iapseudo',
        temarioId
    );
    return resultado.ejercicio;
}
