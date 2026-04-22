import sql from 'mssql';

const config = {
  server: 'localhost',
  port: 51700,
  database: 'SmartPowerDB',
  user: 'appuser',
  password: 'Test123456',
  driver: 'ODBC Driver 17 for SQL Server',
  options: {
    trustServerCertificate: true,
    encrypt: false,
    enableArithAbort: true
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

let poolPromise = null;

async function connect() {
  try {
    poolPromise = new sql.ConnectionPool(config).connect();
    const pool = await poolPromise;
    console.log('SQL Server 连接成功');
    return pool;
  } catch (err) {
    console.error('SQL Server 连接失败 (将使用内存存储):', err.message);
    poolPromise = null;
    return null;
  }
}

async function getPool() {
  if (poolPromise) {
    try {
      return await poolPromise;
    } catch {
      return await connect();
    }
  }
  return await connect();
}

const fallbackDevices = [
  { id: 1, name: '冷氣', room: '客廳', power: 180 },
  { id: 2, name: '電視', room: '客廳', power: 80 },
  { id: 3, name: '燈光', room: '客廳', power: 60 },
  { id: 4, name: '音響', room: '客廳', power: 40 },
  { id: 5, name: '冷氣', room: '主臥', power: 150 },
  { id: 6, name: '燈光', room: '主臥', power: 40 },
  { id: 7, name: '電視', room: '主臥', power: 50 },
  { id: 8, name: '燈光', room: '次臥', power: 30 },
  { id: 9, name: '冷氣', room: '次臥', power: 100 },
  { id: 10, name: '風扇', room: '次臥', power: 20 },
  { id: 11, name: '熱水器', room: '廁所', power: 120 },
  { id: 12, name: '照明', room: '廁所', power: 25 },
  { id: 13, name: '通風扇', room: '廁所', power: 15 },
  { id: 14, name: '冰箱', room: '廚房', power: 200 },
  { id: 15, name: '微波爐', room: '廚房', power: 80 },
  { id: 16, name: '電鍋', room: '廚房', power: 50 },
  { id: 17, name: '抽油煙機', room: '廚房', power: 30 }
];

const memoryStore = {
  devices: [...fallbackDevices],
  getAll: async function() {
    const pool = await getPool();
    if (pool) {
      try {
        const result = await pool.request().query('SELECT * FROM devices ORDER BY room, name');
        return result.recordset;
      } catch (e) {
        console.log('使用内存存储');
      }
    }
    return this.devices;
  },
  add: async function(name, room, power) {
    const pool = await getPool();
    if (pool) {
      try {
        await pool.request()
          .input('name', sql.VarChar(50), name)
          .input('room', sql.VarChar(50), room)
          .input('power', sql.Int, power)
          .query('INSERT INTO devices (name, room, power) VALUES (@name, @room, @power)');
        return;
      } catch (e) {}
    }
    const newDevice = { id: this.devices.length + 1, name, room, power };
    this.devices.push(newDevice);
  },
  delete: async function(id) {
    const pool = await getPool();
    if (pool) {
      try {
        await pool.request()
          .input('id', sql.Int, id)
          .query('DELETE FROM devices WHERE id = @id');
        return;
      } catch (e) {}
    }
    const index = this.devices.findIndex(d => d.id === id);
    if (index > -1) this.devices.splice(index, 1);
  }
};

connect();

export default {
  sql,
  getPool,
  memoryStore
};