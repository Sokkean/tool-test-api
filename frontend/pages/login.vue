<template>
  <div class="flex min-h-screen items-center justify-center relative overflow-hidden bg-slate-950">
    <!-- Decorative background elements -->
    <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px] pointer-events-none"></div>
    <div class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>
    
    <div class="relative z-10 w-full max-w-md p-8 bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">
      <div class="text-center mb-8">
        <h2 class="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent mb-2">
          {{ isLogin ? 'Welcome Back' : 'Create Account' }}
        </h2>
        <p class="text-slate-400 text-sm">Testing your APIs with style.</p>
      </div>

      <p v-if="error" class="mb-4 text-sm text-red-400 bg-red-400/10 p-3 rounded-lg border border-red-400/20 text-center">{{ error }}</p>
      
      <form @submit.prevent="handleSubmit" class="flex flex-col gap-4">
        <div v-if="!isLogin">
          <input v-model="name" type="text" placeholder="Name" required 
            class="w-full bg-slate-800/50 border border-slate-700 text-slate-200 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-500" />
        </div>
        <div>
          <input v-model="email" type="email" placeholder="Email" required 
            class="w-full bg-slate-800/50 border border-slate-700 text-slate-200 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-500" />
        </div>
        <div>
          <input v-model="password" type="password" placeholder="Password" required 
            class="w-full bg-slate-800/50 border border-slate-700 text-slate-200 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-500" />
        </div>
        <button type="submit" :disabled="loading" 
          class="w-full mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium py-3 rounded-lg hover:from-blue-500 hover:to-indigo-500 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none shadow-lg shadow-blue-500/25">
          {{ loading ? 'Please wait...' : (isLogin ? 'Login' : 'Register') }}
        </button>
      </form>
      
      <div class="mt-6 text-center">
        <p class="text-sm text-slate-400 cursor-pointer hover:text-blue-400 transition-colors" @click="isLogin = !isLogin">
          {{ isLogin ? "Don't have an account? Register" : 'Already have an account? Login' }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../features/auth/stores/auth'
import { useRouter } from 'vue-router'

definePageMeta({ layout: false })

const isLogin = ref(true)
const name = ref('')
const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

const authStore = useAuthStore()
const router = useRouter()
const config = useRuntimeConfig()

async function handleSubmit() {
  loading.value = true
  error.value = ''
  
  const endpoint = isLogin.value ? '/auth/login' : '/auth/register'
  const payload = isLogin.value ? { email: email.value, password: password.value } : { name: name.value, email: email.value, password: password.value }
  
  try {
    const res = await fetch(`${config.public.apiBaseUrl}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    
    let data;
    const text = await res.text();
    try {
      data = JSON.parse(text);
    } catch(e) {
      // Response was not JSON
    }

    if (!res.ok) {
      if (data) {
        if (data.message) {
          error.value = Array.isArray(data.message) ? data.message.join(', ') : data.message;
        } else if (data.error) {
          error.value = data.error;
        } else {
          error.value = text || 'Authentication failed';
        }
      } else {
        error.value = text || 'Authentication failed';
      }
      return
    }
    
    authStore.setAuth(data.user, data.access_token)
    router.push('/')
  } catch (e) {
    error.value = e.message || 'Failed to connect to server'
  } finally {
    loading.value = false
  }
}
</script>


