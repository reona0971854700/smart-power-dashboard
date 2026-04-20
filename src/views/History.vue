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
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'

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

const queryHistory = () => {
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

  const rawData = [
    { name: '冷氣', value: Math.floor(Math.random() * 500) + 100 },
    { name: '冰箱', value: 240 },
    { name: '燈光', value: Math.floor(Math.random() * 100) + 20 },
    { name: '電動車', value: Math.floor(Math.random() * 600) },
    { name: '熱水器', value: Math.floor(Math.random() * 400) }
  ]

  const total = rawData.reduce((sum, item) => sum + item.value, 0)

  chartTitle.value = `${selectedDate.value} 設備用電佔比 (%)`

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
        formatter: '{b}: {d}%',
        color: '#fff'
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 16,
          fontWeight: 'bold'
        }
      },
      data: rawData.map(item => ({
        ...item,
        percent: ((item.value / total) * 100).toFixed(1)
      }))
    }]
  }

  chartInstance.setOption(option)
}

const initChart = () => {
  chartInstance = echarts.init(chartRef.value, 'dark')
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
</style>