<template>
  <div class="page-content">
    <h1>⚡ 智慧建築能源管理系統</h1>
    <div class="dashboard">
      <div class="card">
        <h3>目前即時總負載</h3>
        <div class="status" :style="{ color: loadColor }">{{ currentLoad }}%</div>
        <p>狀態 : {{ statusText }}</p>
      </div>
      <div class="card">
        <h3>各項設備即時功耗</h3>
        <div ref="chartRef" id="chart"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import * as echarts from 'echarts'
import deviceApi from '../services/api'

const chartRef = ref(null)
let chartInstance = null

const devices = ref([])
const currentLoad = ref(0)

const loadColor = computed(() => currentLoad.value > 80 ? '#ff4d4d' : '#00ff99')
const statusText = computed(() => currentLoad.value > 80 ? '⚠️ 負載過高' : '系統穩定進行中')

const calculateTotalPower = () => {
  const total = devices.value.reduce((sum, d) => sum + (d.power || 0), 0)
  currentLoad.value = Math.min(Math.round(total / 10), 100)
}

const updateChart = () => {
  const deviceNames = devices.value.map(d => d.name)
  const devicePowers = devices.value.map(d => d.power || 0)
  const total = devicePowers.reduce((sum, p) => sum + p, 0)

  const option = {
    backgroundColor: 'transparent',
    xAxis: {
      type: 'category',
      data: [...deviceNames, '總負載']
    },
    yAxis: {
      type: 'value'
    },
    series: [{
      data: [...devicePowers, total],
      type: 'bar',
      itemStyle: {
        color: (params) => {
          if (params.dataIndex === devicePowers.length) {
            return currentLoad.value > 80 ? '#ff4d4d' : '#ff9900'
          }
          return '#00ff99'
        }
      }
    }]
  }
  chartInstance.setOption(option)
}

const loadDevices = async () => {
  try {
    devices.value = await deviceApi.getAll()
    calculateTotalPower()
    updateChart()
  } catch (err) {
    console.error('載入設備失敗:', err)
  }
}

const initChart = () => {
  chartInstance = echarts.init(chartRef.value, 'dark')
}

let intervalId = null

onMounted(() => {
  initChart()
  loadDevices()
  intervalId = setInterval(() => {
    loadDevices()
  }, 30000)
})

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId)
  }
  if (chartInstance) {
    chartInstance.dispose()
  }
})
</script>

<style scoped>
</style>