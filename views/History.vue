<template>
  <div class="page-history">
    <h1>📊 用電歷史數據</h1>
    <div class="history-layout">
      <div class="search-panel card">
        <h3>選擇查詢日期</h3>
        <input type="date" v-model="selectedDate" class="date-input">
        <button @click="queryHistory" class="search-btn">查詢數據</button>
      </div>
      <div class="chart-panel card">
        <h3>{{ historyTitle }}</h3>
        <div ref="historyChartRef" style="width: 100%; height: 500px;"></div>
      </div>
    </div>
    </div>
</template>

<script setup>
import { onMounted } from 'vue';
// 匯入剛剛建立的 JS 邏輯 (請確認路徑是否正確)
import { useHistory } from './useHistory.js'; 

// 解構出我們需要的變數與函式
const { 
  selectedDate, 
  historyTitle, 
  historyChartRef, 
  zoneData, 
  queryHistory, 
  initChart 
} = useHistory();

// 組件掛載後初始化圖表
onMounted(() => {
  initChart();
});
</script>

<style scoped>
</style>