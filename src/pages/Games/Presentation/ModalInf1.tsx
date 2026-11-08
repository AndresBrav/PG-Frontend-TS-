import React, { useState } from 'react';
import '../../../assets/styles/stylesModal/designModals.css';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
}

/* ============================================================
   SIMBOLOGÍA (la que usa el editor del proyecto)
   ============================================================ */

const SIMBOLOS = [
    {
        titulo: 'Inicio / Final',
        descripcion:
            'El óvalo marca el punto donde comienza y donde termina el algoritmo. Todo diagrama de flujo tiene exactamente un Inicio, y la ejecución siempre termina en un Fin.',
        usos: 'Se coloca siempre arriba (Inicio) y abajo (Fin); no contiene operaciones.',
        preview: 'oval',
    },
    {
        titulo: 'Proceso',
        descripcion:
            'El rectángulo representa una acción o cálculo que se ejecuta tal cual: asignaciones y operaciones (suma <- a + b, i <- i + 1). No lee ni escribe datos por sí mismo.',
        usos: 'Un rectángulo por cada paso de cálculo; si necesitas dos cálculos independientes, usa dos rectángulos encadenados.',
        preview: 'rect',
    },
    {
        titulo: 'Entrada / Salida',
        descripcion:
            'El paralelogramo representa la interacción con el usuario: Leer (trae un dato desde el teclado) y Escribir (muestra un dato en pantalla).',
        usos: 'Un paralelogramo por cada Leer o Escribir; es donde el algoritmo "dialoga" con el usuario.',
        preview: 'parallelogram',
    },
    {
        titulo: 'Decisión',
        descripcion:
            'El rombo contiene una pregunta que solo puede ser verdadera o falsa. De él salen dos flechas: Sí (rama verdadera) y No (rama falsa); el flujo sigue por una sola.',
        usos: 'La pregunta se escribe con una comparación (edad >= 18?). El rombo nunca asigna ni calcula: solo decide.',
        preview: 'diamond',
    },
] as const;

/* ============================================================
   ESTRUCTURAS: diagramas de ejemplo en SVG
   ============================================================ */

const estiloTexto = {
    fill: 'var(--text, #6b6375)',
    fontSize: 10,
    textAnchor: 'middle' as const,
};

const FlechaMarker = ({ id }: { id: string }) => (
    <defs>
        <marker
            id={id}
            markerUnits="userSpaceOnUse"
            markerWidth="12"
            markerHeight="8"
            refX="9"
            refY="3"
            orient="auto"
        >
            <path d="M0,0 L9,3 L0,6 Z" fill="var(--edge-color, #6b6375)" />
        </marker>
    </defs>
);

/* --- 1. Secuencial --- */
const DiagramaSecuencial = () => (
    <svg viewBox="0 0 220 285" style={{ maxWidth: 320, width: '100%' }}>
        <FlechaMarker id="fle-seq" />
        <ellipse
            cx="110"
            cy="28"
            rx="36"
            ry="16"
            fill="var(--node-startend, #e8f5e9)"
            stroke="var(--node-startend-border, #4caf50)"
            strokeWidth="2"
        />
        <text x="110" y="32" style={estiloTexto}>
            Inicio
        </text>
        <line
            x1="110"
            y1="44"
            x2="110"
            y2="62"
            stroke="var(--edge-color, #6b6375)"
            strokeWidth="2"
            markerEnd="url(#fle-seq)"
        />

        <rect
            x="50"
            y="63"
            width="120"
            height="30"
            rx="4"
            fill="var(--node-data, #fff3e0)"
            stroke="var(--node-data-border, #ff9800)"
            strokeWidth="2"
        />
        <text x="110" y="82" style={estiloTexto}>
            Leer a, b
        </text>
        <line
            x1="110"
            y1="93"
            x2="110"
            y2="111"
            stroke="var(--edge-color, #6b6375)"
            strokeWidth="2"
            markerEnd="url(#fle-seq)"
        />

        <rect
            x="50"
            y="112"
            width="120"
            height="30"
            rx="4"
            fill="var(--node-process, #e3f2fd)"
            stroke="var(--node-process-border, #2196f3)"
            strokeWidth="2"
        />
        <text x="110" y="131" style={estiloTexto}>
            suma &lt;- a + b
        </text>
        <line
            x1="110"
            y1="142"
            x2="110"
            y2="160"
            stroke="var(--edge-color, #6b6375)"
            strokeWidth="2"
            markerEnd="url(#fle-seq)"
        />

        <polygon
            points="75,161 175,161 155,191 55,191"
            fill="var(--node-data, #fff3e0)"
            stroke="var(--node-data-border, #ff9800)"
            strokeWidth="2"
        />
        <text x="115" y="180" style={estiloTexto}>
            Escribir suma
        </text>
        <line
            x1="110"
            y1="191"
            x2="110"
            y2="219"
            stroke="var(--edge-color, #6b6375)"
            strokeWidth="2"
            markerEnd="url(#fle-seq)"
        />

        <ellipse
            cx="110"
            cy="237"
            rx="36"
            ry="16"
            fill="var(--node-startend, #e8f5e9)"
            stroke="var(--node-startend-border, #4caf50)"
            strokeWidth="2"
        />
        <text x="110" y="241" style={estiloTexto}>
            Fin
        </text>
    </svg>
);

