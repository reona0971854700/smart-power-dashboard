import sql from 'mssql';

const config = {
  server: 'localhost',
  port: 51700,
  database: 'master',
  authentication: {
    type: 'default', 
    options: {
      userName: '',
      password: ''
    }
  },
  options: {
    trustServerCertificate: true,
    encrypt: false,
    enableArithAbort: true
  }
};

async function initDatabase() {
  try {
    console.log('正在连接 SQL Server...');
    const pool = await sql.connect(config);
    console.log('已连接到 SQL Server');

    await pool.query(`
      IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'SmartPowerDB')
      BEGIN
        CREATE DATABASE SmartPowerDB;
        PRINT '数据库 SmartPowerDB 创建成功';
      END
    `);

    await pool.query('USE SmartPowerDB');

    await pool.query(`
      IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'devices')
      BEGIN
        CREATE TABLE devices (
          id INT PRIMARY KEY IDENTITY(1,1),
          name NVARCHAR(50) NOT NULL,
          room NVARCHAR(50) NOT NULL,
          power INT DEFAULT 0,
          created_at DATETIME DEFAULT GETDATE()
        );
        PRINT '设备表创建成功';
      END
    `);

    const result = await pool.query('SELECT COUNT(*) as count FROM devices');
    if (result.recordset[0].count === 0) {
      await pool.query(`
        INSERT INTO devices (name, room, power) VALUES
        ('冷氣', '客廳', 180),
        ('電視', '客廳', 80),
        ('燈光', '客廳', 60),
        ('音響', '客廳', 40),
        ('冷氣', '主臥', 150),
        ('燈光', '主臥', 40),
        ('電視', '主臥', 50),
        ('燈光', '次臥', 30),
        ('冷氣', '次臥', 100),
        ('風扇', '次臥', 20),
        ('熱水器', '廁所', 120),
        ('照明', '廁所', 25),
        ('通風扇', '廁所', 15),
        ('冰箱', '廚房', 200),
        ('微波爐', '廚房', 80),
        ('電鍋', '廚房', 50),
        ('抽油煙機', '廚房', 30)
      `);
      console.log('预设设备数据插入成功');
    }

    console.log('数据库初始化完成！');
    await pool.close();
  } catch (err) {
    console.error('数据库初始化失败:', err.message);
  }
}

initDatabase();