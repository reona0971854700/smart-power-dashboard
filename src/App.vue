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
          <div class="settings-tabs">
            <button :class="{ active: settingsTab === 'password' }" @click="settingsTab = 'password'">變更密碼</button>
            <button :class="{ active: settingsTab === 'security' }" @click="settingsTab = 'security'">安全問題</button>
          </div>

          <div v-if="settingsTab === 'password'">
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

          <div v-if="settingsTab === 'security'">
            <h3>設定安全問題</h3>
            <p class="security-tip">請設定 3 個安全問題，忘記密碼時需回答這些問題</p>
            <div class="form-group">
              <label>問題 1</label>
              <input v-model="securityQuestions[0].question" type="text" class="form-input" placeholder="例如：媽媽的名字叫什麼？" />
            </div>
            <div class="form-group">
              <label>答案 1</label>
              <input v-model="securityQuestions[0].answer" type="text" class="form-input" placeholder="請輸入答案" />
            </div>
            <div class="form-group">
              <label>問題 2</label>
              <input v-model="securityQuestions[1].question" type="text" class="form-input" placeholder="例如：您最喜歡的食物是什麼？" />
            </div>
            <div class="form-group">
              <label>答案 2</label>
              <input v-model="securityQuestions[1].answer" type="text" class="form-input" placeholder="請輸入答案" />
            </div>
            <div class="form-group">
              <label>問題 3</label>
              <input v-model="securityQuestions[2].question" type="text" class="form-input" placeholder="例如：您就讀的國小名稱？" />
            </div>
            <div class="form-group">
              <label>答案 3</label>
              <input v-model="securityQuestions[2].answer" type="text" class="form-input" placeholder="請輸入答案" />
            </div>
            <div v-if="securityMessage" class="message" :class="{ error: securityError }">
              {{ securityMessage }}
            </div>
            <button @click="handleSaveSecurityQuestions" class="search-btn" style="width: 100%; margin-top: 15px;">
              儲存安全問題
            </button>
          </div>
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
const settingsTab = ref('password')
const username = ref('')
const passwordMessage = ref('')
const passwordError = ref(false)
const securityMessage = ref('')
const securityError = ref(false)

const changePassword = ref({
  username: '',
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const securityQuestions = ref([
  { question: '', answer: '' },
  { question: '', answer: '' },
  { question: '', answer: '' }
])

onMounted(async () => {
  username.value = authService.getUsername() || ''
  changePassword.value.username = username.value
  
  try {
    const result = await authService.getSecurityQuestions(username.value)
    if (result.success && result.questions) {
      securityQuestions.value = result.questions.map((q, i) => ({
        question: q || '',
        answer: ''
      }))
    }
  } catch (e) {
    console.log('無法取得安全問題')
  }
})

const handleLogout = () => {
  authService.logout()
  router.push('/login')
}

const handleSaveSecurityQuestions = async () => {
  securityMessage.value = ''
  securityError.value = false

  const hasQuestions = securityQuestions.value.some(q => q.question.trim() !== '')
  const hasAnswers = securityQuestions.value.every(q => q.answer.trim() !== '')

  if (!hasQuestions) {
    securityMessage.value = '請至少填寫一個安全問題'
    securityError.value = true
    return
  }

  if (!hasAnswers) {
    securityMessage.value = '請填寫所有問題的答案'
    securityError.value = true
    return
  }

  try {
    const result = await authService.setSecurityQuestions(
      username.value,
      securityQuestions.value.map(q => q.question),
      securityQuestions.value.map(q => q.answer)
    )

    if (result.success) {
      securityMessage.value = '安全問題設定成功'
      securityError.value = false
    } else {
      securityMessage.value = result.message
      securityError.value = true
    }
  } catch (error) {
    securityMessage.value = '設定失敗'
    securityError.value = true
  }
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

.settings-tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  border-bottom: 2px solid #444;
  padding-bottom: 10px;
}

.settings-tabs button {
  background: none;
  border: none;
  color: #aaa;
  font-size: 1rem;
  cursor: pointer;
  padding: 10px 15px;
  border-radius: 5px;
  transition: all 0.3s;
}

.settings-tabs button:hover {
  color: #fff;
  background: rgba(0, 255, 153, 0.1);
}

.settings-tabs button.active {
  color: #00ff99;
  background: rgba(0, 255, 153, 0.2);
  border-bottom: 2px solid #00ff99;
}

.security-tip {
  color: #aaa;
  font-size: 0.9rem;
  margin-bottom: 15px;
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