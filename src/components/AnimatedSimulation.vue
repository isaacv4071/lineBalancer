<script lang="ts">
import { defineComponent, PropType, ref, watch } from "vue";
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
        triggerAnimation: {
            type: Boolean,
            required: true,
        },
    },
    setup(props) {
        const animatedStations = ref<Station[]>([]);
        const animationSpeed = ref<number>(1000);

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

        watch(
            () => props.triggerAnimation,
            (newVal) => {
                if (newVal) {
                    startAnimation();
                }
            }
        );

        return {
            animatedStations,
            animationSpeed,
        };
    },
});
</script>

<template>
    <section class="section">
        <div class="container">
            <h2 class="title is-4 has-text-centered">Simulación de Estaciones (Animada)</h2>
            <div class="stations">
                <div v-for="station in animatedStations" :key="station.id" class="station-box">
                    <h3>Estación {{ station.id }}</h3>
                    <div class="tasks">
                        <div v-for="task in station.tasks" :key="task.name" class="task-box">
                            {{ task.name }} ({{ task.time }}s)
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<style scoped>
.station-box {
    border: 2px solid #444c53;
    border-radius: 8px;
    padding: 10px;
    margin-bottom: 20px;
}

.tasks {
    display: flex;
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
}
</style>
