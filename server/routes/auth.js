import express from 'express';
import db from '../db.js';

const router = express.Router();
const { getPool, memoryStore, sql } = db;

// 登录
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ success: false, message: '請輸入帳號和密碼' });
    }

    const pool = await getPool();
    
    if (pool) {
      const result = await pool.request()
        .input('username', sql.VarChar(50), username)
        .input('password', sql.VarChar(255), password)
        .query('SELECT id, username FROM users WHERE username = @username AND password = @password');
      
      if (result.recordset.length > 0) {
        return res.json({ 
          success: true, 
          message: '登入成功',
          user: { id: result.recordset[0].id, username: result.recordset[0].username }
        });
      } else {
        return res.status(401).json({ success: false, message: '帳號或密碼錯誤' });
      }
    } else {
      return res.status(500).json({ success: false, message: '無法連接數據庫' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 修改密码
router.post('/change-password', async (req, res) => {
  try {
    const { username, oldPassword, newPassword } = req.body;
    
    if (!username || !oldPassword || !newPassword) {
      return res.status(400).json({ success: false, message: '請填寫完整資料' });
    }

    const pool = await getPool();
    
    if (pool) {
      // 验证旧密码
      const verifyResult = await pool.request()
        .input('username', sql.VarChar(50), username)
        .input('password', sql.VarChar(255), oldPassword)
        .query('SELECT id FROM users WHERE username = @username AND password = @password');
      
      if (verifyResult.recordset.length === 0) {
        return res.status(401).json({ success: false, message: '舊密碼錯誤' });
      }

      // 更新密码
      await pool.request()
        .input('username', sql.VarChar(50), username)
        .input('newPassword', sql.VarChar(255), newPassword)
        .query('UPDATE users SET password = @newPassword WHERE username = @username');
      
      return res.json({ success: true, message: '密碼修改成功' });
    } else {
      return res.status(500).json({ success: false, message: '無法連接數據庫' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
