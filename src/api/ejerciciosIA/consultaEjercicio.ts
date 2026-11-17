import { generarEjercicioIA } from './ejercicioIAapi';

export async function consultarEjercicio(
    claveAcceso: string,
    temarioId?: number
): Promise<string> {
    const resultado = await generarEjercicioIA(
        claveAcceso,
        'ia',
        temarioId
    );
    return resultado.ejercicio;
}
