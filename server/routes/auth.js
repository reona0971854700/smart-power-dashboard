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

// 设置安全问题
router.post('/set-security-questions', async (req, res) => {
  try {
    const { username, questions, answers } = req.body;

    if (!username || !questions || !answers) {
      return res.status(400).json({ success: false, message: '請填寫完整資料' });
    }

    const pool = await getPool();

    if (pool) {
      await pool.request()
        .input('username', sql.VarChar(50), username)
        .input('q1', sql.NVarChar(255), questions[0] || '')
        .input('a1', sql.NVarChar(255), answers[0] || '')
        .input('q2', sql.NVarChar(255), questions[1] || '')
        .input('a2', sql.NVarChar(255), answers[1] || '')
        .input('q3', sql.NVarChar(255), questions[2] || '')
        .input('a3', sql.NVarChar(255), answers[2] || '')
        .query(`
          UPDATE users SET
            security_question1 = @q1,
            security_answer1 = @a1,
            security_question2 = @q2,
            security_answer2 = @a2,
            security_question3 = @q3,
            security_answer3 = @a3
          WHERE username = @username
        `);

      return res.json({ success: true, message: '安全問題設定成功' });
    } else {
      return res.status(500).json({ success: false, message: '無法連接數據庫' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 获取安全问题（用于忘记密码）
router.post('/get-security-questions', async (req, res) => {
  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ success: false, message: '請輸入帳號' });
    }

    const pool = await getPool();

    if (pool) {
      const result = await pool.request()
        .input('username', sql.VarChar(50), username)
        .query(`
          SELECT security_question1, security_question2, security_question3
          FROM users WHERE username = @username
        `);

      if (result.recordset.length > 0) {
        const user = result.recordset[0];
        if (!user.security_question1 && !user.security_question2 && !user.security_question3) {
          return res.status(400).json({ success: false, message: '該帳號尚未設定安全問題，請聯繫管理員' });
        }
        return res.json({
          success: true,
          questions: [user.security_question1, user.security_question2, user.security_question3]
        });
      } else {
        return res.status(404).json({ success: false, message: '帳號不存在' });
      }
    } else {
      return res.status(500).json({ success: false, message: '無法連接數據庫' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 驗證安全問題（3對1即可）
router.post('/verify-security-questions', async (req, res) => {
  try {
    const { username, answers } = req.body;

    if (!username || !answers) {
      return res.status(400).json({ success: false, message: '請填寫完整資料' });
    }

    const pool = await getPool();

    if (pool) {
      const result = await pool.request()
        .input('username', sql.VarChar(50), username)
        .query(`
          SELECT security_answer1, security_answer2, security_answer3
          FROM users WHERE username = @username
        `);

      if (result.recordset.length > 0) {
        const user = result.recordset[0];
        const correctAnswers = [
          user.security_answer1,
          user.security_answer2,
          user.security_answer3
        ];

        let correctCount = 0;
        for (let i = 0; i < 3; i++) {
          if (answers[i] && answers[i].trim().toLowerCase() === (correctAnswers[i] || '').trim().toLowerCase()) {
            correctCount++;
          }
        }

        if (correctCount >= 1) {
          return res.json({ success: true, message: '驗證成功' });
        } else {
          return res.status(401).json({ success: false, message: '安全問題答案錯誤' });
        }
      } else {
        return res.status(404).json({ success: false, message: '帳號不存在' });
      }
    } else {
      return res.status(500).json({ success: false, message: '無法連接數據庫' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 重置密碼（通過安全問題驗證後）
router.post('/reset-password', async (req, res) => {
  try {
    const { username, newPassword } = req.body;

    if (!username || !newPassword) {
      return res.status(400).json({ success: false, message: '請填寫完整資料' });
    }

    const pool = await getPool();

    if (pool) {
      await pool.request()
        .input('username', sql.VarChar(50), username)
        .input('newPassword', sql.VarChar(255), newPassword)
        .query('UPDATE users SET password = @newPassword WHERE username = @username');

      return res.json({ success: true, message: '密碼重置成功' });
    } else {
      return res.status(500).json({ success: false, message: '無法連接數據庫' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 更改帳號
router.post('/change-username', async (req, res) => {
  try {
    const { username, password, newUsername } = req.body;

    if (!username || !password || !newUsername) {
      return res.status(400).json({ success: false, message: '請填寫完整資料' });
    }

    const specialChars = /[!@#$%^&*()_+\-=\[\]{}|;':",.\/<>?\\`~]/;
    if (specialChars.test(newUsername)) {
      return res.status(400).json({ success: false, message: '帳號不得包含特殊字符' });
    }

    const pool = await getPool();

    if (pool) {
      const verifyResult = await pool.request()
        .input('username', sql.VarChar(50), username)
        .input('password', sql.VarChar(255), password)
        .query('SELECT id FROM users WHERE username = @username AND password = @password');

      if (verifyResult.recordset.length === 0) {
        return res.status(401).json({ success: false, message: '密碼輸入錯誤' });
      }

      const checkResult = await pool.request()
        .input('newUsername', sql.VarChar(50), newUsername)
        .query('SELECT id FROM users WHERE username = @newUsername');

      if (checkResult.recordset.length > 0) {
        return res.status(400).json({ success: false, message: '此帳號已有人使用' });
      }

      await pool.request()
        .input('username', sql.VarChar(50), username)
        .input('newUsername', sql.VarChar(50), newUsername)
        .query('UPDATE users SET username = @newUsername WHERE username = @username');

      return res.json({ success: true, message: '帳號修改成功，請重新登入' });
    } else {
      return res.status(500).json({ success: false, message: '無法連接數據庫' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
