import type { Task } from "./lineBalancer";

export interface TaskNode {
    id: string;
    name: string;
}

export interface Edge {
    from: string;
    to: string;
}

/**
 * Convierte las tareas en nodos y conexiones para graficar un diagrama dirigido.
 */
export function generateGraphData(tasks: Task[]): { nodes: TaskNode[]; edges: Edge[] } {
    const nodes = tasks.map((task) => ({ id: task.name, name: task.name }));
    const edges: Edge[] = [];

    tasks.forEach((task) => {
        task.precedence.forEach((precedenceTask) => {
            edges.push({ from: precedenceTask, to: task.name });
        });
    });

    return { nodes, edges };
}