/* --- 2. Selectivas --- */
const DiagramaSelectivas = () => (
    <svg viewBox="0 0 320 250" style={{ maxWidth: 420, width: '100%' }}>
        <FlechaMarker id="fle-sel" />
        <ellipse
            cx="160"
            cy="25"
            rx="36"
            ry="16"
            fill="var(--node-startend, #e8f5e9)"
            stroke="var(--node-startend-border, #4caf50)"
            strokeWidth="2"
        />
        <text x="160" y="29" style={estiloTexto}>
            Inicio
        </text>
        <line
            x1="160"
            y1="41"
            x2="160"
            y2="56"
            stroke="var(--edge-color, #6b6375)"
            strokeWidth="2"
            markerEnd="url(#fle-sel)"
        />

        <polygon
            points="128,57 232,57 212,87 108,87"
            fill="var(--node-data, #fff3e0)"
            stroke="var(--node-data-border, #ff9800)"
            strokeWidth="2"
        />
        <text x="170" y="76" style={estiloTexto}>
            Leer edad
        </text>
        <line
            x1="160"
            y1="87"
            x2="160"
            y2="104"
            stroke="var(--edge-color, #6b6375)"
            strokeWidth="2"
            markerEnd="url(#fle-sel)"
        />

        <polygon
            points="160,105 215,134 160,163 105,134"
            fill="var(--node-decision, #fce4ec)"
            stroke="var(--node-decision-border, #e91e63)"
            strokeWidth="2"
        />
        <text x="160" y="138" style={estiloTexto}>
            edad &gt;= 18 ?
        </text>

        {/* Rama Sí (derecha) */}
        <line
            x1="215"
            y1="134"
            x2="232"
            y2="134"
            stroke="var(--edge-color, #6b6375)"
            strokeWidth="2"
            markerEnd="url(#fle-sel)"
        />
        <text
            x="222"
            y="126"
            fill="var(--yes-color, #2e7d32)"
            fontSize="9"
            fontWeight="bold"
            textAnchor="middle"
        >
            Sí
        </text>
        <rect
            x="233"
            y="121"
            width="82"
            height="26"
            rx="4"
            fill="var(--node-data, #fff3e0)"
            stroke="var(--node-data-border, #ff9800)"
            strokeWidth="2"
        />
        <text x="274" y="138" style={{ ...estiloTexto, fontSize: 9 }}>
            Escribir «Mayor»
        </text>

        {/* Rama No (izquierda) */}
        <line
            x1="105"
            y1="134"
            x2="88"
            y2="134"
            stroke="var(--edge-color, #6b6375)"
            strokeWidth="2"
            markerEnd="url(#fle-sel)"
        />
        <text
            x="98"
            y="126"
            fill="var(--no-color, #c62828)"
            fontSize="9"
            fontWeight="bold"
            textAnchor="middle"
        >
            No
        </text>
        <rect
            x="5"
            y="121"
            width="82"
            height="26"
            rx="4"
            fill="var(--node-data, #fff3e0)"
            stroke="var(--node-data-border, #ff9800)"
            strokeWidth="2"
        />
        <text x="46" y="138" style={{ ...estiloTexto, fontSize: 9 }}>
            Escribir «Menor»
        </text>

        {/* Convergencia hacia Fin */}
        <polyline
            points="274,147 274,180 160,180"
            fill="none"
            stroke="var(--edge-color, #6b6375)"
            strokeWidth="2"
        />
        <polyline
            points="46,147 46,180 160,180"
            fill="none"
            stroke="var(--edge-color, #6b6375)"
            strokeWidth="2"
        />
        <line
            x1="160"
            y1="180"
            x2="160"
            y2="197"
            stroke="var(--edge-color, #6b6375)"
            strokeWidth="2"
            markerEnd="url(#fle-sel)"
        />
        <ellipse
            cx="160"
            cy="214"
            rx="36"
            ry="16"
            fill="var(--node-startend, #e8f5e9)"
            stroke="var(--node-startend-border, #4caf50)"
            strokeWidth="2"
        />
        <text x="160" y="218" style={estiloTexto}>
            Fin
        </text>
    </svg>
);

