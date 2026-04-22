<template>
  <div class="page-content">
    <h1>🛠️ 設備管理中心</h1>

    <div class="management-layout">
      <div class="add-device-panel">
        <h3>新增設備</h3>
        <div class="form-group">
          <label>設備名稱</label>
          <input
            v-model="newDevice.name"
            type="text"
            class="form-input"
            placeholder="輸入設備名稱"
          />
        </div>
        <div class="form-group">
          <label>所屬房間</label>
          <select v-model="newDevice.room" class="form-select">
            <option value="">選擇房間</option>
            <option v-for="room in rooms" :key="room" :value="room">{{ room }}</option>
          </select>
        </div>
        <div class="form-group">
          <label>用電功率 (W)</label>
          <input
            v-model.number="newDevice.power"
            type="number"
            class="form-input"
            placeholder="輸入用電功率"
          />
        </div>
        <button @click="addDevice" class="search-btn" :disabled="!canAdd">
          新增設備
        </button>
      </div>

      <div class="search-panel">
        <h3>搜尋設備</h3>
        <input
          v-model="searchQuery"
          type="text"
          class="form-input"
          placeholder="搜尋設備名稱..."
        />
      </div>
    </div>

    <div class="device-list-section">
      <h3>設備列表 ({{ filteredDevices.length }})</h3>
      <div class="device-list">
        <div
          v-for="device in filteredDevices"
          :key="device.id"
          class="device-card"
        >
          <div class="device-info">
            <div class="device-name">{{ device.name }}</div>
            <div class="device-room">📍 {{ device.room }}</div>
          </div>
          <div class="device-power">{{ device.power }}W</div>
          <button @click="deleteDevice(device.id)" class="delete-btn">🗑️</button>
        </div>
        <div v-if="filteredDevices.length === 0" class="empty-message">
          暫無設備資料
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import deviceApi from '../services/api'

const devices = ref([])
const rooms = ref(['客廳', '主臥', '次臥', '廁所', '廚房'])
const searchQuery = ref('')
const newDevice = ref({
  name: '',
  room: '',
  power: 0
})

const canAdd = computed(() =>
  newDevice.value.name.trim() !== '' &&
  newDevice.value.room !== '' &&
  newDevice.value.power > 0
)

const filteredDevices = computed(() => {
  if (!searchQuery.value) return devices.value
  const query = searchQuery.value.toLowerCase()
  return devices.value.filter(d =>
    d.name.toLowerCase().includes(query) ||
    d.room.toLowerCase().includes(query)
  )
})

const loadDevices = async () => {
  try {
    devices.value = await deviceApi.getAll()
  } catch (err) {
    console.error('載入設備失敗:', err)
  }
}

const addDevice = async () => {
  try {
    await deviceApi.add(newDevice.value)
    newDevice.value = { name: '', room: '', power: 0 }
    await loadDevices()
  } catch (err) {
    alert('新增失敗: ' + err.message)
  }
}

const deleteDevice = async (id) => {
  if (!confirm('確定要刪除此設備嗎？')) return
  try {
    await deviceApi.delete(id)
    await loadDevices()
  } catch (err) {
    alert('刪除失敗: ' + err.message)
  }
}

onMounted(() => {
  loadDevices()
})
</script>

<style scoped>
.management-layout {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.add-device-panel,
.search-panel {
  flex: 1;
  padding: 20px;
  border-radius: 10px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  color: #aaa;
}

.form-input,
.form-select {
  width: 100%;
  padding: 10px;
  background: #1a1a1a;
  border: 1px solid #00ff99;
  color: white;
  border-radius: 5px;
}

.form-select {
  cursor: pointer;
}

.device-list-section {
  margin-top: 20px;
}

.device-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.device-card {
  display: flex;
  align-items: center;
  padding: 15px 20px;
  background: #333;
  border-radius: 10px;
}

.device-info {
  flex: 1;
}

.device-name {
  font-size: 1.1rem;
  font-weight: bold;
  color: white;
}

.device-room {
  color: #aaa;
  font-size: 0.9rem;
  margin-top: 3px;
}

.device-power {
  color: #00ff99;
  font-weight: bold;
  margin-right: 15px;
}

.delete-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 5px;
}

.delete-btn:hover {
  transform: scale(1.2);
}

.empty-message {
  text-align: center;
  color: #aaa;
  padding: 40px;
}

.search-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>