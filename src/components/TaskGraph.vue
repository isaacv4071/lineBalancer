<script lang="ts">
import { defineComponent, ref, watch } from "vue";
import { Task, generateGraphData, TaskNode, Edge } from "../utils/graphUtils";

export default defineComponent({
    name: "TaskGraph",
    props: {
        tasks: {
            type: Array as () => Task[],
            required: true,
        },
    },
    setup(props) {
        const graphData = ref<{ nodes: TaskNode[]; edges: Edge[] }>({ nodes: [], edges: [] });

        // Generar el grafo cada vez que cambien las tareas
        watch(
            () => props.tasks,
            (newTasks) => {
                graphData.value = generateGraphData(newTasks);
            },
            { immediate: true }
        );

        function getNodePosition(tasks: Task[]): Record<string, { x: number; y: number }> {
            const positions: Record<string, { x: number; y: number }> = {};
            const levels: string[][] = [];

            // Agrupar tareas por niveles
            const remainingTasks = [...tasks];
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

            // Asignar posiciones en base a los niveles
            levels.forEach((level, rowIndex) => {
                level.forEach((taskName, colIndex) => {
                    positions[taskName] = {
                        x: colIndex * 150 + 50,
                        y: rowIndex * 150 + 50,
                    };
                });
            });

            return positions;
        }


        return {
            graphData,
            getNodePosition
        };
    },
});
</script>

<template>
    <div class="task-graph">
        <!-- Contenedor SVG -->
        <svg :width="800" :height="600" class="graph-svg">
            <!-- Dibujar las conexiones -->
            <line v-for="(edge, index) in graphData.edges" :key="index" :x1="getNodePosition(edge.from).x"
                :y1="getNodePosition(edge.from).y" :x2="getNodePosition(edge.to).x" :y2="getNodePosition(edge.to).y"
                stroke="black" stroke-width="2" />

            <!-- Dibujar los nodos -->
            <g v-for="node in graphData.nodes" :key="node.id" class="node-group"
                :transform="'translate(' + getNodePosition(node.id).x + ',' + getNodePosition(node.id).y + ')'">
                <circle r="20" fill="#c80684" />
                <text fill="white" text-anchor="middle" alignment-baseline="middle">
                    {{ node.name }}
                </text>
            </g>
        </svg>
    </div>
</template>

<style scoped>
.graph-svg {
    border: 1px solid #ddd;
    background-color: #f9f9f9;
}

.node-group:hover circle {
    fill: #e91e63;
}

.node-group text {
    font-size: 14px;
    font-weight: bold;
}
</style>
