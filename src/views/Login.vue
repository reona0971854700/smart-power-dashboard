<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-header">
        <h1>⚡ SmartPower</h1>
        <p>智慧電力調度系統</p>
      </div>

      <div v-if="currentStep === 'login'" class="login-form-container">
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
          <button type="button" class="forgot-btn" @click="startForgotPassword">
            忘記密碼？
          </button>
        </form>
      </div>

      <div v-if="currentStep === 'forgot-username'" class="login-form-container">
        <form @submit.prevent="handleForgotUsername" class="login-form">
          <div class="step-title">輸入帳號</div>
          <div class="form-group">
            <label>帳號</label>
            <input
              v-model="forgotUsername"
              type="text"
              class="form-input"
              placeholder="請輸入您要尋回的帳號"
              required
            />
          </div>
          <div v-if="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>
          <div v-if="successMessage" class="success-message">
            {{ successMessage }}
          </div>
          <button type="submit" class="login-btn" :disabled="loading">
            {{ loading ? '處理中...' : '下一步' }}
          </button>
          <button type="button" class="back-btn" @click="goBack">
            返回登入
          </button>
        </form>
      </div>

      <div v-if="currentStep === 'security-questions'" class="login-form-container">
        <form @submit.prevent="handleVerifySecurity" class="login-form">
          <div class="step-title">回答安全問題</div>
          <p class="step-desc">請回答以下 3 個問題（答對 1 題即可通過）</p>
          <div class="form-group">
            <label>{{ securityQuestions[0] }}</label>
            <input
              v-model="securityAnswers[0]"
              type="text"
              class="form-input"
              placeholder="請輸入答案"
              required
            />
          </div>
          <div class="form-group">
            <label>{{ securityQuestions[1] }}</label>
            <input
              v-model="securityAnswers[1]"
              type="text"
              class="form-input"
              placeholder="請輸入答案"
              required
            />
          </div>
          <div class="form-group">
            <label>{{ securityQuestions[2] }}</label>
            <input
              v-model="securityAnswers[2]"
              type="text"
              class="form-input"
              placeholder="請輸入答案"
              required
            />
          </div>
          <div v-if="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>
          <button type="submit" class="login-btn" :disabled="loading">
            {{ loading ? '驗證中...' : '驗證答案' }}
          </button>
          <button type="button" class="back-btn" @click="goBack">
            返回登入
          </button>
        </form>
      </div>

      <div v-if="currentStep === 'reset-password'" class="login-form-container">
        <form @submit.prevent="handleResetPassword" class="login-form">
          <div class="step-title">設定新密碼</div>
          <div class="form-group">
            <label>新密碼</label>
            <input
              v-model="newPassword"
              type="password"
              class="form-input"
              placeholder="請輸入新密碼"
              required
            />
          </div>
          <div class="form-group">
            <label>確認新密碼</label>
            <input
              v-model="confirmPassword"
              type="password"
              class="form-input"
              placeholder="請再次輸入新密碼"
              required
            />
          </div>
          <div v-if="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>
          <div v-if="successMessage" class="success-message">
            {{ successMessage }}
          </div>
          <button type="submit" class="login-btn" :disabled="loading">
            {{ loading ? '重置中...' : '重置密碼' }}
          </button>
          <button type="button" class="back-btn" @click="goBack">
            返回登入
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import authService from '../services/auth'

const router = useRouter()

const currentStep = ref('login')
const username = ref('')
const password = ref('')
const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const forgotUsername = ref('')
const securityQuestions = ref(['', '', ''])
const securityAnswers = ref(['', '', ''])
const newPassword = ref('')
const confirmPassword = ref('')

const handleLogin = async () => {
  errorMessage.value = ''
  successMessage.value = ''
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

const startForgotPassword = () => {
  currentStep.value = 'forgot-username'
  errorMessage.value = ''
  successMessage.value = ''
  forgotUsername.value = ''
  username.value = ''
  password.value = ''
}

const handleForgotUsername = async () => {
  errorMessage.value = ''
  successMessage.value = ''
  loading.value = true

  try {
    const result = await authService.getSecurityQuestions(forgotUsername.value)
    if (result.success) {
      securityQuestions.value = result.questions
      currentStep.value = 'security-questions'
    } else {
      errorMessage.value = result.message || '無法取得安全問題'
    }
  } catch (error) {
    errorMessage.value = error.message || '請求失敗'
  } finally {
    loading.value = false
  }
}

const handleVerifySecurity = async () => {
  errorMessage.value = ''
  successMessage.value = ''
  loading.value = true

  try {
    const result = await authService.verifySecurityQuestions(
      forgotUsername.value,
      securityAnswers.value
    )
    if (result.success) {
      currentStep.value = 'reset-password'
    } else {
      errorMessage.value = result.message || '安全問題答案錯誤'
    }
  } catch (error) {
    errorMessage.value = error.message || '驗證失敗'
  } finally {
    loading.value = false
  }
}

const handleResetPassword = async () => {
  errorMessage.value = ''
  successMessage.value = ''

  if (newPassword.value !== confirmPassword.value) {
    errorMessage.value = '新密碼與確認密碼不一致'
    return
  }

  if (newPassword.value.length < 1) {
    errorMessage.value = '請輸入新密碼'
    return
  }

  loading.value = true

  try {
    const result = await authService.resetPassword(forgotUsername.value, newPassword.value)
    if (result.success) {
      successMessage.value = '密碼重置成功，請使用新密碼登入'
      setTimeout(() => {
        goBack()
      }, 2000)
    } else {
      errorMessage.value = result.message || '密碼重置失敗'
    }
  } catch (error) {
    errorMessage.value = error.message || '重置失敗'
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  currentStep.value = 'login'
  errorMessage.value = ''
  successMessage.value = ''
  forgotUsername.value = ''
  securityQuestions.value = ['', '', '']
  securityAnswers.value = ['', '', '']
  newPassword.value = ''
  confirmPassword.value = ''
  username.value = ''
  password.value = ''
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

.login-form-container {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.step-title {
  color: #00ff99;
  font-size: 1.2rem;
  text-align: center;
  margin-bottom: 20px;
  font-weight: bold;
}

.step-desc {
  color: #aaa;
  font-size: 0.85rem;
  text-align: center;
  margin-bottom: 20px;
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

.success-message {
  color: #00ff99;
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

.forgot-btn {
  width: 100%;
  padding: 12px;
  background: none;
  color: #00ff99;
  border: 1px solid #00ff99;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
  margin-top: 15px;
}

.forgot-btn:hover {
  background: rgba(0, 255, 153, 0.1);
}

.back-btn {
  width: 100%;
  padding: 12px;
  background: none;
  color: #aaa;
  border: 1px solid #444;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
  margin-top: 10px;
}

.back-btn:hover {
  color: white;
  border-color: #666;
}
</style>