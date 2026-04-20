<template> 
<div class="chart-container card"> 
    <h3 v-if="title">{{ title }}</h3> 
    <div ref="chartRef" :style="{ width: '100%', height: height }"></div> 
</div> 
</template> 

<script setup> import { ref, onMounted, watch } from 'vue'; // 引入 Vue 的功能工具

import * as echarts from 'echarts'; // 引入 ECharts 繪圖庫

// --- 定義組件可以接收的「參數」(Props) ---
const props = defineProps({ // 定義屬性
  title: String,             // 接收圖表標題（字串）
  chartData: Array,          // 接收圖表數據（陣列）
  height: {                  // 接收圖表高度
    type: String,            // 類型為字串
    default: '400px'         // 如果沒傳，預設為 400px
  }
}); // Props 定義結束

const chartRef = ref(null); // 建立一個引用，指向 HTML 裡的圖表 div
let myChart = null;         // 用來存放 ECharts 實例化後的物件

// --- 封裝繪圖邏輯 ---
const initChart = () => { // 定義畫圖函式
  if (myChart) { // 如果圖表已經存在
    myChart.dispose(); // 先銷毀舊的，避免記憶體洩漏
  } // 判斷結束
  
  myChart = echarts.init(chartRef.value, 'dark'); // 初始化圖表，使用深色主題
  
  const option = { // 定義 ECharts 配置
    backgroundColor: 'transparent', // 背景透明
    tooltip: { trigger: 'axis' },   // 滑鼠懸停提示
    xAxis: { // X 軸設定
      type: 'category', // 類別軸
      data: props.chartData.map(item => item.name) // 提取數據裡的名稱
    }, // X 軸結束
    yAxis: { type: 'value' }, // Y 軸設定
    series: [{ // 數據序列
      data: props.chartData.map(item => item.value), // 提取數據的值
      type: 'bar', // 柱狀圖
      color: '#00ff99' // 螢光綠
    }] // 序列結束
  }; // 配置結束
  
  myChart.setOption(option); // 將配置套用到圖表
}; // 函式結束

// --- 監控數據變化 ---
watch(() => props.chartData, () => { // 當外部傳進來的數據改變時
  initChart(); // 重新畫一次圖表
}, { deep: true }); // 深度監控陣列內部的變化

// --- 生命週期：掛載完成 ---
onMounted(() => { // 當網頁元件載入後
  initChart(); // 執行初始化繪圖
  window.addEventListener('resize', () => myChart.resize()); // 視窗縮放時自動調整圖表大小
}); // 鉤子結束
</script> 
<style scoped> .chart-container { background: #333; padding: 20px; border-radius: 10px; } /* 圖表卡片樣式 */
</style> 


### 這樣拆分後，你的 `History.vue` 會變得多簡單？
原本 `History.vue` 要寫幾百行，現在只需要呼叫 `PowerChart`：

```vue
<template>
  <div class="page-history">
    <div class="search-panel">...</div> 

    <PowerChart 
      :title="selectedDate + ' 耗電統計'" 
      :chartData="historyRecords" 
    />
  </div>
</template>

<script setup>
import PowerChart from '../components/PowerChart.vue'; // 引入小螢幕
const historyRecords = ref([...]); // 這裡放從 API 拿到的數據
</script>