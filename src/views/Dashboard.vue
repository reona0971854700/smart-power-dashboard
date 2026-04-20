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

const chartRef = ref(null)
let chartInstance = null

const acPower = ref(0)
const fridgePower = ref(15)
const lightPower = ref(0)
const evPower = ref(0)
const currentLoad = ref(0)

const loadColor = computed(() => currentLoad.value > 80 ? '#ff4d4d' : '#00ff99')
const statusText = computed(() => currentLoad.value > 80 ? '⚠️ 負載過高' : '系統穩定進行中')

const updateData = () => {
  acPower.value = Math.floor(Math.random() * 40) + 10
  fridgePower.value = 15
  lightPower.value = Math.floor(Math.random() * 10) + 2
  evPower.value = Math.floor(Math.random() * 30)
  currentLoad.value = acPower.value + fridgePower.value + lightPower.value + evPower.value
}

const initChart = () => {
  chartInstance = echarts.init(chartRef.value, 'dark')
  updateChart()
}

const updateChart = () => {
  const option = {
    backgroundColor: 'transparent',
    xAxis: {
      type: 'category',
      data: ['冷氣', '冰箱', '燈光', '電動車充電樁', '總負載']
    },
    yAxis: {
      type: 'value',
      max: 120
    },
    series: [{
      data: [
        acPower.value,
        fridgePower.value,
        lightPower.value,
        evPower.value,
        currentLoad.value
      ],
      type: 'bar',
      itemStyle: {
        color: (params) => {
          if (params.dataIndex === 4) {
            return currentLoad.value > 80 ? '#ff4d4d' : '#ff9900'
          }
          return '#00ff99'
        }
      }
    }]
  }
  chartInstance.setOption(option)
}

let intervalId = null

onMounted(() => {
  initChart()
  updateData()
  updateChart()
  intervalId = setInterval(() => {
    updateData()
    updateChart()
  }, 60000)
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