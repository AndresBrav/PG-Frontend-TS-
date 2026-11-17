import { revisarPseudocodigoIA } from './ejercicioIAapi';

export async function verificarPseudocodigo(
    pseudocodigo: string,
    juegoId: number,
    claveAcceso: string
): Promise<string> {
    const respuesta = await revisarPseudocodigoIA(
        claveAcceso,
        juegoId,
        pseudocodigo
    );
    return respuesta.resultado;
}
