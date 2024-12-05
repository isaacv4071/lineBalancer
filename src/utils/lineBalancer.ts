export interface Task {
    name: string;
    time: number;
    precedence: string[];
}

export interface Station {
    id: number;
    tasks: Task[];
    totalTime: number;
}

export function calculateCycleTime(totalAvailableTime: number, productionGoal: number): number {
    return totalAvailableTime / productionGoal;
}

export function balanceLine(tasks: Task[], cycleTime: number): Station[] {
    const stations: Station[] = [];
    let currentStation: Station = { id: 1, tasks: [], totalTime: 0 };
    const remainingTasks = [...tasks];
    const completedTasks: string[] = []; // Lista de tareas completadas
    const taskFactibles: Record<string, string[]> = {}; // Diccionario para tareas factibles

    // Identificar tareas iniciales (sin precedencia) y priorizarlas
    const initialTasks = remainingTasks.filter((task) => task.precedence.length === 0);
    const nonInitialTasks = remainingTasks.filter((task) => task.precedence.length > 0);

    // Ordenar iniciales y no iniciales por tiempo descendente
    initialTasks.sort((a, b) => b.time - a.time);
    nonInitialTasks.sort((a, b) => b.time - a.time);

    // Combinar iniciales primero, seguidas de las no iniciales
    let taskQueue = [...initialTasks, ...nonInitialTasks];

    while (taskQueue.length > 0) {
        let taskAdded = false;

        for (let i = 0; i < taskQueue.length; i++) {
            const task = taskQueue[i];

            // Verificar si las dependencias están cumplidas
            const dependenciesMet = task.precedence.every((precedingTaskName) =>
                completedTasks.includes(precedingTaskName)
            );

            // Si las dependencias están cumplidas y cabe en la estación actual
            if (dependenciesMet && currentStation.totalTime + task.time <= cycleTime) {
                currentStation.tasks.push(task);
                currentStation.totalTime += task.time;

                // Agregar tarea a completadas
                completedTasks.push(task.name);

                // Calcular tareas factibles para la tarea actual y almacenarlas
                const factibleTasks = getFactibleTasks(
                    task,
                    taskQueue,
                    cycleTime,
                    currentStation.totalTime,
                    completedTasks
                );
                taskFactibles[task.name] = factibleTasks.map((t) => t.name);

                taskQueue.splice(i, 1); // Remover tarea asignada del queue
                taskAdded = true;
                break;
            }
        }

        // Si no se pudo agregar ninguna tarea, cerrar la estación actual
        if (!taskAdded) {
            stations.push(currentStation);
            currentStation = { id: stations.length + 1, tasks: [], totalTime: 0 };
        }
    }

    // Agregar la última estación si tiene tareas
    if (currentStation.tasks.length > 0) {
        stations.push(currentStation);
    }

    // Agregar las tareas factibles como propiedad adicional a cada tarea en las estaciones
    stations.forEach((station) => {
        station.tasks = station.tasks.map((task) => ({
            ...task,
            factibles: taskFactibles[task.name] || [],
        }));
    });

    return stations;
}


export function getFactibleTasks(
    task: Task,
    remainingTasks: Task[],
    cycleTime: number,
    currentStationTime: number,
    completedTasks: string[]
): Task[] {
    const result = remainingTasks.filter((t) => {
        const isNotCurrentTask = t.name !== task.name;
        const dependenciesMet = t.precedence.every((p) => completedTasks.includes(p));
        const fitsInCycle = currentStationTime + t.time <= cycleTime;
        return isNotCurrentTask && dependenciesMet && fitsInCycle;
    });
    return result;
}
