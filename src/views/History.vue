<template>
  <div class="page-content">
    <h1>📊 用電歷史數據</h1>
    <div class="history-layout">
      <div class="search-panel card">
        <h3>選擇查詢日期</h3>
        <input
          type="date"
          id="history-date-picker"
          class="date-input"
          v-model="selectedDate"
          :max="maxDate"
        />
        <button @click="queryHistory" class="search-btn">查詢數據</button>
        <hr style="border: 0.5px solid #444; margin: 20px 0;">
        <p style="font-size: 0.9rem; color: #aaa;">* 可查詢一年內所有的已登記設備之用電總量</p>
      </div>
      <div class="chart-panel card">
        <h3 id="history-title">{{ chartTitle }}</h3>
        <div ref="chartRef" id="history-chart" style="width: 100%; height: 500px;"></div>
      </div>
    </div>

    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>{{ selectedRoom.name }} - 詳細用電</h2>
          <button class="modal-close" @click="closeModal">&times;</button>
        </div>
        <div class="modal-body">
          <div class="room-total">
            <span class="room-label">總用電量</span>
            <span class="room-value">{{ selectedRoom.total }} kWh</span>
          </div>
          <div class="device-list">
            <div class="device-item" v-for="(device, index) in selectedRoom.devices" :key="index">
              <div class="device-rank">{{ index + 1 }}</div>
              <div class="device-info">
                <div class="device-name">{{ device.name }}</div>
                <div class="device-bar-container">
                  <div class="device-bar" :style="{ width: device.percent + '%' }"></div>
                </div>
              </div>
              <div class="device-stats">
                <div class="device-value">{{ device.value }} kWh</div>
                <div class="device-percent">{{ device.percent }}%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import deviceApi from '../services/api'

const chartRef = ref(null)
let chartInstance = null

const today = new Date()
const oneYearAgo = new Date()
oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)

const maxDate = computed(() => {
  const y = today.getFullYear()
  const m = String(today.getMonth() + 1).padStart(2, '0')
  const d = String(today.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
})

const selectedDate = ref('')
const chartTitle = ref('請選擇日期後查詢')
const showModal = ref(false)
const selectedRoom = ref({ name: '', total: 0, devices: [] })
const devices = ref([])

const groupDevicesByRoom = (deviceList) => {
  const roomMap = {}
  deviceList.forEach(device => {
    const room = device.room || '未分類'
    if (!roomMap[room]) {
      roomMap[room] = []
    }
    roomMap[room].push({
      name: device.name,
      value: Math.floor(device.power * (0.8 + Math.random() * 0.4))
    })
  })
  return Object.keys(roomMap).map(roomName => ({
    name: roomName,
    value: roomMap[roomName].reduce((sum, d) => sum + d.value, 0),
    children: roomMap[roomName]
  }))
}

const loadDevices = async () => {
  try {
    devices.value = await deviceApi.getAll()
  } catch (err) {
    console.error('載入設備失敗:', err)
  }
}

const queryHistory = async () => {
  if (!selectedDate.value) {
    alert('請選擇日期')
    return
  }

  const selectedDateObj = new Date(selectedDate.value)

  if (selectedDateObj < oneYearAgo) {
    alert('只能查詢一年內的資料')
    return
  }

  if (selectedDateObj > today) {
    alert('不能選擇未來的日期')
    return
  }

  await loadDevices()
  const data = groupDevicesByRoom(devices.value)
  const total = data.reduce((sum, room) => sum + room.value, 0)

  chartTitle.value = `${selectedDate.value} 各空間用電佔比`

  const colors = {
    '客廳': '#00ff99',
    '主臥': '#00ccff',
    '次臥': '#ff9900',
    '廁所': '#ff6b6b',
    '廚房': '#cc99ff'
  }

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} kWh ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      textStyle: { color: '#fff' }
    },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['50%', '50%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 10,
        borderColor: '#1a1a1a',
        borderWidth: 2
      },
      label: {
        show: true,
        formatter: '{b}\n{d}%',
        color: '#fff',
        fontSize: 13
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 16,
          fontWeight: 'bold'
        }
      },
      data: data.map(room => ({
        name: room.name,
        value: room.value,
        itemStyle: {
          color: colors[room.name] || '#00ff99'
        }
      }))
    }]
  }

  chartInstance.setOption(option)
}

const initChart = () => {
  chartInstance = echarts.init(chartRef.value, 'dark')

  chartInstance.on('click', function(params) {
    const roomName = params.data.name
    const roomDevicesList = devices.value.filter(d => d.room === roomName)

    if (roomDevicesList.length > 0) {
      const totalPower = roomDevicesList.reduce((sum, d) => sum + (d.power || 0), 0)

      const mappedDevices = roomDevicesList
        .map(d => ({
          name: d.name,
          value: d.power || 0,
          percent: totalPower > 0 ? (((d.power || 0) / totalPower) * 100).toFixed(1) : 0
        }))
        .sort((a, b) => b.value - a.value)

      selectedRoom.value = {
        name: roomName,
        total: params.data.value,
        devices: mappedDevices
      }
      showModal.value = true
    }
  })
}

const closeModal = () => {
  showModal.value = false
}

onMounted(() => {
  initChart()
})

onUnmounted(() => {
  if (chartInstance) {
    chartInstance.dispose()
  }
})
</script>

<style scoped>
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
  max-width: 500px;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
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
  font-size: 1.4rem;
}

.modal-close {
  background: none;
  border: none;
  color: #fff;
  font-size: 2rem;
  cursor: pointer;
  line-height: 1;
  padding: 0;
}

.modal-close:hover {
  color: #00ff99;
}

.modal-body {
  padding: 25px;
  max-height: 60vh;
  overflow-y: auto;
}

.room-total {
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.room-label {
  color: #aaa;
  font-size: 1rem;
}

.room-value {
  color: #00ff99;
  font-size: 1.8rem;
  font-weight: bold;
}

.device-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.device-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 12px;
  background: #333;
  border-radius: 8px;
}

.device-rank {
  width: 28px;
  height: 28px;
  background: #00ff99;
  color: #1a1a1a;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  flex-shrink: 0;
}

.device-info {
  flex: 1;
}

.device-name {
  color: #fff;
  font-weight: 500;
  margin-bottom: 6px;
}

.device-bar-container {
  height: 8px;
  background: #1a1a1a;
  border-radius: 4px;
  overflow: hidden;
}

.device-bar {
  height: 100%;
  background: linear-gradient(90deg, #00ff99, #00cc7a);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.device-stats {
  text-align: right;
  min-width: 80px;
}

.device-value {
  color: #fff;
  font-weight: bold;
}

.device-percent {
  color: #00ff99;
  font-size: 0.9rem;
}
</style>