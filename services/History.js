import { ref, onMounted } from 'vue';
import * as echarts from 'echarts';

export function useHistory() {
  // --- 反應式變數 ---
  const selectedDate = ref('');
  const historyTitle = ref('請選擇日期後查詢');
  const historyChartRef = ref(null);
  const zoneData = ref([]);
  let myChart = null;

  // --- 查詢資料的函式 ---
  const queryHistory = async () => {
    if (!selectedDate.value) {
      alert("請選擇日期");
      return;
    }

    historyTitle.value = `${selectedDate.value} 區域耗電統計`;

    // 模擬數據
    const mockData = [
      { zone: "客廳", totalValue: 850, appliances: [{ name: "冷氣", value: 450 }, { name: "電視", value: 120 }, { name: "清淨機", value: 280 }] },
      { zone: "主臥", totalValue: 600, appliances: [{ name: "冷氣", value: 350 }, { name: "除濕機", value: 150 }, { name: "電腦", value: 100 }] },
      { zone: "次臥", totalValue: 400, appliances: [{ name: "冷氣", value: 300 }, { name: "檯燈", value: 20 }, { name: "主機", value: 80 }] },
      { zone: "客臥", totalValue: 150, appliances: [{ name: "風扇", value: 60 }, { name: "音響", value: 90 }] },
      { zone: "廚房", totalValue: 1200, appliances: [{ name: "冰箱", value: 300 }, { name: "微波爐", value: 450 }, { name: "洗碗機", value: 450 }] },
      { zone: "廁所", totalValue: 550, appliances: [{ name: "熱水器", value: 500 }, { name: "抽風機", value: 50 }] }
    ];

    zoneData.value = mockData;
    updateChart();
  };

  // --- 更新圖表的函式 ---
  const updateChart = () => {
    if (!myChart) return;
    const option = {
      backgroundColor: 'transparent',
      tooltip: { trigger: 'axis' },
      xAxis: {
        type: 'category',
        data: zoneData.value.map(item => item.zone)
      },
      yAxis: {
        type: 'value',
        name: 'kWh'
      },
      series: [{
        name: '總耗電量',
        type: 'bar',
        data: zoneData.value.map(item => item.totalValue),
        color: '#00ff99',
        showBackground: true,
        backgroundStyle: { color: 'rgba(180, 180, 180, 0.1)' }
      }]
    };
    myChart.setOption(option);
  };

  // --- 初始化圖表 ---
  const initChart = () => {
    if (historyChartRef.value) {
      myChart = echarts.init(historyChartRef.value, 'dark');
      window.addEventListener('resize', () => myChart.resize());
    }
  };

  // 將變數與函式導出，讓 .vue 檔案可以使用
  return {
    selectedDate,
    historyTitle,
    historyChartRef,
    zoneData,
    queryHistory,
    initChart
  };
}