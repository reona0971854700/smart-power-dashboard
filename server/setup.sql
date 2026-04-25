-- SQL Server 数据库设置脚本
-- 运行前请先在 SQL Server Management Studio 中执行此脚本

-- 创建数据库（如果不存在）
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'SmartPowerDB')
BEGIN
    CREATE DATABASE SmartPowerDB;
    PRINT '數據庫 SmartPowerDB 創建成功';
END
GO

USE SmartPowerDB;
GO

-- 创建用户表（如果不存在）
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'users')
BEGIN
    CREATE TABLE users (
        id INT PRIMARY KEY IDENTITY(1,1),
        username NVARCHAR(50) NOT NULL UNIQUE,
        password NVARCHAR(255) NOT NULL,
        security_question1 NVARCHAR(255) NULL,
        security_answer1 NVARCHAR(255) NULL,
        security_question2 NVARCHAR(255) NULL,
        security_answer2 NVARCHAR(255) NULL,
        security_question3 NVARCHAR(255) NULL,
        security_answer3 NVARCHAR(255) NULL,
        created_at DATETIME DEFAULT GETDATE()
    );
    PRINT '用户表創建成功';
END
GO

-- 如果 users 表已存在，添加安全问题字段
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'users')
BEGIN
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('users', 'U') AND name = 'security_question1')
    BEGIN
        ALTER TABLE users ADD security_question1 NVARCHAR(255) NULL;
        ALTER TABLE users ADD security_answer1 NVARCHAR(255) NULL;
        ALTER TABLE users ADD security_question2 NVARCHAR(255) NULL;
        ALTER TABLE users ADD security_answer2 NVARCHAR(255) NULL;
        ALTER TABLE users ADD security_question3 NVARCHAR(255) NULL;
        ALTER TABLE users ADD security_answer3 NVARCHAR(255) NULL;
        PRINT '安全问题字段添加成功';
    END
END
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
    PRINT '設備表創建成功';
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
    PRINT '預設設備插入成功';
END
GO

-- 查询数据验证
SELECT * FROM devices;
GO

-- 创建测试用户（如果不存在）
IF NOT EXISTS (SELECT * FROM users WHERE username = 'admin')
BEGIN
    INSERT INTO users (username, password) VALUES ('admin', '123456');
    PRINT '测试用户创建成功';
END
GO

-- 验证 users 表
SELECT * FROM users;
GO