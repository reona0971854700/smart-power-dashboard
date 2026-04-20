<template> 
<div class="page-management"> 
  <h1>🛠️ 設備管理中心</h1> 
  <div class="management-grid"> <DeviceCard 
        v-for="item in devices" 
        :key="item.id" 
        :device="item" 
        @toggle="handleToggle"
      /> 
  </div> 
</div> 
</template> 

<script setup> import { ref } from 'vue'; // 引入反應式工具

import DeviceCard from 'components\DeviceCard.vue'; // 引入剛才寫好的小零件

// 模擬設備資料庫
const devices = ref([ // 建立反應式陣列
  { id: 1, name: "客廳冷氣", location: "客廳", isOn: true, icon: "❄️" }, // 資料 1
  { id: 2, name: "廚房冰箱", location: "廚房", isOn: true, icon: "🧊" }, // 資料 2
  { id: 3, name: "廁所熱水器", location: "廁所", isOn: false, icon: "🔥" } // 資料 3
]); // 陣列結束

// 處理開關邏輯
const handleToggle = (device) => { // 接收子組件傳來的 device 物件
  device.isOn = !device.isOn; // 切換開關狀態
  console.log(`已成功切換 ${device.name} 狀態`); // 記錄 log
}; // 函式結束
</script> <style scoped> /* 頁面專屬佈局樣式 */
.management-grid { 
  display: grid; 
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); 
  gap: 20px; 
} /* 網格設定結束 */
</style>