import { ref } from 'vue';

export function useManagement() {
  const devices = ref([
    { id: 1, name: '客廳冷氣', status: '運作中', power: '1.2kW' },
    { id: 2, name: '廚房冰箱', status: '運作中', power: '0.5kW' },
    { id: 3, name: '電動車樁', status: '待機', power: '0kW' }
  ]);

  const toggleDevice = (id) => {
    console.log(`切換設備 ${id} 狀態`);
  };

  return { devices, toggleDevice };
}