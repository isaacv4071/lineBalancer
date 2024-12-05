<template>
    <section class="hero is-fullheight is-primary">
      <div class="hero-body">
        <div class="container has-text-centered">
          <h1 class="title is-1 has-text-white">📊 Line Balancer</h1>
          <p class="subtitle is-4 has-text-light">
            Optimiza líneas de ensamble con balanceo de tareas eficiente.
          </p>
          <router-link to="/lineBalancer/tasks" class="button is-info is-large">
            Comenzar
          </router-link>
        </div>
      </div>
    </section>
  </template>
  
  <script lang="ts">
  export default {
    name: "Home",
  };
  </script>
  
  <style scoped>
  /* Fullscreen hero styles */
  .hero-body {
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
  }
  </style>
  