/* --- 3. Decisiones Anidadas --- */
const DiagramaAnidadas = () => (
    <svg viewBox="0 0 340 330" style={{ maxWidth: 440, width: '100%' }}>
        <FlechaMarker id="fle-ani" />
        <ellipse
            cx="170"
            cy="20"
            rx="36"
            ry="14"
            fill="var(--node-startend, #e8f5e9)"
            stroke="var(--node-startend-border, #4caf50)"
            strokeWidth="2"
        />
        <text x="170" y="24" style={estiloTexto}>
            Inicio
        </text>
        <line
            x1="170"
            y1="34"
            x2="170"
            y2="52"
            stroke="var(--edge-color, #6b6375)"
            strokeWidth="2"
            markerEnd="url(#fle-ani)"
        />

        <polygon
            points="138,53 242,53 222,83 118,83"
            fill="var(--node-data, #fff3e0)"
            stroke="var(--node-data-border, #ff9800)"
            strokeWidth="2"
        />
        <text x="180" y="73" style={estiloTexto}>
            Leer edad, aprobado
        </text>
        <line
            x1="170"
            y1="83"
            x2="170"
            y2="101"
            stroke="var(--edge-color, #6b6375)"
            strokeWidth="2"
            markerEnd="url(#fle-ani)"
        />

        {/* Rombo exterior */}
        <polygon
            points="170,102 225,129 170,156 115,129"
            fill="var(--node-decision, #fce4ec)"
            stroke="var(--node-decision-border, #e91e63)"
            strokeWidth="2"
        />
        <text x="170" y="133" style={estiloTexto}>
            edad &gt;= 18 ?
        </text>

        {/* No -> menor de edad */}
        <text
            x="98"
            y="121"
            fill="var(--no-color, #c62828)"
            fontSize="9"
            fontWeight="bold"
            textAnchor="middle"
        >
            No
        </text>
        <line
            x1="115"
            y1="129"
            x2="98"
            y2="129"
            stroke="var(--edge-color, #6b6375)"
            strokeWidth="2"
            markerEnd="url(#fle-ani)"
        />
        <rect
            x="8"
            y="116"
            width="89"
            height="26"
            rx="4"
            fill="var(--node-data, #fff3e0)"
            stroke="var(--node-data-border, #ff9800)"
            strokeWidth="2"
        />
        <text x="52" y="133" style={{ ...estiloTexto, fontSize: 9 }}>
            Es menor de edad
        </text>

        {/* Sí -> rombo interior */}
        <text
            x="180"
            y="170"
            fill="var(--yes-color, #2e7d32)"
            fontSize="9"
            fontWeight="bold"
            textAnchor="middle"
        >
            Sí
        </text>
        <line
            x1="170"
            y1="156"
            x2="170"
            y2="174"
            stroke="var(--edge-color, #6b6375)"
            strokeWidth="2"
            markerEnd="url(#fle-ani)"
        />
        <polygon
            points="170,175 222,200 170,225 118,200"
            fill="var(--node-decision, #fce4ec)"
            stroke="var(--node-decision-border, #e91e63)"
            strokeWidth="2"
        />
        <text x="170" y="204" style={estiloTexto}>
            aprobado ?
        </text>

        {/* Sí interior -> licencia */}
        <text
            x="231"
            y="194"
            fill="var(--yes-color, #2e7d32)"
            fontSize="9"
            fontWeight="bold"
            textAnchor="middle"
        >
            Sí
        </text>
        <line
            x1="222"
            y1="200"
            x2="239"
            y2="200"
            stroke="var(--edge-color, #6b6375)"
            strokeWidth="2"
            markerEnd="url(#fle-ani)"
        />
        <rect
            x="240"
            y="187"
            width="96"
            height="26"
            rx="4"
            fill="var(--node-data, #fff3e0)"
            stroke="var(--node-data-border, #ff9800)"
            strokeWidth="2"
        />
        <text x="288" y="204" style={{ ...estiloTexto, fontSize: 9 }}>
            Puede obtener licencia
        </text>

        {/* No interior -> examen */}
        <text
            x="180"
            y="235"
            fill="var(--no-color, #c62828)"
            fontSize="9"
            fontWeight="bold"
            textAnchor="middle"
        >
            No
        </text>
        <line
            x1="170"
            y1="225"
            x2="170"
            y2="242"
            stroke="var(--edge-color, #6b6375)"
            strokeWidth="2"
            markerEnd="url(#fle-ani)"
        />
        <rect
            x="118"
            y="243"
            width="104"
            height="26"
            rx="4"
            fill="var(--node-data, #fff3e0)"
            stroke="var(--node-data-border, #ff9800)"
            strokeWidth="2"
        />
        <text x="170" y="260" style={{ ...estiloTexto, fontSize: 9 }}>
            Debe aprobar el examen
        </text>

        {/* Convergencia */}
        <polyline
            points="52,142 52,280 170,280"
            fill="none"
            stroke="var(--edge-color, #6b6375)"
            strokeWidth="2"
        />
        <polyline
            points="170,269 170,280"
            fill="none"
            stroke="var(--edge-color, #6b6375)"
            strokeWidth="2"
        />
        <polyline
            points="288,213 288,280 170,280"
            fill="none"
            stroke="var(--edge-color, #6b6375)"
            strokeWidth="2"
        />
        <line
            x1="170"
            y1="280"
            x2="170"
            y2="298"
            stroke="var(--edge-color, #6b6375)"
            strokeWidth="2"
            markerEnd="url(#fle-ani)"
        />
        <ellipse
            cx="170"
            cy="314"
            rx="36"
            ry="14"
            fill="var(--node-startend, #e8f5e9)"
            stroke="var(--node-startend-border, #4caf50)"
            strokeWidth="2"
        />
        <text x="170" y="318" style={estiloTexto}>
            Fin
        </text>
    </svg>
);

