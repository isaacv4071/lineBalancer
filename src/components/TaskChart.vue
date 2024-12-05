<script lang="ts">
import { defineComponent, ref, watch, onMounted } from "vue";
import type { Task } from "../utils/lineBalancer";

export default defineComponent({
    name: "TaskGraph",
    props: {
        tasks: {
            type: Array as () => Task[],
            required: true,
        },
    },
    setup(props) {
        const positions = ref<Record<string, { x: number; y: number; time: number }>>({});
        const edges = ref<{ from: string; to: string }[]>([]);
        const svgWidth = ref(800);
        const svgHeight = ref(600);
        const container = ref<HTMLElement | null>(null);

        const calculateGraph = () => {
            if (!props.tasks || props.tasks.length === 0) {
                console.warn("No se recibieron tareas.");
                positions.value = {};
                edges.value = [];
                return;
            }

            const levels: string[][] = [];
            const remainingTasks = [...props.tasks];

            // Agrupar nodos por niveles según sus precedencias
            while (remainingTasks.length > 0) {
                const currentLevel = remainingTasks.filter((task) =>
                    task.precedence.every((p) => levels.flat().includes(p))
                );
                if (currentLevel.length === 0) {
                    console.error("Se detectó una dependencia cíclica o una tarea con precedencias inexistentes.");
                    break;
                }
                levels.push(currentLevel.map((task) => task.name));
                currentLevel.forEach((task) => {
                    const index = remainingTasks.findIndex((t) => t.name === task.name);
                    remainingTasks.splice(index, 1);
                });
            }

            // Asignar posiciones iniciales
            const rawPositions: Record<string, { x: number; y: number; time: number }> = {};
            levels.forEach((level, colIndex) => {
                level.forEach((taskName, rowIndex) => {
                    const task = props.tasks.find((t) => t.name === taskName);
                    rawPositions[taskName] = {
                        x: colIndex * 250 + (rowIndex % 2) * 100,
                        y: rowIndex * 150 + 50,
                        time: task ? task.time : 0,
                    };
                });
            });

            // Calcular dimensiones máximas necesarias
            const maxX = Math.max(...Object.values(rawPositions).map((pos) => pos.x));
            const maxY = Math.max(...Object.values(rawPositions).map((pos) => pos.y));

            // Escalar posiciones para que entren en el SVG
            const scaleX = (svgWidth.value - 50) / (maxX || 1); // Evitar división por 0
            const scaleY = (svgHeight.value - 50) / (maxY || 1);
            const scale = Math.min(scaleX, scaleY); // Escalado uniforme

            const scaledPositions: Record<string, { x: number; y: number; time: number }> = {};
            Object.entries(rawPositions).forEach(([taskName, pos]) => {
                scaledPositions[taskName] = {
                    x: pos.x * scale + 25, // Agregar un margen
                    y: pos.y * scale + 25,
                    time: pos.time,
                };
            });

            positions.value = scaledPositions;

            // Crear las conexiones entre nodos
            const nodeEdges = props.tasks.flatMap((task) =>
                task.precedence.map((precedence) => ({ from: precedence, to: task.name }))
            );
            edges.value = nodeEdges;
        };


        const getAdjustedPosition = (
            x1: number | undefined,
            y1: number | undefined,
            x2: number | undefined,
            y2: number | undefined
        ) => {
            const radius = 25; // Radio de los nodos (mismo valor que el atributo r del <circle>)
            if (x1 === undefined || y1 === undefined || x2 === undefined || y2 === undefined) {
                return { x1: 0, y1: 0, x2: 0, y2: 0 };
            }

            const dx = x2 - x1; // Diferencia en X
            const dy = y2 - y1; // Diferencia en Y
            const distance = Math.sqrt(dx * dx + dy * dy); // Distancia entre los dos puntos

            if (distance === 0) return { x1, y1, x2, y2 }; // Si están en el mismo punto, no ajustar

            const offsetX = (dx / distance) * radius; // Ajuste proporcional en X
            const offsetY = (dy / distance) * radius; // Ajuste proporcional en Y

            return {
                x1: x1 + offsetX, // Punto inicial ajustado
                y1: y1 + offsetY,
                x2: x2 - offsetX, // Punto final ajustado
                y2: y2 - offsetY,
            };
        };


        watch(
            () => props.tasks,
            () => {
                calculateGraph();
            },
            { immediate: true }
        );

        onMounted(() => {
            if (container.value) {
                const resizeObserver = new ResizeObserver(() => {
                    if (container.value) {
                        svgWidth.value = container.value.offsetWidth;
                        svgHeight.value = container.value.offsetHeight;
                    }
                });
                resizeObserver.observe(container.value);
            }
        });

        return {
            positions,
            edges,
            svgWidth,
            svgHeight,
            container,
            getAdjustedPosition
        };
    },
});
</script>


<template>
    <div ref="container" class="task-graph">
        <svg :width="svgWidth" :height="svgHeight" class="graph-svg">
            <!-- Definir flecha para las líneas -->
            <defs>
                <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" />
                </marker>
            </defs>

            <line v-for="(edge, index) in edges" :key="index" v-bind="getAdjustedPosition(
                positions[edge.from]?.x,
                positions[edge.from]?.y,
                positions[edge.to]?.x,
                positions[edge.to]?.y
            )" stroke="black" stroke-width="2" marker-end="url(#arrowhead)" />


            <!-- Dibujar los nodos -->
            <g v-for="(position, taskName) in positions" :key="taskName" class="node-group"
                :transform="'translate(' + position.x + ',' + position.y + ')'">
                <circle r="25" fill="#c80684" />
                <!-- Mostrar el nombre de la tarea -->
                <text y="5" fill="white" text-anchor="middle" alignment-baseline="middle" font-weight="bold">
                    {{ taskName }}
                </text>
                <!-- Mostrar el tiempo de la tarea encima del nodo -->
                <text y="-35" fill="#333" text-anchor="middle" alignment-baseline="middle" font-size="14">
                    {{ position.time }} s
                </text>
            </g>
        </svg>
    </div>
</template>



<style scoped>
.graph-svg {
    border: 1px solid #ddd;
    background-color: #f9f9f9;
    width: 100%;
    height: 100%;
    overflow-x: auto;
    /* Scroll horizontal */
}

.task-graph {
    width: 100%;
    height: 400px;
    position: relative;
}

.node-group:hover circle {
    fill: #e91e63;
}

.node-group text {
    font-size: 14px;
    font-weight: bold;
}
</style>
