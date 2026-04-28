import express from 'express';
import db from '../db.js';

/*手動切換 mock & DB */
const USE_MOCK = process.env.USE_MOCK !== 'false';

const router = express.Router();
const { getPool, memoryStore, sql } = db;

/* ===================== GET ALL ===================== */
router.get('/', async (req, res) => {
  try {
    if (!USE_MOCK) {
      const pool = await getPool();

      if (pool) {
        const result = await pool.request()
          .query('SELECT * FROM devices');

        return res.json(result.recordset);
      }
    }

    const devices = await memoryStore.getAll();
    res.json(devices);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ===================== GET ROOMS ===================== */
router.get('/rooms', async (req, res) => {
  try {
    let devices = [];

    if (!USE_MOCK) {
      const pool = await getPool();
      if (pool) {
        const result =await pool.request()
          .query('SELECT room FROM devices');
        devices = result.recordset;
      }
    } else {
      devices = await memoryStore.getAll();
    }

    const rooms = [...new Set(devices.map(d => d.room))].sort();
    res.json(rooms);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ===================== CREATE ===================== */
router.post('/', async (req, res) => {
  try {
    const { name, room, power = 0 } = req.body;
    if (!name || !room) {
      return res.status(400).json({ error: '名稱和房間必須填' });
    }

    if (!USE_MOCK) {
      const pool = await getPool();
      if (pool) {
        await pool.request()
          .input('name', sql.VarChar(50), name)
          .input('room', sql.VarChar(50), room)
          .input('power', sql.Int, power)
          .query('INSERT INTO devices (name, room, power) VALUES (@name, @room, @power)');
      }
    } else {
      await memoryStore.add(name, room, power);
    }

    res.json({ message: '設備新增成功' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ===================== DELETE ===================== */
router.delete('/:id', async (req, res) => {
  try {
    if (!USE_MOCK) {
      const pool = await getPool();

      if (pool) {
        await pool.request()
          .input('id', sql.Int, req.params.id)
          .query('DELETE FROM devices WHERE id = @id');
      }
    } else {
      await memoryStore.delete(parseInt(req.params.id));
    }

    res.json({ message: '設備刪除成功' });
  
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ===================== UPDATE ===================== */
router.put('/:id', async (req, res) => {
  try {
    const { name, room, power } = req.body;

    if (!USE_MOCK){
      const pool = await getPool();
      if (pool) {
        await pool.request()
          .input('id', sql.Int, req.params.id)
          .input('name', sql.VarChar(50), name)
          .input('room', sql.VarChar(50), room)
          .input('power', sql.Int, power)
          .query('UPDATE devices SET name = @name, room = @room, power = @power WHERE id = @id');
      }
    } else {
      await memoryStore.update(
        parseInt(req.params.id),
        name,
        room,
        power
      );
    }

    res.json({ message: '設備更新成功' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;