/* --- 4. Repetitivas --- */
const DiagramaRepetitivas = () => (
    <svg viewBox="0 0 340 318" style={{ maxWidth: 440, width: '100%' }}>
        <FlechaMarker id="fle-rep" />
        <ellipse
            cx="170"
            cy="20"
            rx="36"
            ry="14"
            fill="var(--node-startend, #e8f5e9)"
            stroke="var(--node-startend-border, #4caf50)"
            strokeWidth="2"
        />
        <text x="170" y="24" style={estiloTexto}>
            Inicio
        </text>
        <line
            x1="170"
            y1="34"
            x2="170"
            y2="54"
            stroke="var(--edge-color, #6b6375)"
            strokeWidth="2"
            markerEnd="url(#fle-rep)"
        />

        <rect
            x="135"
            y="55"
            width="70"
            height="30"
            rx="4"
            fill="var(--node-process, #e3f2fd)"
            stroke="var(--node-process-border, #2196f3)"
            strokeWidth="2"
        />
        <text x="170" y="75" style={estiloTexto}>
            i &lt;- 1
        </text>
        <line
            x1="170"
            y1="85"
            x2="170"
            y2="110"
            stroke="var(--edge-color, #6b6375)"
            strokeWidth="2"
            markerEnd="url(#fle-rep)"
        />

        <polygon
            points="170,111 220,140 170,169 120,140"
            fill="var(--node-decision, #fce4ec)"
            stroke="var(--node-decision-border, #e91e63)"
            strokeWidth="2"
        />
        <text x="170" y="144" style={estiloTexto}>
            i &lt;= 5 ?
        </text>

        {/* Sí: cuerpo del bucle */}
        <text
            x="182"
            y="183"
            fill="var(--yes-color, #2e7d32)"
            fontSize="9"
            fontWeight="bold"
            textAnchor="middle"
        >
            Sí
        </text>
        <line
            x1="170"
            y1="169"
            x2="170"
            y2="186"
            stroke="var(--edge-color, #6b6375)"
            strokeWidth="2"
            markerEnd="url(#fle-rep)"
        />
        <rect
            x="120"
            y="187"
            width="100"
            height="28"
            rx="4"
            fill="var(--node-data, #fff3e0)"
            stroke="var(--node-data-border, #ff9800)"
            strokeWidth="2"
        />
        <text x="170" y="205" style={estiloTexto}>
            Escribir i
        </text>
        <line
            x1="170"
            y1="215"
            x2="170"
            y2="232"
            stroke="var(--edge-color, #6b6375)"
            strokeWidth="2"
            markerEnd="url(#fle-rep)"
        />
        <rect
            x="120"
            y="233"
            width="100"
            height="28"
            rx="4"
            fill="var(--node-process, #e3f2fd)"
            stroke="var(--node-process-border, #2196f3)"
            strokeWidth="2"
        />
        <text x="170" y="253" style={estiloTexto}>
            i &lt;- i + 1
        </text>

        {/* Regreso del bucle (flecha que vuelve al rombo) */}
        <polyline
            points="170,261 35,261 35,140 118,140"
            fill="none"
            stroke="var(--edge-color, #6b6375)"
            strokeWidth="2"
            markerEnd="url(#fle-rep)"
        />

        {/* No: hacia Fin */}
        <text
            x="233"
            y="132"
            fill="var(--no-color, #c62828)"
            fontSize="9"
            fontWeight="bold"
            textAnchor="middle"
        >
            No
        </text>
        <line
            x1="220"
            y1="140"
            x2="312"
            y2="140"
            stroke="var(--edge-color, #6b6375)"
            strokeWidth="2"
        />
        <polyline
            points="312,140 312,290 208,290"
            fill="none"
            stroke="var(--edge-color, #6b6375)"
            strokeWidth="2"
            markerEnd="url(#fle-rep)"
        />

        <ellipse
            cx="170"
            cy="290"
            rx="36"
            ry="14"
            fill="var(--node-startend, #e8f5e9)"
            stroke="var(--node-startend-border, #4caf50)"
            strokeWidth="2"
        />
        <text x="170" y="294" style={estiloTexto}>
            Fin
        </text>
    </svg>
);

