// --- 這裡假設你目前是用 CDN 模式，手動註冊組件 ---
const { createApp, ref, computed } = Vue; // 從 Vue 提取方法

// 建立 Vue 應用程式
const app = createApp({ // 應用程式開始
    setup() { // 設定區塊
        const currentTab = ref('Dashboard'); // 定義目前在哪個頁面，預設為儀錶板
        const currentLoad = ref(45); // 定義即時負載變數
        
        // 計算屬性：自動計算負載顏色
        const loadColor = computed(() => { // 計算邏輯開始
            return currentLoad.value > 80 ? '#ff4d4d' : '#00ff99'; // 超過 80 回傳紅色，否則綠色
        }); // 計算結束

        return { currentTab, currentLoad, loadColor }; // 回傳給 HTML 使用
    } // setup 結束
}); // app 結束

// --- 註冊剛才拆分的組件 (假設已經透過 script 載入) ---
// app.component('history-component', HistoryObject);
// app.component('management-component', ManagementObject);

app.mount('#app'); // 將 Vue 應用掛載到 id 為 app 的 div 上