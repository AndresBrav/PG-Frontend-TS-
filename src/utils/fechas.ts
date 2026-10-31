const esFechaSinHora = (valor: string) =>
    /^\d{4}-\d{2}-\d{2}$/.test(valor);

const crearFechaLocal = (valor: string): Date => {
    if (!esFechaSinHora(valor)) {
        return new Date(valor);
    }

    const [anio, mes, dia] = valor.split('-').map(Number);
    return new Date(anio, mes - 1, dia);
};

export const formatearFecha = (valor: string | null | undefined): string => {
    if (!valor) return 'Sin fecha';

    const fecha = crearFechaLocal(valor);

    if (Number.isNaN(fecha.getTime())) return 'Sin fecha';

    return fecha.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
};

export const formatearFechaHora = (
    valor: string | null | undefined,
    mensajeVacio = 'Sin actividad',
): string => {
    if (!valor) return mensajeVacio;

    if (esFechaSinHora(valor)) {
        return formatearFecha(valor);
    }

    const fecha = new Date(valor);

    if (Number.isNaN(fecha.getTime())) return mensajeVacio;

    return fecha.toLocaleString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

export const fechaParaInput = (fecha: Date): string => {
    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    return `${anio}-${mes}-${dia}`;
};

export const rangoUltimosDias = (
    dias = 30,
): { desde: string; hasta: string } => {
    const hasta = new Date();
    const desde = new Date(
        hasta.getFullYear(),
        hasta.getMonth(),
        hasta.getDate() - (dias - 1),
    );

    return {
        desde: fechaParaInput(desde),
        hasta: fechaParaInput(hasta),
    };
};

export const formatearPorcentaje = (valor: number): string =>
    `${Math.round(Math.max(0, Math.min(1, valor || 0)) * 100)}%`;

export const formatearNumero = (valor: number): string =>
    Number(valor || 0).toLocaleString('es-ES');