/* --- 5. Arreglos (Vectores) --- */
const DiagramaArreglos = () => (
    <svg viewBox="0 0 340 375" style={{ maxWidth: 440, width: '100%' }}>
        <FlechaMarker id="fle-arr" />
        <ellipse
            cx="170"
            cy="20"
            rx="36"
            ry="14"
            fill="var(--node-startend, #e8f5e9)"
            stroke="var(--node-startend-border, #4caf50)"
            strokeWidth="2"
        />
        <text x="170" y="24" style={estiloTexto}>
            Inicio
        </text>
        <line
            x1="170"
            y1="34"
            x2="170"
            y2="56"
            stroke="var(--edge-color, #6b6375)"
            strokeWidth="2"
            markerEnd="url(#fle-arr)"
        />

        <rect
            x="85"
            y="57"
            width="170"
            height="30"
            rx="4"
            fill="var(--node-process, #e3f2fd)"
            stroke="var(--node-process-border, #2196f3)"
            strokeWidth="2"
        />
        <text x="170" y="77" style={estiloTexto}>
            Dimension numeros[5]
        </text>
        <line
            x1="170"
            y1="87"
            x2="170"
            y2="110"
            stroke="var(--edge-color, #6b6375)"
            strokeWidth="2"
            markerEnd="url(#fle-arr)"
        />

        <rect
            x="135"
            y="111"
            width="70"
            height="28"
            rx="4"
            fill="var(--node-process, #e3f2fd)"
            stroke="var(--node-process-border, #2196f3)"
            strokeWidth="2"
        />
        <text x="170" y="130" style={estiloTexto}>
            i &lt;- 1
        </text>
        <line
            x1="170"
            y1="139"
            x2="170"
            y2="158"
            stroke="var(--edge-color, #6b6375)"
            strokeWidth="2"
            markerEnd="url(#fle-arr)"
        />

        <polygon
            points="170,159 220,188 170,217 120,188"
            fill="var(--node-decision, #fce4ec)"
            stroke="var(--node-decision-border, #e91e63)"
            strokeWidth="2"
        />
        <text x="170" y="192" style={estiloTexto}>
            i &lt;= 5 ?
        </text>

        {/* Sí: cuerpo del bucle */}
        <text
            x="182"
            y="225"
            fill="var(--yes-color, #2e7d32)"
            fontSize="9"
            fontWeight="bold"
            textAnchor="middle"
        >
            Sí
        </text>
        <line
            x1="170"
            y1="217"
            x2="170"
            y2="233"
            stroke="var(--edge-color, #6b6375)"
            strokeWidth="2"
            markerEnd="url(#fle-arr)"
        />
        <rect
            x="118"
            y="234"
            width="104"
            height="28"
            rx="4"
            fill="var(--node-data, #fff3e0)"
            stroke="var(--node-data-border, #ff9800)"
            strokeWidth="2"
        />
        <text x="170" y="252" style={estiloTexto}>
            Leer numeros[i]
        </text>
        <line
            x1="170"
            y1="262"
            x2="170"
            y2="278"
            stroke="var(--edge-color, #6b6375)"
            strokeWidth="2"
            markerEnd="url(#fle-arr)"
        />
        <rect
            x="108"
            y="279"
            width="124"
            height="28"
            rx="4"
            fill="var(--node-data, #fff3e0)"
            stroke="var(--node-data-border, #ff9800)"
            strokeWidth="2"
        />
        <text x="170" y="299" style={{ ...estiloTexto, fontSize: 9 }}>
            Escribir numeros[i]
        </text>

        {/* Regreso del bucle */}
        <polyline
            points="170,307 35,307 35,188 118,188"
            fill="none"
            stroke="var(--edge-color, #6b6375)"
            strokeWidth="2"
            markerEnd="url(#fle-arr)"
        />

        {/* No: hacia Fin */}
        <text
            x="233"
            y="180"
            fill="var(--no-color, #c62828)"
            fontSize="9"
            fontWeight="bold"
            textAnchor="middle"
        >
            No
        </text>
        <line
            x1="220"
            y1="188"
            x2="312"
            y2="188"
            stroke="var(--edge-color, #6b6375)"
            strokeWidth="2"
        />
        <polyline
            points="312,188 312,352 208,352"
            fill="none"
            stroke="var(--edge-color, #6b6375)"
            strokeWidth="2"
            markerEnd="url(#fle-arr)"
        />

        <ellipse
            cx="170"
            cy="352"
            rx="36"
            ry="14"
            fill="var(--node-startend, #e8f5e9)"
            stroke="var(--node-startend-border, #4caf50)"
            strokeWidth="2"
        />
        <text x="170" y="356" style={estiloTexto}>
            Fin
        </text>
    </svg>
);

