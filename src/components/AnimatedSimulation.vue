<script lang="ts">
import { defineComponent, PropType, ref } from "vue";
import { Station } from "../utils/lineBalancer";

export default defineComponent({
    name: "AnimatedSimulation",
    props: {
        stations: {
            type: Array as PropType<Station[]>,
            required: true,
        },
        cycleTime: {
            type: Number,
            required: true,
        },
    },
    setup(props) {
        const animatedStations = ref<Station[]>([]);
        const animationSpeed = ref<number>(1000); // Velocidad en milisegundos

        const startAnimation = () => {
            animatedStations.value = [];
            let currentStationIndex = 0;

            const animateTask = () => {
                if (currentStationIndex < props.stations.length) {
                    animatedStations.value.push(props.stations[currentStationIndex]);
                    currentStationIndex++;

                    setTimeout(animateTask, animationSpeed.value);
                }
            };

            animateTask();
        };

        return {
            animatedStations,
            animationSpeed,
            startAnimation,
        };
    },
});
</script>

<template>
    <section class="section">
        <div class="container">
            <div v-if="animatedStations.length > 0" class="simulation">
                <h2 class="title is-4 has-text-centered">Simulación de Estaciones (Animada)</h2>
                <div class="stations">
                    <div v-for="station in animatedStations" :key="station.id" class="station-box">
                        <h3>Estación {{ station.id }}</h3>
                        <div class="tasks">
                            <div v-for="task in station.tasks" :key="task.name" class="task-box animated">
                                {{ task.name }} ({{ task.time }}s)
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<style scoped>
.simulation {
    margin-top: 20px;
}

.stations {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
}

.station-box {
    border: 2px solid #444c53;
    border-radius: 8px;
    padding: 10px;
    width: 300px;
    background-color: #f5f5f5;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.tasks {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
    margin-top: 10px;
}

.task-box {
    background-color: #c80684;
    color: #fff;
    padding: 5px;
    border-radius: 4px;
    text-align: center;
    font-size: 14px;
    opacity: 0;
    transform: translateY(-20px);
    animation: fadeIn 0.5s ease-out forwards;
}

@keyframes fadeIn {
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>
