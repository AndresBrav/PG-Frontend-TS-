import type { Edge, Node } from '@xyflow/react';
import { normVar } from './EditingBoard/pseintCompiler';

/**
 * Generador de pseudocódigo PSeInt a partir del diagrama de flujo del
 * FlowEditor (grafo ReactFlow). El texto generado se compila con el mismo
 * motor que el editor de pseudocódigo, de modo que el diagrama se puede
 * EJECUTAR con verificación estricta de sintaxis, consola y modo película
 * (cada línea generada recuerda el símbolo que la produjo).
 */

/** Error del generador; `nodeId` permite resaltar el símbolo culpable. */
export class ErrorDiagrama extends Error {
    nodeId?: string;

    constructor(mensaje: string, nodeId?: string) {
        super(mensaje);
        this.name = 'ErrorDiagrama';
        this.nodeId = nodeId;
    }
}

export interface CodigoDeDiagrama {
    /** Pseudocódigo PSeInt equivalente al diagrama. */
    codigo: string;
    /** Mapa número de línea (1-based) → id del símbolo que la generó. */
    lineaANodo: Map<number, string>;
}

interface NodoG {
    id: string;
    tipo: string;
    etiqueta: string;
    esFin: boolean;
}

interface AristaG {
    destino: string;
    etiqueta: string | null;
    handle: string | null;
}

const PALABRAS_INICIO = ['inicio', 'iniciar', 'comenzar', 'comienzo', 'start'];
const PALABRAS_FIN = ['fin', 'final', 'finproceso', 'end', 'terminar'];

/** Presupuesto de instrucciones emitidas (diagrama gigante o ciclo loco). */
const LIMITE_EMITIDAS = 5000;

