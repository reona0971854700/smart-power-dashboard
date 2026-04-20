const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// 中間件
app.use(cors());
app.use(express.json());

// 模擬電力數據 (之後可對接資料庫)
let powerStats = {
    currentUsage: "45.2 kW",
    dailyTotal: "320 kWh",
    status: "Normal",
    lastUpdate: new Date().toLocaleString()
};

// --- API 路由 ---

// 1. 獲取當前電力狀態 (GET)
app.get('/api/dashboard/stats', (req, res) => {
    res.json({
        ...powerStats,
        lastUpdate: new Date().toLocaleString()
    });
});

// 2. 更新警報閾值 (POST 範例)
app.post('/api/dashboard/settings', (req, res) => {
    const { threshold } = req.body;
    console.log(`收到新閾值設定: ${threshold}`);
    res.status(200).json({ message: "設定已更新", newThreshold: threshold });
});

// 啟動監聽
app.listen(PORT, () => {
    console.log(`✅ Smart Power API 已啟動：http://localhost:${PORT}`);
});