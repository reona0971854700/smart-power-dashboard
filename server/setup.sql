-- SQL Server 数据库设置脚本
-- 运行前请先在 SQL Server Management Studio 中执行此脚本

-- 创建数据库（如果不存在）
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'SmartPowerDB')
BEGIN
    CREATE DATABASE SmartPowerDB;
    PRINT '数据库 SmartPowerDB 创建成功';
END
GO

USE SmartPowerDB;
GO

-- 创建设备表
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
GO

-- 插入预设设备数据
IF NOT EXISTS (SELECT * FROM devices)
BEGIN
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
    ('抽油煙機', '廚房', 30);
    PRINT '预设设备数据插入成功';
END
GO

-- 查询数据验证
SELECT * FROM devices;