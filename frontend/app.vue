<template>
  <div class="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-blue-500/30 overflow-hidden transition-colors duration-300">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup>
import { onMounted, watch } from 'vue'
import { useState, useHead } from '#app'

const theme = useState('theme', () => 'dark')

useHead({
  htmlAttrs: {
    'data-theme': theme
  }
})

onMounted(() => {
  const saved = localStorage.getItem('app-theme')
  if (saved) {
    theme.value = saved
  }
})

watch(theme, (newTheme) => {
  localStorage.setItem('app-theme', newTheme)
})
</script>
