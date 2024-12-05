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
        const positions = ref<Record<string, { x: number; y: number }>>({});
        const edges = ref<{ from: string; to: string }[]>([]);
        const svgWidth = ref(800); // Ancho dinámico del SVG
        const svgHeight = ref(600); // Alto dinámico del SVG
        const container = ref<HTMLElement | null>(null); // Referencia al contenedor

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
                levels.push(currentLevel.map((task) => task.name));
                currentLevel.forEach((task) => {
                    const index = remainingTasks.findIndex((t) => t.name === task.name);
                    remainingTasks.splice(index, 1);
                });
            }

            // Asignar posiciones horizontales
            const nodePositions: Record<string, { x: number; y: number }> = {};
            levels.forEach((level, colIndex) => {
                level.forEach((taskName, rowIndex) => {
                    nodePositions[taskName] = {
                        x: colIndex * 200 + 50, // Espaciado horizontal
                        y: rowIndex * 100 + 50, // Espaciado vertical
                    };
                });
            });

            // Crear las conexiones entre nodos
            const nodeEdges = props.tasks.flatMap((task) =>
                task.precedence.map((precedence) => ({ from: precedence, to: task.name }))
            );

            console.log("Posiciones calculadas:", nodePositions);
            console.log("Conexiones calculadas:", nodeEdges);

            positions.value = nodePositions;
            edges.value = nodeEdges;

            // Actualizar dimensiones del SVG
            svgWidth.value = levels.length * 200 + 100;
            svgHeight.value = Math.max(...levels.map((level) => level.length)) * 100 + 100;
        };

        watch(
            () => props.tasks,
            () => {
                console.log(props.tasks);
                calculateGraph();
            },
            { immediate: true }
        );

        // Ajustar el tamaño del SVG al contenedor
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
        };
    },
});
</script>

<template>
    <div ref="container" class="task-graph">
        <svg :width="svgWidth" :height="svgHeight" class="graph-svg">
            <!-- Dibujar las conexiones -->
            <line
                v-for="(edge, index) in edges"
                :key="index"
                :x1="positions[edge.from]?.x || 0"
                :y1="positions[edge.from]?.y || 0"
                :x2="positions[edge.to]?.x || 0"
                :y2="positions[edge.to]?.y || 0"
                stroke="black"
                stroke-width="2"
            />

            <!-- Dibujar los nodos -->
            <g
                v-for="(position, taskName) in positions"
                :key="taskName"
                class="node-group"
                :transform="'translate(' + position.x + ',' + position.y + ')'"
            >
                <circle r="20" fill="#c80684" />
                <text fill="white" text-anchor="middle" alignment-baseline="middle">
                    {{ taskName }}
                </text>
            </g>
        </svg>
    </div>
</template>


<style scoped>
.graph-svg {
    border: 1px solid #ddd;
    background-color: #f9f9f9;
    width: 100%; /* SVG ocupa el 100% del contenedor */
    height: 100%; /* SVG ocupa el 100% del contenedor */
}

.task-graph {
    width: 100%; /* Asegura que el contenedor sea responsivo */
    height: 400px; /* Ajusta este valor según tus necesidades */
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
