import { revisarDiagramaIA } from './ejercicioIAapi';

export async function verificarDiagrama(
    jsonDiagrama: unknown,
    juegoId: number,
    claveAcceso: string
): Promise<string> {
    const respuesta = await revisarDiagramaIA(
        claveAcceso,
        juegoId,
        jsonDiagrama
    );
    return respuesta.resultado;
}