const ESTRUCTURAS = [
    {
        emoji: '',
        color: '#60A5FA',
        titulo: 'Estructura Secuencial',
        tipos: 'Leer · Proceso · Escribir',
        explicacion:
            'Las instrucciones se ejecutan una después de otra, en el orden en que aparecen: primero se leen los datos, luego se procesan y al final se muestra el resultado.',
        Diagrama: DiagramaSecuencial,
    },
    {
        emoji: '',
        color: '#F472B6',
        titulo: 'Estructuras Selectivas',
        tipos: 'Si · SiNo',
        explicacion:
            'El rombo evalúa una condición y el flujo se bifurca: por la rama Sí se ejecuta un camino y por la rama No el otro. Ambos caminos vuelven a unirse antes del Fin.',
        Diagrama: DiagramaSelectivas,
    },
    {
        emoji: '',
        color: '#A78BFA',
        titulo: 'Decisiones Anidadas',
        tipos: 'Si dentro de Si',
        explicacion:
            'Un rombo interior se coloca dentro de una de las ramas del rombo exterior: primero se decide lo general y, solo si corresponde, se evalúa el criterio siguiente.',
        Diagrama: DiagramaAnidadas,
    },
    {
        emoji: '',
        color: '#4ADE80',
        titulo: 'Estructuras Repetitivas',
        tipos: 'Mientras · Repetir · Para',
        explicacion:
            'El rombo pregunta si el ciclo continúa; el cuerpo del bucle se ejecuta y una flecha de regreso vuelve a la pregunta. Cuando la respuesta es No, el flujo continúa hacia el Fin.',
        Diagrama: DiagramaRepetitivas,
    },
    {
        emoji: '',
        color: '#FB923C',
        titulo: 'Arreglos (Vectores)',
        tipos: 'Dimension · lectura por índice [i]',
        explicacion:
            'Se declara el vector con Dimension y un bucle recorre cada posición con el índice [i]: primero se leen los elementos y luego se muestran. El índice arranca en 1.',
        Diagrama: DiagramaArreglos,
    },
] as const;

/* ============================================================
   Vista previa de los símbolos (mini) para las tarjetas
   ============================================================ */

const PreviewSimbolo = ({ tipo }: { tipo: string }) => {
    if (tipo === 'oval') {
        return (
            <svg viewBox="0 0 120 60" style={{ width: 110, height: 54 }}>
                <ellipse
                    cx="60"
                    cy="30"
                    rx="52"
                    ry="24"
                    fill="var(--node-startend, #e8f5e9)"
                    stroke="var(--node-startend-border, #4caf50)"
                    strokeWidth="2"
                />
                <text x="60" y="34" style={{ ...estiloTexto, fontSize: 11 }}>
                    Inicio
                </text>
            </svg>
        );
    }
    if (tipo === 'rect') {
        return (
            <svg viewBox="0 0 120 60" style={{ width: 110, height: 54 }}>
                <rect
                    x="8"
                    y="10"
                    width="104"
                    height="40"
                    rx="4"
                    fill="var(--node-process, #e3f2fd)"
                    stroke="var(--node-process-border, #2196f3)"
                    strokeWidth="2"
                />
                <text x="60" y="34" style={{ ...estiloTexto, fontSize: 11 }}>
                    Proceso
                </text>
            </svg>
        );
    }
    if (tipo === 'parallelogram') {
        return (
            <svg viewBox="0 0 120 60" style={{ width: 110, height: 54 }}>
                <polygon
                    points="30,10 112,10 90,50 8,50"
                    fill="var(--node-data, #fff3e0)"
                    stroke="var(--node-data-border, #ff9800)"
                    strokeWidth="2"
                />
                <text x="60" y="34" style={{ ...estiloTexto, fontSize: 11 }}>
                    Datos
                </text>
            </svg>
        );
    }
    return (
        <svg viewBox="0 0 120 70" style={{ width: 110, height: 60 }}>
            <polygon
                points="60,5 112,35 60,65 8,35"
                fill="var(--node-decision, #fce4ec)"
                stroke="var(--node-decision-border, #e91e63)"
                strokeWidth="2"
            />
            <text x="60" y="39" style={{ ...estiloTexto, fontSize: 10 }}>
                ?
            </text>
        </svg>
    );
};

