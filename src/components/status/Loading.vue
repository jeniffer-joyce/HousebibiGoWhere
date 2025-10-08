<template>
  <div class="loader">
    <span class="dot" v-for="n in 3" :key="n" :style="{ animationDelay: `${n * 0.2}s` }"></span>
  </div>
</template>

<script setup>
// No script logic needed
</script>

<style scoped>
.loader {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  height: 4rem;
}

.dot {
  width: 10px;
  height: 10px;
  background-color: #333;
  border-radius: 50%;
  animation: bounce 0.6s infinite ease-in-out;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}
</style>
