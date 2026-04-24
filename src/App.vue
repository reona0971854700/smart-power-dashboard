<template>
  <div id="app">
    <nav class="navbar" v-if="authService.isLoggedIn()">
      <div class="nav-container">
        <div class="logo">⚡ SmartPower-Dashboard</div>
        <ul class="nav-links">
          <li><router-link to="/">儀錶板</router-link></li>
          <li><router-link to="/history">歷史數據</router-link></li>
          <li><router-link to="/management">設備管理</router-link></li>
          <li><a href="#" @click.prevent="showSettings = true">系統設定</a></li>
          <li><a href="#" @click.prevent="handleLogout" class="logout-link">登出 ({{ username }})</a></li>
        </ul>
      </div>
    </nav>
    <main class="container" :class="{ 'no-nav': !authService.isLoggedIn() }">
      <router-view />
    </main>

    <div v-if="showSettings" class="modal-overlay" @click="showSettings = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>系統設定</h2>
          <button class="modal-close" @click="showSettings = false">&times;</button>
        </div>
        <div class="modal-body">
          <h3>變更密碼</h3>
          <div class="form-group">
            <label>帳號</label>
            <input v-model="changePassword.username" type="text" class="form-input" disabled />
          </div>
          <div class="form-group">
            <label>舊密碼</label>
            <input v-model="changePassword.oldPassword" type="password" class="form-input" placeholder="請輸入舊密碼" />
          </div>
          <div class="form-group">
            <label>新密碼</label>
            <input v-model="changePassword.newPassword" type="password" class="form-input" placeholder="請輸入新密碼" />
          </div>
          <div class="form-group">
            <label>確認新密碼</label>
            <input v-model="changePassword.confirmPassword" type="password" class="form-input" placeholder="請再次輸入新密碼" />
          </div>
          <div v-if="passwordMessage" class="message" :class="{ error: passwordError }">
            {{ passwordMessage }}
          </div>
          <button @click="handleChangePassword" class="search-btn" style="width: 100%; margin-top: 15px;">
            變更密碼
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import authService from './services/auth'

const router = useRouter()
const showSettings = ref(false)
const username = ref('')
const passwordMessage = ref('')
const passwordError = ref(false)

const changePassword = ref({
  username: '',
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

onMounted(() => {
  username.value = authService.getUsername() || ''
  changePassword.value.username = username.value
})

const handleLogout = () => {
  authService.logout()
  router.push('/login')
}

const handleChangePassword = async () => {
  passwordMessage.value = ''
  passwordError.value = false

  if (!changePassword.value.oldPassword || !changePassword.value.newPassword) {
    passwordMessage.value = '請填寫所有欄位'
    passwordError.value = true
    return
  }

  if (changePassword.value.newPassword !== changePassword.value.confirmPassword) {
    passwordMessage.value = '新密碼與確認密碼不一致'
    passwordError.value = true
    return
  }

  try {
    const result = await authService.changePassword(
      changePassword.value.username,
      changePassword.value.oldPassword,
      changePassword.value.newPassword
    )
    
    if (result.success) {
      passwordMessage.value = '密碼修改成功，請重新登入'
      setTimeout(() => {
        handleLogout()
      }, 2000)
    } else {
      passwordMessage.value = result.message
      passwordError.value = true
    }
  } catch (error) {
    passwordMessage.value = '修改失敗'
    passwordError.value = true
  }
}
</script>

<style scoped>
.logout-link {
  color: #ff4d4d !important;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

.modal-content {
  background: #2a2a2a;
  border-radius: 15px;
  width: 90%;
  max-width: 400px;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 25px;
  background: #1a1a1a;
  border-bottom: 2px solid #00ff99;
}

.modal-header h2 {
  color: #00ff99;
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  color: #fff;
  font-size: 2rem;
  cursor: pointer;
}

.modal-close:hover {
  color: #00ff99;
}

.modal-body {
  padding: 25px;
}

.modal-body h3 {
  color: #00ff99;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  color: #aaa;
}

.form-input {
  width: 100%;
  padding: 10px;
  background: #1a1a1a;
  border: 1px solid #444;
  color: white;
  border-radius: 5px;
}

.form-input:focus {
  outline: none;
  border-color: #00ff99;
}

.message {
  margin-top: 15px;
  padding: 10px;
  border-radius: 5px;
  text-align: center;
  background: #1a1a1a;
  color: #00ff99;
}

.message.error {
  color: #ff4d4d;
}
</style>