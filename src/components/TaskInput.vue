<script lang="ts">
import { defineComponent, reactive, ref, computed } from "vue";
import { Task, Station, calculateCycleTime, balanceLine, calculateEfficiency } from "../utils/lineBalancer";
import AnimatedSimulation from "./AnimatedSimulation.vue";
import TaskChart from "./TaskChart.vue";

const EXAMPLE_TASKS: Task[] = [
    { name: "A", time: 50, precedence: [] },
    { name: "B", time: 20, precedence: ["A"] },
    { name: "C", time: 10, precedence: ["B"] },
    { name: "D", time: 60, precedence: [] },
    { name: "E", time: 10, precedence: ["D"] },
    { name: "F", time: 15, precedence: ["C"] },
    { name: "G", time: 12, precedence: ["C"] },
    { name: "H", time: 13, precedence: ["E"] },
    { name: "I", time: 10, precedence: ["E"] },
    { name: "J", time: 10, precedence: ["F", "G", "H", "I"] },
    { name: "K", time: 15, precedence: ["J"] },
];

export default defineComponent({
    name: "TaskInput",
    components: {
        AnimatedSimulation,
        TaskChart
    },
    setup() {
        const task = reactive<Task>({ name: "", time: 0, precedence: [] });
        const tasks = reactive<Task[]>([]);
        const stations = ref<Station[]>([]);
        const cycleTime = ref<number>(0);
        const completedTasks = ref<string[]>([]);
        const productionGoal = ref<number>(0);
        const totalAvailableTime = ref<number>(0);
        const triggerAnimation = ref(false);
        const showChart = ref(false);

        const totalAvailableTimeInSeconds = computed(() => totalAvailableTime.value * 60);

        const minStations = computed(() => {
            const totalTaskTime = tasks.reduce((sum, task) => sum + task.time, 0);
            return {
                unrounded: totalTaskTime / cycleTime.value,
                rounded: Math.ceil(totalTaskTime / cycleTime.value),
            };
        });

        const efficiency = computed(() =>
            stations.value.length > 0 && cycleTime.value > 0
                ? calculateEfficiency(stations.value, tasks, cycleTime.value)
                : 0
        );

        const addTask = () => {
            if (tasks.some((t) => t.name === task.name)) {
                alert(`La tarea ${task.name} ya existe.`);
                return;
            }

            // Verificar si `task.precedence` es una cadena y convertirla a un arreglo
            const precedenceArray = Array.isArray(task.precedence)
                ? task.precedence
                : task.precedence
                    ? task.precedence.split(",").map((p) => p.trim())
                    : [];

            // Validar si las precedencias existen en la lista de tareas
            if (!precedenceArray.every((p) => tasks.some((t) => t.name === p))) {
                alert("Una o más tareas de precedencia no existen.");
                return;
            }

            tasks.push({ ...task, precedence: precedenceArray });
            task.name = "";
            task.time = 0;
            task.precedence = [];
        };


        const removeTask = (index: number) => {
            tasks.splice(index, 1);
        };

        const loadExample = () => {
            tasks.splice(0, tasks.length, ...EXAMPLE_TASKS);
            productionGoal.value = 400; // Valor predeterminado del ejemplo
            totalAvailableTime.value = 480; // Valor predeterminado del ejemplo en minutos
        };

        const calculateStations = () => {
            cycleTime.value = calculateCycleTime(totalAvailableTimeInSeconds.value, productionGoal.value);
            stations.value = balanceLine(tasks, cycleTime.value);
            triggerAnimation.value = true;

            if (stations.value.length > 0) {
                showChart.value = true;
            }

            // Reiniciar trigger para permitir nuevas simulaciones
            setTimeout(() => {
                triggerAnimation.value = false;
            }, 100);
        };

        const efficiencyMessage = computed(() => {
            if (efficiency.value < 60) {
                return "Insatisfactoria";
            } else if (efficiency.value >= 60 && efficiency.value <= 90) {
                return "Satisfactoria";
            } else {
                return "Sobresaliente";
            }
        });


        return {
            task,
            tasks,
            addTask,
            removeTask, // Aquí estaba el problema: ahora está incluido
            calculateStations,
            cycleTime,
            stations,
            productionGoal,
            loadExample,
            completedTasks,
            minStations,
            efficiency,
            triggerAnimation,
            efficiencyMessage,
            totalAvailableTime,
            showChart
        };
    },
});
</script>

