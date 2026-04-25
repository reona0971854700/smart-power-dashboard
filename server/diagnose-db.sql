-- 数据库诊断脚本
-- 请在 SQL Server Management Studio 中执行此脚本，检查安全问题功能是否正常

USE SmartPowerDB;
GO

PRINT '=== 1. 檢查 users 表是否存在 ===';
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'users')
    PRINT 'users 表存在';
ELSE
    PRINT 'users 表不存在！需要創建表';
GO

PRINT '';
PRINT '=== 2. 檢查 users 表結構 ===';
SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'users'
ORDER BY ORDINAL_POSITION;
GO

PRINT '';
PRINT '=== 3. 檢查安全問題字段是否存在 ===';
DECLARE @FieldCount INT;
SELECT @FieldCount = COUNT(*)
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'users'
  AND COLUMN_NAME IN ('security_question1', 'security_answer1',
                      'security_question2', 'security_answer2',
                      'security_question3', 'security_answer3');

IF @FieldCount = 6
    PRINT '所有安全問題字段都存在 (6個)';
ELSE
    PRINT '安全問題字段缺失！當前有 ' + CAST(@FieldCount AS VARCHAR) + ' 个，应该有 6 个';
GO

PRINT '';
PRINT '=== 4. 檢查用戶數據 ===';
SELECT id, username,
       CASE WHEN security_question1 IS NOT NULL THEN '已設置' ELSE '未設置' END AS 問題1狀態,
       CASE WHEN security_question2 IS NOT NULL THEN '已設置' ELSE '未設置' END AS 問題2狀態,
       CASE WHEN security_question3 IS NOT NULL THEN '已設置' ELSE '未設置' END AS 問題3狀態
FROM users;
GO

PRINT '';
PRINT '=== 5. 如果需要，添加缺失的字段 ===';
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('users', 'U') AND name = 'security_question1')
BEGIN
    ALTER TABLE users ADD security_question1 NVARCHAR(255) NULL;
    ALTER TABLE users ADD security_answer1 NVARCHAR(255) NULL;
    ALTER TABLE users ADD security_question2 NVARCHAR(255) NULL;
    ALTER TABLE users ADD security_answer2 NVARCHAR(255) NULL;
    ALTER TABLE users ADD security_question3 NVARCHAR(255) NULL;
    ALTER TABLE users ADD security_answer3 NVARCHAR(255) NULL;
    PRINT '安全問題字段添加成功';
END
ELSE
    PRINT '安全問題字段已存在，无需添加';
GO

PRINT '';
PRINT '=== 6. 如果需要，創建測試用户 ===';
IF NOT EXISTS (SELECT * FROM users WHERE username = 'admin')
BEGIN
    INSERT INTO users (username, password) VALUES ('admin', '123456');
    PRINT '測試用户 admin 創建成功';
END
ELSE
    PRINT '測試用户 admin 已存在';
GO

PRINT '';
PRINT '=== 診斷完成 ===';
PRINT '請查看以上輸出，红色或錯誤信息表示需要修复的問題';
GO