export function generarCodigoDeDiagrama(
    nodes: Node[],
    edges: Edge[]
): CodigoDeDiagrama {
    if (nodes.length === 0) {
        throw new ErrorDiagrama('El diagrama está vacío.');
    }

    // ── Normalización del grafo ─────────────────────────────────────────
    const nodos = new Map<string, NodoG>();
    let cantidadInicio = 0;
    let cantidadFin = 0;
    let idInicio = '';

    for (const n of nodes) {
        const tipo = String(n.type ?? '').toLowerCase();
        const etiqueta = String(
            (n.data as { label?: unknown } | undefined)?.label ?? ''
        ).trim();
        let esFin = false;
        if (tipo === 'startend') {
            const clave = normVar(etiqueta);
            if (PALABRAS_INICIO.includes(clave)) {
                cantidadInicio++;
                idInicio = n.id;
            } else if (PALABRAS_FIN.includes(clave)) {
                esFin = true;
                cantidadFin++;
            } else {
                throw new ErrorDiagrama(
                    `El óvalo "${etiqueta}" debe llamarse "Inicio" o "Fin".`,
                    n.id
                );
            }
        }
        nodos.set(n.id, { id: n.id, tipo, etiqueta, esFin });
    }

    if (cantidadInicio !== 1) {
        throw new ErrorDiagrama(
            cantidadInicio === 0
                ? 'Falta el símbolo "Inicio": todo diagrama necesita un óvalo Inicio.'
                : 'Solo puede haber un símbolo "Inicio".'
        );
    }
    if (cantidadFin === 0) {
        throw new ErrorDiagrama(
            'Falta el símbolo "Fin": todo diagrama necesita al menos un óvalo Fin.'
        );
    }

    const salidas = new Map<string, AristaG[]>();
    for (const e of edges) {
        if (!nodos.has(e.source) || !nodos.has(e.target)) continue;
        const lista = salidas.get(e.source) ?? [];
        lista.push({
            destino: e.target,
            etiqueta: e.label ? String(e.label) : null,
            handle: e.sourceHandle ?? null,
        });
        salidas.set(e.source, lista);
    }

    // ── Emisor con mapa línea → símbolo ─────────────────────────────────
    const lineas: string[] = [];
    const lineaANodo = new Map<number, string>();
    let presupuesto = LIMITE_EMITIDAS;

    const emitir = (texto: string, nodeId?: string) => {
        if (presupuesto-- <= 0) {
            throw new ErrorDiagrama(
                'El diagrama es demasiado grande o tiene un ciclo que nunca llega al Fin.'
            );
        }
        lineas.push(texto);
        if (nodeId) {
            lineaANodo.set(lineas.length, nodeId);
        }
    };

    // ── Utilidades de grafo ─────────────────────────────────────────────
    // Rombos en proceso de análisis: son fronteras del DFS (llegar a un
    // bucle ancestro significa devolverle el control, no retornar al
    // rombo interior que se está clasificando).
    const buclesActivos = new Set<string>();

    const sucesorUnico = (id: string): string => {
        const destinos = [
            ...new Set((salidas.get(id) ?? []).map((a) => a.destino)),
        ];
        if (destinos.length === 0) {
            throw new ErrorDiagrama(
                'Un símbolo del diagrama no tiene flecha de salida.',
                id
            );
        }
        if (destinos.length > 1) {
            throw new ErrorDiagrama(
                'Este símbolo solo puede tener una flecha de salida (solo los rombos tienen dos).',
                id
            );
        }
        return destinos[0];
    };

    /** DFS: ¿se puede llegar de `origen` a `objetivo` sin pasar por él? */
    const alcanza = (origen: string, objetivo: string): boolean => {
        const vistos = new Set<string>();
        const pila = [origen];
        while (pila.length > 0) {
            const actual = pila.pop() as string;
            if (actual === objetivo) return true;
            if (vistos.has(actual)) continue;
            vistos.add(actual);
            const nodo = nodos.get(actual);
            // Un bucle ancestro es una frontera: la rama le devuelve el
            // control a él, no atraviesa su cuerpo buscando el objetivo.
            if (!nodo || nodo.esFin || buclesActivos.has(actual)) continue;
            for (const a of salidas.get(actual) ?? []) {
                pila.push(a.destino);
            }
        }
        return false;
    };

    /** Nodos alcanzables desde `origen` sin atravesar `excluir` (ni Fins). */
    const alcanzablesDesde = (origen: string, excluir: string): Set<string> => {
        const vistos = new Set<string>();
        const pila = [origen];
        while (pila.length > 0) {
            const actual = pila.pop() as string;
            if (vistos.has(actual) || actual === excluir) continue;
            vistos.add(actual);
            const nodo = nodos.get(actual);
            if (!nodo || nodo.esFin || buclesActivos.has(actual)) continue;
            for (const a of salidas.get(actual) ?? []) {
                pila.push(a.destino);
            }
        }
        return vistos;
    };

    /**
     * Primer nodo alcanzable desde la rama No que también es alcanzable
     * desde la rama Si (punto de unión del condicional). Devuelve el id
     * del nodo de unión, 'fin' (ambas ramas terminan) o null (rama rota).
     */
    const buscarUnion = (
        ramaNo: string,
        alcanzablesSi: Set<string>
    ): string | 'fin' | null => {
        const vistos = new Set<string>();
        const cola = [ramaNo];
        let tocoFin = false;
        while (cola.length > 0) {
            const actual = cola.shift() as string;
            if (vistos.has(actual)) continue;
            vistos.add(actual);
            if (alcanzablesSi.has(actual)) return actual;
            const nodo = nodos.get(actual);
            if (!nodo) continue;
            // Un bucle ancestro también puede ser el punto de unión (p.ej.
            // las dos ramas de un Si anidado vuelven al header del bucle).
            if (nodo.esFin) {
                tocoFin = true;
                continue;
            }
            if (buclesActivos.has(actual)) continue;
            for (const a of salidas.get(actual) ?? []) {
                cola.push(a.destino);
            }
        }
        return tocoFin ? 'fin' : null;
    };

    // ── Interpretación de símbolos ──────────────────────────────────────
    const instruccionDatos = (nodo: NodoG): string => {
        const m = nodo.etiqueta.match(/^\s*([A-Za-zÁÉÍÓÚáéíóúÑñ]+)\s*(.*)$/);
        const primera = m ? normVar(m[1]) : '';
        const resto = m ? m[2] : '';
        if (['leer', 'lea', 'pedir'].includes(primera)) {
            return resto ? `Leer ${resto}` : 'Leer';
        }
        if (
            ['escribir', 'escribe', 'mostrar', 'imprimir', 'salida'].includes(
                primera
            )
        ) {
            return resto ? `Escribir ${resto}` : 'Escribir';
        }
        throw new ErrorDiagrama(
            'En el símbolo de Datos escribe la instrucción completa: "Leer x" (entrada) o "Escribir x" (salida).',
            nodo.id
        );
    };

    /** Polaridad (true=Si / false=No) de una flecha saliente de un rombo. */
    const clasificarSalida = (idRombo: string, a: AristaG): boolean => {
        const et = a.etiqueta ? normVar(a.etiqueta) : '';
        if (['si', 'verdadero', 'v', 'true', 'yes'].includes(et)) return true;
        if (['no', 'falso', 'f', 'false'].includes(et)) return false;
        if (a.handle === 'right-source') return true;
        if (a.handle === 'left-source') return false;
        throw new ErrorDiagrama(
            'Conecta las salidas del rombo desde los handles "Si" (derecha) y "No" (izquierda), o etiqueta las flechas con Si/No.',
            idRombo
        );
    };

    // ── Caminante lineal ────────────────────────────────────────────────
    // Emite las instrucciones del camino hasta topar con un nodo de
    // `paradas` (devuelve su id) o hasta terminar el programa (null).
    const emitirCamino = (
        inicio: string,
        paradas: Set<string>
    ): string | null => {
        let actual = inicio;
        let pasos = 0;
        while (true) {
            if (++pasos > LIMITE_EMITIDAS) {
                throw new ErrorDiagrama(
                    'El diagrama tiene un ciclo que nunca llega al Fin.'
                );
            }
            if (paradas.has(actual)) return actual;
            const nodo = nodos.get(actual);
            if (!nodo) {
                throw new ErrorDiagrama('Símbolo inexistente en el diagrama.');
            }
            if (nodo.esFin) {
                emitir('Finalizar', actual);
                return null;
            }
            if (nodo.tipo === 'decision') {
                const r = generarDecision(actual, paradas);
                if ('fin' in r) return null;
                actual = r.siguiente;
                continue;
            }
            const proximo = sucesorUnico(actual);
            switch (nodo.tipo) {
                case 'startend':
                    // Inicio: no emite nada
                    break;
                case 'process':
                    if (!nodo.etiqueta) {
                        throw new ErrorDiagrama(
                            'Hay un símbolo Proceso vacío: escribe una asignación (Ej: suma <- suma + 1).',
                            actual
                        );
                    }
                    emitir(nodo.etiqueta, actual);
                    break;
                case 'data':
                    emitir(instruccionDatos(nodo), actual);
                    break;
                default:
                    throw new ErrorDiagrama(
                        `Símbolo no soportado: ${nodo.tipo}`,
                        actual
                    );
            }
            actual = proximo;
        }
    };

    // ── Generador de rombos (la parte delicada) ─────────────────────────
    const procesados = new Set<string>();

    function generarDecision(
        idD: string,
        paradasExteriores: Set<string>
    ): { siguiente: string } | { fin: true } {
        if (procesados.has(idD)) {
            throw new ErrorDiagrama(
                'Una flecha regresa a un rombo por un camino no estructurado. En un diagrama ejecutable, cada bucle debe regresar únicamente a su propio rombo.',
                idD
            );
        }
        procesados.add(idD);
        // Este rombo es frontera para los rombos que analice dentro de sí
        buclesActivos.add(idD);

        const lista = salidas.get(idD) ?? [];
        if (lista.length !== 2) {
            throw new ErrorDiagrama(
                `El rombo debe tener exactamente 2 flechas de salida (Si y No); tiene ${lista.length}.`,
                idD
            );
        }
        const esSi1 = clasificarSalida(idD, lista[0]);
        const esSi2 = clasificarSalida(idD, lista[1]);
        if (esSi1 === esSi2) {
            throw new ErrorDiagrama(
                'Las dos flechas del rombo marcan la misma salida: una debe ser "Si" y la otra "No".',
                idD
            );
        }
        const destinoSi = esSi1 ? lista[0].destino : lista[1].destino;
        const destinoNo = esSi1 ? lista[1].destino : lista[0].destino;

        // Rombo sin efecto: ambas salidas van al mismo lugar
        if (destinoSi === destinoNo) {
            return { siguiente: destinoSi };
        }

        const cond = nodos.get(idD)!.etiqueta;
        if (!cond) {
            throw new ErrorDiagrama(
                'El rombo está vacío: escribe la condición (Ej: i <= 10).',
                idD
            );
        }

        // ── ¿Bucle o condicional? ──
        const vuelveSi = alcanza(destinoSi, idD);
        const vuelveNo = alcanza(destinoNo, idD);

        if (vuelveSi && vuelveNo) {
            throw new ErrorDiagrama(
                'Las dos ramas del rombo vuelven a él: usa un solo camino de retorno para el bucle y el otro para salir.',
                idD
            );
        }

        if (vuelveSi || vuelveNo) {
            // BUCLE: la rama que retorna es el cuerpo del Mientras
            const cuerpo = vuelveSi ? destinoSi : destinoNo;
            const salidaBucle = vuelveSi ? destinoNo : destinoSi;
            const condicionBucle = vuelveSi ? cond : `No (${cond})`;
            emitir(`Mientras ${condicionBucle} Hacer`, idD);
            const r = emitirCamino(cuerpo, new Set([idD]));
            emitir('FinMientras', idD);
            if (r === null) return { fin: true };
            // El cuerpo volvió al rombo: continuar por la salida del bucle
            buclesActivos.delete(idD);
            const r2 = emitirCamino(salidaBucle, paradasExteriores);
            return r2 === null ? { fin: true } : { siguiente: r2 };
        }

        // CONDICIONAL: buscar el punto de unión de las ramas
        const alcanzablesSi = alcanzablesDesde(destinoSi, idD);
        const union = buscarUnion(destinoNo, alcanzablesSi);
        if (union === null) {
            throw new ErrorDiagrama(
                'Hay una rama del rombo que no se une al resto del flujo ni llega a un Fin.',
                idD
            );
        }

        emitir(`Si ${cond} Entonces`, idD);
        const rSi = emitirCamino(destinoSi, new Set([union]));
        if (destinoNo !== union) {
            emitir('SiNo', idD);
            // La rama No puede terminar en Fin (con Finalizar) o unirse
            emitirCamino(destinoNo, new Set([union]));
        }
        emitir('FinSi', idD);
        buclesActivos.delete(idD);
        if (rSi === null) return { fin: true };
        if (union === 'fin') return { fin: true };
        // La unión puede ser un nodo interior o un bucle ancestro (p.ej.
        // ambas ramas de un Si anidado vuelven al header del bucle padre);
        // continuar con las paradas exteriores evita re-emitir su cuerpo.
        const rCont = emitirCamino(union, paradasExteriores);
        return rCont === null ? { fin: true } : { siguiente: rCont };
    }

    // ── Recorrido principal ─────────────────────────────────────────────
    emitir('Algoritmo DiagramaEjecutable');
    emitirCamino(idInicio, new Set());
    emitir('FinAlgoritmo');

    return { codigo: lineas.join('\n'), lineaANodo };
}
