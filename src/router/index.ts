import { createRouter, createWebHistory } from "vue-router";
import Home from "../views/Home.vue";
import TaskInput from "../components/TaskInput.vue";

const routes = [
  { path: "/", name: "Home", component: Home },
  { path: "/tasks", name: "Tasks", component: TaskInput },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
