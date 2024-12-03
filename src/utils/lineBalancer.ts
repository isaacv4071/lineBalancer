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

    while (remainingTasks.length > 0) {
        // Ordenar las tareas por tiempo descendente (tiempo más largo primero)
        remainingTasks.sort((a, b) => b.time - a.time);

        let taskAdded = false; // Bandera para verificar si se asignó una tarea

        for (let i = 0; i < remainingTasks.length; i++) {
            const task = remainingTasks[i];

            // Verificar si las dependencias están cumplidas
            const dependenciesMet = task.precedence.every((precedingTaskName) =>
                currentStation.tasks.some((t) => t.name === precedingTaskName) ||
                stations.some((station) =>
                    station.tasks.some((t) => t.name === precedingTaskName)
                )
            );

            // Si las dependencias están cumplidas y cabe en la estación actual
            if (dependenciesMet && currentStation.totalTime + task.time <= cycleTime) {
                currentStation.tasks.push(task);
                currentStation.totalTime += task.time;
                remainingTasks.splice(i, 1); // Eliminar la tarea asignada
                taskAdded = true;
                break; // Salir del bucle para evaluar nuevas tareas
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

    return stations;
}
