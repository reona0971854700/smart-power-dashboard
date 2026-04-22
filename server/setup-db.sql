USE master;
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'SmartPowerDB')
BEGIN
    CREATE DATABASE SmartPowerDB;
END
GO

USE SmartPowerDB;
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'devices')
BEGIN
    CREATE TABLE devices (
        id INT PRIMARY KEY IDENTITY(1,1),
        name NVARCHAR(50) NOT NULL,
        room NVARCHAR(50) NOT NULL,
        power INT DEFAULT 0,
        created_at DATETIME DEFAULT GETDATE()
    );
END
GO

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
END
GO

SELECT * FROM devices;
GO