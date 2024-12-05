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
    const maxTimeTasks: Record<string, string[]> = {}; // Diccionario para tareas con mayor tiempo
    const taskSelections: Record<string, string | null> = {}; // Diccionario para tarea seleccionada

    // Identificar tareas iniciales (sin precedencia) y priorizarlas
    const initialTasks = remainingTasks.filter((task) => task.precedence.length === 0);
    const nonInitialTasks = remainingTasks.filter((task) => task.precedence.length > 0);

    initialTasks.sort((a, b) => b.time - a.time);
    nonInitialTasks.sort((a, b) => b.time - a.time);

    let taskQueue = [...initialTasks, ...nonInitialTasks];

    while (taskQueue.length > 0) {
        let taskAdded = false;

        for (let i = 0; i < taskQueue.length; i++) {
            const task = taskQueue[i];

            const dependenciesMet = task.precedence.every((precedingTaskName) =>
                completedTasks.includes(precedingTaskName)
            );

            if (dependenciesMet && currentStation.totalTime + task.time <= cycleTime) {
                currentStation.tasks.push(task);
                currentStation.totalTime += task.time;

                completedTasks.push(task.name);

                const factibleTasks = getFactibleTasks(
                    task,
                    taskQueue,
                    cycleTime,
                    currentStation.totalTime,
                    completedTasks
                );

                taskFactibles[task.name] = factibleTasks.map((t) => t.name);

                // Identificar tareas con mayor tiempo
                const maxTime = Math.max(...factibleTasks.map((t) => t.time), 0);
                maxTimeTasks[task.name] = factibleTasks
                    .filter((t) => t.time === maxTime)
                    .map((t) => t.name);

                const selectedTask =
                    factibleTasks.length > 0
                        ? factibleTasks.reduce((max, t) =>
                            t.time > max.time ? t : max
                        ).name
                        : null;

                taskSelections[task.name] = selectedTask;

                taskQueue.splice(i, 1);
                taskAdded = true;
                break;
            }
        }

        if (!taskAdded) {
            stations.push(currentStation);
            currentStation = { id: stations.length + 1, tasks: [], totalTime: 0 };
        }
    }

    if (currentStation.tasks.length > 0) {
        stations.push(currentStation);
    }

    // Agregar factibles y tareas con mayor tiempo como propiedades adicionales
    stations.forEach((station) => {
        station.tasks = station.tasks.map((task) => ({
            ...task,
            factibles: taskFactibles[task.name] || [],
            maxTimeTasks: maxTimeTasks[task.name] || [],
            selectedTask: taskSelections[task.name] || "-",
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
