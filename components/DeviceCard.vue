<template> 
<div class="card device-card"> 
    <div class="device-info"> 
        <span class="device-icon">{{ device.icon }}</span> 
        <h3>{{ device.name }}</h3> 
    </div> 
    <div class="device-status"> 
        <p>位置：{{ device.location }}</p> 
        <p :style="{ color: device.isOn ? '#00ff99' : '#ff4d4d' }">
        狀態：{{ device.isOn ? '運作中' : '已關閉' }}
        </p> 
    </div> 
    <button @click="$emit('toggle', device)" class="toggle-btn">
      {{ device.isOn ? '關閉設備' : '開啟設備' }}
    </button> 
</div> 
</template> 

<script setup> // defineProps: 用來接收父組件 (Management.vue) 傳進來的資料

defineProps({ // 定義屬性
  device: { // 接收一個名為 device 的物件
    type: Object, // 設定類型必須是物件
    required: true // 設定為必填項目
  } // device 定義結束
}); // Props 定義結束

// defineEmits: 用來定義要傳回給父組件的事件（例如點擊按鈕後要告訴爸爸）
defineEmits(['toggle']); // 定義一個名為 toggle 的事件
</script> <style scoped> .device-card { /* 卡片樣式 */
  background: #333; /* 深灰色背景 */
  padding: 15px; /* 內邊距 */
  border-radius: 10px; /* 圓角 */
  display: flex; /* 使用彈性佈局 */
  flex-direction: column; /* 垂直排列 */
  gap: 10px; /* 元件間距 */
  border: 1px solid #444; /* 微弱的邊框 */
} /* 卡片樣式結束 */

.device-info { display: flex; align-items: center; gap: 10px; } /* 圖示與名稱橫向排列 */
.device-icon { font-size: 1.5rem; } /* 圖示大小 */
.toggle-btn { /* 按鈕美化 */
  padding: 8px; /* 內邊距 */
  background: transparent; /* 透明背景 */
  border: 1px solid #00ff99; /* 綠色邊框 */
  color: #00ff99; /* 綠色文字 */
  cursor: pointer; /* 手指游標 */
  transition: 0.3s; /* 動畫過渡 */
} /* 按鈕樣式結束 */
.toggle-btn:hover { background: #00ff99; color: black; } /* 懸停時反白 */
</style>