import type { NodeType } from '../types/flow';

interface SidebarProps {
    onDragStart: (event: React.DragEvent, nodeType: NodeType) => void;
    onAddNode?: (nodeType: NodeType) => void;
}

const symbols: Array<{ type: NodeType; label: string; shape: string }> = [
    { type: 'startEnd', label: 'Inicio / Final', shape: 'oval' },
    { type: 'process', label: 'Proceso', shape: 'rect' },
    { type: 'data', label: 'Entrada / Salida', shape: 'parallelogram' },
    { type: 'decision', label: 'Decisión', shape: 'diamond' },
    { type: 'cycle', label: 'Bucle', shape: 'cycle' },
];

function Sidebar({ onDragStart, onAddNode }: SidebarProps) {
    const isMobile = !!onAddNode;

    return (
        <div className="sidebar">
            <h3>Simbolos</h3>
            <div className="sidebar-items">
                {symbols.map((symbol) => (
                    <div
                        key={symbol.type}
                        className={`sidebar-item ${isMobile ? 'mobile-item' : ''}`}
                        draggable={!isMobile}
                        onDragStart={
                            !isMobile
                                ? (event) => onDragStart(event, symbol.type)
                                : undefined
                        }
                        onClick={
                            isMobile ? () => onAddNode(symbol.type) : undefined
                        }
                    >
                        <div className={`symbol-preview ${symbol.shape}`}>
                            {symbol.shape === 'oval' && (
                                <svg viewBox="0 0 120 60">
                                    <ellipse
                                        cx="60"
                                        cy="30"
                                        rx="55"
                                        ry="25"
                                        fill="var(--node-startend)"
                                        stroke="var(--border)"
                                        strokeWidth="2"
                                    />
                                    <text
                                        x="60"
                                        y="34"
                                        textAnchor="middle"
                                        fontSize="11"
                                        fill="var(--text)"
                                    >
                                        Inicio
                                    </text>
                                </svg>
                            )}
                            {symbol.shape === 'rect' && (
                                <svg viewBox="0 0 120 60">
                                    <rect
                                        x="5"
                                        y="5"
                                        width="110"
                                        height="50"
                                        rx="4"
                                        fill="var(--node-process)"
                                        stroke="var(--border)"
                                        strokeWidth="2"
                                    />
                                    <text
                                        x="60"
                                        y="34"
                                        textAnchor="middle"
                                        fontSize="11"
                                        fill="var(--text)"
                                    >
                                        Proceso
                                    </text>
                                </svg>
                            )}
                            {symbol.shape === 'parallelogram' && (
                                <svg viewBox="0 0 120 60">
                                    <polygon
                                        points="20,5 115,5 100,55 5,55"
                                        fill="var(--node-data)"
                                        stroke="var(--border)"
                                        strokeWidth="2"
                                    />
                                    <text
                                        x="60"
                                        y="34"
                                        textAnchor="middle"
                                        fontSize="11"
                                        fill="var(--text)"
                                    >
                                        Datos
                                    </text>
                                </svg>
                            )}
                            {symbol.shape === 'diamond' && (
                                <svg viewBox="0 0 120 80">
                                    <polygon
                                        points="60,5 115,40 60,75 5,40"
                                        fill="var(--node-decision)"
                                        stroke="var(--border)"
                                        strokeWidth="2"
                                    />
                                    <text
                                        x="60"
                                        y="44"
                                        textAnchor="middle"
                                        fontSize="11"
                                        fill="var(--text)"
                                    >
                                        ?
                                    </text>
                                    <text
                                        x="110"
                                        y="44"
                                        textAnchor="middle"
                                        fontSize="8"
                                        fill="var(--yes-color)"
                                        fontWeight="bold"
                                    >
                                        SI
                                    </text>
                                    <text
                                        x="10"
                                        y="44"
                                        textAnchor="middle"
                                        fontSize="8"
                                        fill="var(--no-color)"
                                        fontWeight="bold"
                                    >
                                        NO
                                    </text>
                                </svg>
                            )}
                            {symbol.shape === 'cycle' && (
                                <svg viewBox="0 0 120 80">
                                    <polygon
                                        points="60,5 115,40 60,75 5,40"
                                        fill="var(--node-cycle)"
                                        stroke="var(--node-cycle-border)"
                                        strokeWidth="2"
                                    />
                                    <text
                                        x="60"
                                        y="44"
                                        textAnchor="middle"
                                        fontSize="11"
                                        fill="var(--text)"
                                    >
                                        ↺
                                    </text>
                                    <text
                                        x="110"
                                        y="44"
                                        textAnchor="middle"
                                        fontSize="8"
                                        fill="var(--yes-color)"
                                        fontWeight="bold"
                                    >
                                        SI
                                    </text>
                                    <text
                                        x="10"
                                        y="44"
                                        textAnchor="middle"
                                        fontSize="8"
                                        fill="var(--no-color)"
                                        fontWeight="bold"
                                    >
                                        NO
                                    </text>
                                </svg>
                            )}
                        </div>
                        <span className="symbol-name">{symbol.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Sidebar;
