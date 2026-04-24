<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-header">
        <h1>⚡ SmartPower</h1>
        <p>智慧電力調度系統</p>
      </div>
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label>帳號</label>
          <input
            v-model="username"
            type="text"
            class="form-input"
            placeholder="請輸入帳號"
            required
          />
        </div>
        <div class="form-group">
          <label>密碼</label>
          <input
            v-model="password"
            type="password"
            class="form-input"
            placeholder="請輸入密碼"
            required
          />
        </div>
        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>
        <button type="submit" class="login-btn" :disabled="loading">
          {{ loading ? '登入中...' : '登入' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import authService from '../services/auth'

const router = useRouter()

const username = ref('')
const password = ref('')
const loading = ref(false)
const errorMessage = ref('')

const handleLogin = async () => {
  errorMessage.value = ''
  loading.value = true

  try {
    const result = await authService.login(username.value, password.value)
    if (result.success) {
      localStorage.setItem('isLoggedIn', 'true')
      localStorage.setItem('username', username.value)
      router.push('/')
    }
  } catch (error) {
    errorMessage.value = error.message || '登入失敗'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%);
}

.login-card {
  background: #2a2a2a;
  padding: 40px;
  border-radius: 15px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-header h1 {
  color: #00ff99;
  font-size: 2rem;
  margin-bottom: 10px;
}

.login-header p {
  color: #aaa;
  font-size: 0.9rem;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #aaa;
}

.form-input {
  width: 100%;
  padding: 12px;
  background: #1a1a1a;
  border: 1px solid #444;
  color: white;
  border-radius: 8px;
  font-size: 1rem;
}

.form-input:focus {
  outline: none;
  border-color: #00ff99;
}

.error-message {
  color: #ff4d4d;
  margin-bottom: 15px;
  text-align: center;
}

.login-btn {
  width: 100%;
  padding: 14px;
  background: #00ff99;
  color: #1a1a1a;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.3s;
}

.login-btn:hover:not(:disabled) {
  background: #00cc7a;
}

.login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>