const ModalInf1: React.FC<ModalProps> = ({ isOpen, onClose }) => {
    const [detalle, setDetalle] = useState<{
        tipo: 'simbolo' | 'estructura';
        indice: number;
    } | null>(null);

    if (!isOpen) return null;

    const simboloSel =
        detalle?.tipo === 'simbolo' ? SIMBOLOS[detalle.indice] : null;
    const estructuraSel =
        detalle?.tipo === 'estructura' ? ESTRUCTURAS[detalle.indice] : null;

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 9999,
                padding: '10px',
            }}
        >
            <div
                style={{
                    background: 'rgba(24, 24, 24, 1)',
                    borderRadius: 15,
                    width: '100%',
                    maxWidth: '900px',
                    height: '85vh',
                    overflowY: 'auto',
                    border: '2px solid white',
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                {/* 🔹 Encabezado */}
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '10px 15px',
                        flexShrink: 0,
                    }}
                >
                    <h2
                        style={{
                            color: '#ffffff',
                            fontSize: 16,
                            fontWeight: 700,
                            margin: 0,
                        }}
                    >
                        {simboloSel
                            ? '⚪ ' + simboloSel.titulo
                            : estructuraSel
                              ? estructuraSel.emoji + ' ' + estructuraSel.titulo
                              : '📘 Diagramas de Flujo'}
                    </h2>
                    <svg
                        fill="#E11919"
                        onClick={onClose}
                        width="28px"
                        height="28px"
                        viewBox="0 0 32 32"
                        xmlns="http://www.w3.org/2000/svg"
                        style={{ cursor: 'pointer', flexShrink: 0 }}
                    >
                        <title>cancel</title>
                        <path d="M10.771 8.518c-1.144 0.215-2.83 2.171-2.086 2.915l4.573 4.571-4.573 4.571c-0.915 0.915 1.829 3.656 2.744 2.742l4.573-4.571 4.573 4.571c0.915 0.915 3.658-1.829 2.744-2.742l-4.573-4.571 4.573-4.571c0.915-0.915-1.829-3.656-2.744-2.742l-4.573 4.571-4.573-4.571c-0.173-0.171-0.394-0.223-0.657-0.173v0zM16 1c-8.285 0-15 6.716-15 15s6.715 15 15 15 15-6.716 15-15-6.715-15-15-15zM16 4.75c6.213 0 11.25 5.037 11.25 11.25s-5.037 11.25-11.25 11.25-11.25-5.037-11.25-11.25c0.001-6.213 5.037-11.25 11.25-11.25z" />
                    </svg>
                </div>

                {/* 🔹 Contenido */}
                <div
                    style={{
                        padding: '0 15px 20px 15px',
                        overflowY: 'auto',
                        flex: 1,
                    }}
                >
                    {detalle === null ? (
                        <>
                            <p
                                style={{
                                    color: '#9ca3af',
                                    fontSize: 13,
                                    lineHeight: 1.6,
                                    margin: '0 0 14px 0',
                                }}
                            >
                                Haz clic en cada símbolo o estructura para ver
                                qué representa y un ejemplo en diagrama de
                                flujo.
                            </p>

                            {/* Sección Simbología */}
                            <h3
                                style={{
                                    color: '#60A5FA',
                                    fontSize: 14,
                                    fontWeight: 700,
                                    margin: '0 0 10px 0',
                                }}
                            >
                                📐 Simbología
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                                {SIMBOLOS.map((simbolo, indice) => (
                                    <button
                                        key={simbolo.titulo}
                                        type="button"
                                        onClick={() =>
                                            setDetalle({
                                                tipo: 'simbolo',
                                                indice,
                                            })
                                        }
                                        className="text-left rounded-xl border p-4 flex flex-col items-center gap-2 transition hover:scale-[1.02]"
                                        style={{
                                            borderColor:
                                                'rgba(255,255,255,0.15)',
                                            background:
                                                'rgba(255,255,255,0.04)',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        <PreviewSimbolo
                                            tipo={simbolo.preview}
                                        />
                                        <span
                                            style={{
                                                color: '#e5e7eb',
                                                fontWeight: 700,
                                                fontSize: 13,
                                            }}
                                        >
                                            {simbolo.titulo}
                                        </span>
                                    </button>
                                ))}
                            </div>

                            {/* Sección Estructuras */}
                            <h3
                                style={{
                                    color: '#4ADE80',
                                    fontSize: 14,
                                    fontWeight: 700,
                                    margin: '18px 0 10px 0',
                                }}
                            >
                                📚 Estructuras con ejemplos
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                {ESTRUCTURAS.map((estructura, indice) => (
                                    <button
                                        key={estructura.titulo}
                                        type="button"
                                        onClick={() =>
                                            setDetalle({
                                                tipo: 'estructura',
                                                indice,
                                            })
                                        }
                                        className="text-left rounded-xl border p-4 transition hover:scale-[1.02]"
                                        style={{
                                            borderColor:
                                                estructura.color + '55',
                                            background:
                                                'rgba(255,255,255,0.04)',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 8,
                                            }}
                                        >
                                            <span style={{ fontSize: 22 }}>
                                                {estructura.emoji}
                                            </span>
                                            <span
                                                style={{
                                                    color: estructura.color,
                                                    fontWeight: 700,
                                                    fontSize: 14,
                                                }}
                                            >
                                                {estructura.titulo}
                                            </span>
                                        </div>
                                        <p
                                            style={{
                                                color: '#9ca3af',
                                                fontSize: 12,
                                                margin: '6px 0 0 0',
                                                lineHeight: 1.5,
                                            }}
                                        >
                                            {estructura.tipos}
                                        </p>
                                    </button>
                                ))}
                            </div>
                        </>
                    ) : (
                        <>
                            <button
                                type="button"
                                onClick={() => setDetalle(null)}
                                style={{
                                    background: 'rgba(255,255,255,0.08)',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    color: '#e5e7eb',
                                    borderRadius: 8,
                                    padding: '6px 12px',
                                    fontSize: 12,
                                    cursor: 'pointer',
                                    marginBottom: 14,
                                }}
                            >
                                ← Volver
                            </button>

                            <h3
                                style={{
                                    color: estructuraSel
                                        ? estructuraSel.color
                                        : '#60A5FA',
                                    fontSize: 14,
                                    fontWeight: 700,
                                    margin: '0 0 6px 0',
                                }}
                            >
                                ¿Qué es / qué significa?
                            </h3>
                            <p
                                style={{
                                    color: '#d1d5db',
                                    fontSize: 13,
                                    lineHeight: 1.7,
                                    margin: '0 0 12px 0',
                                }}
                            >
                                {estructuraSel
                                    ? estructuraSel.explicacion
                                    : simboloSel?.descripcion}
                            </p>

                            {simboloSel && (
                                <div
                                    style={{
                                        padding: 12,
                                        border: '1px solid rgba(255,255,255,0.15)',
                                        borderRadius: 10,
                                        background: 'rgba(255,255,255,0.03)',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        marginBottom: 12,
                                    }}
                                >
                                    <PreviewSimbolo tipo={simboloSel.preview} />
                                </div>
                            )}

                            {estructuraSel && (
                                <>
                                    <h3
                                        style={{
                                            color: estructuraSel.color,
                                            fontSize: 14,
                                            fontWeight: 700,
                                            margin: '10px 0 6px 0',
                                        }}
                                    >
                                        Diagrama de ejemplo
                                    </h3>
                                    <div
                                        style={{
                                            padding: 12,
                                            border: '1px solid rgba(255,255,255,0.15)',
                                            borderRadius: 10,
                                            background:
                                                'rgba(255,255,255,0.03)',
                                            display: 'flex',
                                            justifyContent: 'center',
                                            overflowX: 'auto',
                                        }}
                                    >
                                        <estructuraSel.Diagrama />
                                    </div>
                                    <p
                                        style={{
                                            color: '#6b7280',
                                            fontSize: 11,
                                            margin: '10px 0 0 0',
                                        }}
                                    >
                                        💡 Abre el modal de Pseudocódigo (Etapa
                                        2) para ver las mismas estructuras en
                                        sintaxis de texto con ejemplos
                                        copiables.
                                    </p>
                                </>
                            )}

                            {simboloSel && (
                                <p
                                    style={{
                                        color: '#9ca3af',
                                        fontSize: 12,
                                        lineHeight: 1.6,
                                        margin: 0,
                                    }}
                                >
                                    <b style={{ color: '#e5e7eb' }}>
                                        ¿Cuándo se usa?
                                    </b>{' '}
                                    {simboloSel.usos}
                                </p>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ModalInf1;