<template>
    <section class="section">
        <div class="container">
            <!-- Formulario para agregar tareas -->
            <div class="columns">
                <!-- Columna para agregar tarea -->
                <div class="column">
                    <div class="box">
                        <h2 class="title is-4 has-text-centered">Agregar Tarea</h2>
                        <form @submit.prevent="addTask">
                            <div class="field">
                                <label class="label">Nombre de la Tarea</label>
                                <div class="control">
                                    <input class="input is-primary" type="text" v-model="task.name" placeholder="Ej. A"
                                        required />
                                </div>
                            </div>
                            <div class="field">
                                <label class="label">Tiempo (segundos)</label>
                                <div class="control">
                                    <input class="input is-primary" type="number" v-model.number="task.time"
                                        placeholder="Ej. 50" min="1" required />
                                </div>
                            </div>
                            <div class="field">
                                <label class="label">Precedencia</label>
                                <div class="control">
                                    <input class="input is-primary" type="text" v-model="task.precedence"
                                        placeholder="Ej. B, C" />
                                </div>
                            </div>
                            <div class="field">
                                <button class="button is-success is-fullwidth">Agregar Tarea</button>
                            </div>
                        </form>
                        <div class="field mt-3">
                            <button class="button is-warning is-fullwidth" @click="loadExample">Cargar Ejemplo</button>
                        </div>
                    </div>
                </div>

                <!-- Columna para configuración -->
                <div class="column">
                    <div class="box">
                        <h2 class="title is-4 has-text-centered">Configuración</h2>
                        <form @submit.prevent="calculateStations">
                            <div class="field">
                                <label class="label">Meta de Producción</label>
                                <div class="control">
                                    <input class="input is-primary" type="number" v-model.number="productionGoal"
                                        min="1" />
                                </div>
                            </div>
                            <div class="field">
                                <label class="label">Tiempo Total Disponible (minutos)</label>
                                <div class="control">
                                    <input class="input is-primary" type="number" v-model.number="totalAvailableTime"
                                        min="1" />
                                </div>
                            </div>
                            <div class="field">
                                <button class="button is-success is-fullwidth">Actualizar Configuración</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>



            <!-- Tabla de tareas -->
            <div v-if="tasks.length > 0" class="box">
                <h2 class="title is-4 has-text-centered">Tareas Ingresadas</h2>
                <table class="table is-striped is-fullwidth">
                    <thead>
                        <tr>
                            <th>Tarea</th>
                            <th>Tiempo (s)</th>
                            <th>Precedencia</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(task, index) in tasks" :key="index">
                            <td>{{ task.name }}</td>
                            <td>{{ task.time }}</td>
                            <td>{{ task.precedence.length > 0 ? task.precedence.join(", ") : "Ninguna" }}</td>
                            <td><button @click="removeTask(index)" class="button is-danger is-small">Eliminar</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Simulación Animada -->
            <animated-simulation :stations="stations" :cycle-time="cycleTime" :trigger-animation="triggerAnimation" />

            <task-chart v-if="tasks && tasks.length > 0 && showChart" :tasks="tasks" />

            <!-- Tabla de resultados detallados -->
            <div v-if="stations.length > 0" class="box">
                <h2 class="title is-4 has-text-centered">Resultados del Balanceo</h2>
                <p><strong>Tiempo de Ciclo Ideal:</strong> {{ cycleTime }} segundos</p>
                <p>
                    <strong>Número Mínimo Teórico de Estaciones:</strong>
                    {{ minStations.rounded }} (sin redondear: {{ minStations.unrounded }})
                </p>
                <p><strong>Eficiencia:</strong> {{ efficiency.toFixed(2) }}%</p>
                <p>
                    <strong>Evaluación: </strong>
                    <span :class="{
                        'has-text-danger': efficiencyMessage === 'Insatisfactoria',
                        'has-text-warning': efficiencyMessage === 'Satisfactoria',
                        'has-text-success': efficiencyMessage === 'Sobresaliente',
                    }">
                        {{ efficiencyMessage }}
                    </span>
                </p>
                <table class="table is-striped is-fullwidth">
                    <thead>
                        <tr>
                            <th>Estación</th>
                            <th>Tarea</th>
                            <th>Tiempo Tarea (s)</th>
                            <th>Tiempo Restante</th>
                            <th>Tareas Factibles</th>
                            <th>Tarea con Mayor Tiempo</th>
                            <th>Selección</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="station in stations" :key="station.id">
                            <td>{{ station.id }}</td>
                            <td>
                                <ul>
                                    <li v-for="task in station.tasks" :key="task.name">{{ task.name }}</li>
                                </ul>
                            </td>
                            <td>
                                <ul>
                                    <li v-for="task in station.tasks" :key="task.name">{{ task.time }}</li>
                                </ul>
                            </td>
                            <td>
                                <ul>
                                    <li v-for="(task, index) in station.tasks" :key="task.name">
                                        {{ cycleTime - station.tasks.slice(0, index + 1).reduce((sum, t) => sum +
                                            t.time, 0) }}
                                    </li>
                                </ul>
                            </td>
                            <td>
                                <ul>
                                    <li v-for="task in station.tasks" :key="task.name">
                                        <span v-if="task.factibles && task.factibles.length > 0">
                                            {{ task.factibles.join(", ") }}
                                        </span>
                                        <span v-else>
                                            -
                                        </span>
                                    </li>
                                </ul>
                            </td>
                            <td> <!-- Nueva columna -->
                                <ul>
                                    <li v-for="task in station.tasks" :key="task.name">
                                        <span v-if="task.maxTimeTasks && task.maxTimeTasks.length > 0">
                                            {{ task.maxTimeTasks.join(", ") }}
                                        </span>
                                        <span v-else>
                                            -
                                        </span>
                                    </li>
                                </ul>
                            </td>
                            <td> <!-- Nueva columna -->
                                <ul>
                                    <li v-for="task in station.tasks" :key="task.name">
                                        {{ task.selectedTask }}
                                    </li>
                                </ul>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div class="field mt-5">
                <button class="button is-info is-fullwidth" @click="calculateStations">Calcular Balanceo</button>
            </div>
        </div>
    </section>
</template>

<style scoped>
.box {
    margin-top: 20px;
    padding: 2rem;
    border-radius: 10px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.table {
    margin-top: 20px;
}
</style>
