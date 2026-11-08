import Swal from 'sweetalert2';
import { consultarEjercicioPseudo } from '../../../api/ejerciciosIA/consultarEjercicioPseudo';
import {
    guardarJuegoIA,
    traerJuegosIAPseudo,
    traerTemariosIA,
} from '../../../api/ejerciciosIA/ejercicioIAapi';

// Handler para generar y guardar un ejercicio de pseudocódigo IA.
// Si temarioElegido viene dado (chip activo del Dashboard), el prompt
// se enfoca en ese temario y el guardado lo asocia sin pedir selección.
export async function generarEjercicioHandlerPseudo(
    claveAcceso: any,
    setJuegosIAPseudo: any,
    temarioElegido?: { id: number; nombre: string } | null
) {
    // Mostrar loading
    Swal.fire({
        title: 'Generando ejercicio...',
        html: 'Por favor espera mientras se genera tu ejercicio',
        icon: 'info',
        iconColor: '#FF7C02',
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
            Swal.showLoading();
        },
    });

    try {
        // Temarios globales de IA (si fallan, se continúa sin temario)
        const temarios = temarioElegido ? [] : await traerTemariosIA(claveAcceso);
        const opcionesTemario = temarios
            .map(
                (t: any) =>
                    `<option value="${t.id}">${t.nombre}</option>`
            )
            .join('');

        // Consultar el ejercicio a la IA (con foco en el temario elegido)
        const ejercicioGenerado = await consultarEjercicioPseudo(
            claveAcceso,
            temarioElegido?.nombre ?? undefined,
        );

        // Mostrar el ejercicio generado
        const result = await Swal.fire({
            title: 'Ejercicio Generado',
            html: `
                    <div style="text-align: left; padding: 20px; background: rgba(217, 217, 217, 0.3); border-radius: 10px; margin: 15px 0;">
                        <h2 style="color: #333; margin-bottom: 15px; font-size: 18px;">Problema:</h2>
                        <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
                            ${ejercicioGenerado}
                        </p>
                        ${
                            opcionesTemario
                                ? `<label style="display:block; text-align:left; color:#333; font-weight:bold; font-size:14px; margin-bottom:4px;">Temario:</label>
                        <select id="select-temario-ia" class="swal2-input" style="display:flex; width:100%; margin:0 0 8px 0; font-size:14px;">${opcionesTemario}</select>`
                                : ''
                        }
                    </div>
                `,
            icon: 'info',
            iconColor: '#FF7C02',
            confirmButtonText: 'Guardar',
            showCancelButton: true,
            cancelButtonText: 'Cancelar',
            customClass: {
                title: 'titulo-celular',
                confirmButton: 'btn-semitransparente',
                cancelButton: 'btn-cancelar',
                icon: 'icono-celular',
            },
            width: '80%',
        });

        if (result.isConfirmed) {
            try {
                // Guardar el juego en la base de datos
                if (claveAcceso) {
                    let temarioId: number | undefined = temarioElegido?.id;

                    // Sin temario pre-elegido: se pide en el modal
                    if (!temarioId) {
                        const selectTemario = document.getElementById(
                            'select-temario-ia'
                        ) as HTMLSelectElement | null;
                        if (selectTemario && selectTemario.value) {
                            temarioId = Number(selectTemario.value);
                        }
                    }

                    const datosJuego = {
                        descripcion: ejercicioGenerado,
                        tipo_juego: 'iapseudo',
                        completado: false,
                        puntos: 0,
                        ...(temarioId ? { temario_id: temarioId } : {}),
                    };
                    await guardarJuegoIA(claveAcceso, datosJuego);

                    // Recargar los juegos IA Pseudo después de guardar
                    const dataJuegos = await traerJuegosIAPseudo(claveAcceso);
                    if (dataJuegos && dataJuegos.juegosIA) {
                        setJuegosIAPseudo(dataJuegos.juegosIA);
                    }
                }

                // Mostrar mensaje de confirmación
                await Swal.fire({
                    title: 'Ejercicio Guardado',
                    text: '¡Ejercicio guardado exitosamente!',
                    icon: 'success',
                    iconColor: 'green',
                    confirmButtonText: 'Continuar',
                    customClass: {
                        title: 'titulo-celular',
                        confirmButton: 'btn-semitransparente',
                        icon: 'icono-celular',
                    },
                    width: '80%',
                });
            } catch (error) {
                console.error('Error al guardar el juego:', error);
                await Swal.fire({
                    title: 'Error',
                    text: 'No se pudo guardar el ejercicio',
                    icon: 'error',
                    confirmButtonText: 'Cerrar',
                    customClass: {
                        title: 'titulo-celular',
                        confirmButton: 'btn-semitransparente',
                        icon: 'icono-celular',
                    },
                    width: '80%',
                });
            }
        }
    } catch (error) {
        console.error('Error al generar ejercicio:', error);
        Swal.fire({
            title: 'Error',
            text: 'No se pudo generar el ejercicio. Intenta de nuevo.',
            icon: 'error',
            confirmButtonText: 'Cerrar',
            customClass: {
                title: 'titulo-celular',
                confirmButton: 'btn-semitransparente',
                icon: 'icono-celular',
            },
            width: '80%',
        });
    }
}
