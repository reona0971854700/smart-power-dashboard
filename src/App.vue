<template>
  <div id="app">
    <nav class="navbar">
      <div class="nav-container">
        <div class="logo">⚡ SmartPower-Dashboard</div>
        <ul class="nav-links">
          <li><router-link to="/">儀錶板</router-link></li>
          <li><router-link to="/history">歷史數據</router-link></li>
          <li><router-link to="/management">設備管理</router-link></li>
          <li><a href="#">系統設定</a></li>
        </ul>
      </div>
    </nav>
    <main class="container">
      <router-view />
    </main>
  </div>
</template>

<script setup>
</script>

<style scoped>
</style>