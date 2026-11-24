export type SeccionReporteImpresion =
    | 'estudiantes'
    | 'ejercicios'
    | 'ejercicios-estudiante'
    | 'entregas-ejercicio';

export const imprimirSeccionReporte = (
    seccion: SeccionReporteImpresion,
) => {
    document.body.dataset.seccionReporteImpresion = seccion;
    window.addEventListener(
        'afterprint',
        () => {
            delete document.body.dataset.seccionReporteImpresion;
        },
        { once: true },
    );
    window.print();
};
