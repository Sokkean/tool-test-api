import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(null)
  const router = useRouter()

  function setAuth(userData: any, authToken: string) {
    user.value = userData
    token.value = authToken
    if (process.client) {
      localStorage.setItem('token', authToken)
      localStorage.setItem('user', JSON.stringify(userData))
    }
  }

  function logout() {
    user.value = null
    token.value = null
    if (process.client) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
    router.push('/login')
  }

  function loadAuth() {
    if (process.client) {
      const storedToken = localStorage.getItem('token')
      const storedUser = localStorage.getItem('user')
      if (storedToken && storedUser) {
        token.value = storedToken
        user.value = JSON.parse(storedUser)
      } else {
        router.push('/login')
      }
    }
  }

  return { user, token, setAuth, logout, loadAuth }
})
