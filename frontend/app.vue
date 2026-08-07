<template>
  <div class="min-h-screen text-slate-200 font-sans selection:bg-blue-500/30 overflow-hidden transition-colors duration-300 relative">
    <!-- Anime Background Layer -->
    <div v-if="actualTheme === 'anime'" class="absolute inset-0 z-0">
      <div class="absolute inset-0 bg-cover bg-center transition-all duration-700" :style="{ backgroundImage: `url(${bgImageUrl})` }"></div>
    </div>
    <!-- Default Background -->
    <div v-else class="absolute inset-0 z-0 bg-slate-950 transition-colors duration-300"></div>
    
    <!-- Main Content wrapper -->
    <div class="relative z-10 h-screen w-full flex flex-col">
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </div>
  </div>
</template>

<script setup>
import { onMounted, watch, ref } from 'vue'
import { useState, useHead } from '#app'

const theme = useState('theme', () => 'system')
const actualTheme = useState('actualTheme', () => 'dark')
const bgImageUrl = useState('bgImageUrl', () => 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=2560&auto=format&fit=crop')
const themeTintColor = useState('themeTintColor', () => '#a855f7')

const slate = {
  50: {r: 248, g: 250, b: 252},
  100: {r: 241, g: 245, b: 249},
  200: {r: 226, g: 232, b: 240},
  300: {r: 203, g: 213, b: 225},
  400: {r: 148, g: 163, b: 184},
  500: {r: 100, g: 116, b: 139},
  600: {r: 71, g: 85, b: 105},
  700: {r: 51, g: 65, b: 85},
  800: {r: 30, g: 41, b: 59},
  900: {r: 15, g: 23, b: 42},
  950: {r: 2, g: 6, b: 23}
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : null;
}

const applyCustomTint = () => {
  if (actualTheme.value !== 'anime') {
    removeCustomTint()
    return
  }
  
  const tint = hexToRgb(themeTintColor.value);
  if (!tint) return;
  
  const root = document.documentElement;
  for (const [weight, rgb] of Object.entries(slate)) {
    const intensity = 0.25;
    const currentIntensity = parseInt(weight) < 500 ? intensity * 0.4 : intensity;
    const r = Math.round(rgb.r * (1 - currentIntensity) + tint.r * currentIntensity);
    const g = Math.round(rgb.g * (1 - currentIntensity) + tint.g * currentIntensity);
    const b = Math.round(rgb.b * (1 - currentIntensity) + tint.b * currentIntensity);
    root.style.setProperty(`--theme-${weight}`, `${r} ${g} ${b}`);
  }
}

const removeCustomTint = () => {
  const root = document.documentElement;
  for (const weight of [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]) {
    root.style.removeProperty(`--theme-${weight}`);
  }
}

const updateActualTheme = () => {
  if (theme.value === 'system') {
    actualTheme.value = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  } else {
    actualTheme.value = theme.value
  }
  if (process.client) {
    applyCustomTint()
  }
}

useHead({
  htmlAttrs: {
    'data-theme': actualTheme
  }
})

onMounted(() => {
  const saved = localStorage.getItem('app-theme')
  if (saved) {
    theme.value = saved
  }
  const savedBg = localStorage.getItem('app-bg-image')
  if (savedBg) {
    bgImageUrl.value = savedBg
  }
  const savedTint = localStorage.getItem('app-theme-tint')
  if (savedTint) {
    themeTintColor.value = savedTint
  }
  updateActualTheme()
  
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', updateActualTheme)
  }
})

watch(theme, (newTheme) => {
  localStorage.setItem('app-theme', newTheme)
  updateActualTheme()
})

watch(bgImageUrl, (newUrl) => {
  localStorage.setItem('app-bg-image', newUrl)
})

watch(themeTintColor, (newTint) => {
  localStorage.setItem('app-theme-tint', newTint)
  applyCustomTint()
})
</script>
