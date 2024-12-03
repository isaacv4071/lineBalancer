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
          <router-link to="/" class="navbar-item">Inicio</router-link>
          <router-link to="/tasks" class="navbar-item">Tareas</router-link>
        </div>
      </div>
    </nav>

    <!-- Content -->
    <router-view />
</template>

<script lang="ts">
export default {
  name: "App",
};
</script>
