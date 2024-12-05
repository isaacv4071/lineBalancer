<template>
  <!-- Navbar -->
  <nav class="navbar is-dark" role="navigation" aria-label="main navigation">
    <div class="navbar-brand">
      <router-link to="/" class="navbar-item has-text-weight-bold">
        📊 Line Balancer
      </router-link>
    </div>
    <div class="navbar-menu">
      <div class="navbar-end">
        <router-link to="/lineBalancer/" class="navbar-item">Inicio</router-link>
        <router-link to="/lineBalancer/tasks" class="navbar-item">Tareas</router-link>
      </div>
    </div>
  </nav>

  <!-- Content -->
  <router-view />
  <footer class="footer has-background-dark has-text-white-ter">
    <div class="content has-text-centered">
      <p class="has-text-weight-bold">Facultad de Ingeniería, Ingeniería de Sistemas</p>
      <p><strong>Integrantes:</strong> Jose Gonzalez, Isaac Arrieta</p>
      <p class="mt-4">Semestre 2024 II</p>
    </div>
  </footer>
</template>

<script lang="ts">
export default {
  name: "App",
};
</script>
<style scoped>
.footer {
  padding: 2rem 1.5rem;
  background-color: #242424;
  color: #ffffff;
}
</style>