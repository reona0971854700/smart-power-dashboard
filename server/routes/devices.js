import express from 'express';
import db from '../db.js';

const router = express.Router();
const { getPool, memoryStore, sql } = db;

router.get('/', async (req, res) => {
  try {
    const devices = await memoryStore.getAll();
    res.json(devices);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/rooms', async (req, res) => {
  try {
    const devices = await memoryStore.getAll();
    const rooms = [...new Set(devices.map(d => d.room))].sort();
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, room, power = 0 } = req.body;
    if (!name || !room) {
      return res.status(400).json({ error: '名称和房间为必填项' });
    }

    const pool = await getPool();
    if (pool) {
      await pool.request()
        .input('name', sql.VarChar(50), name)
        .input('room', sql.VarChar(50), room)
        .input('power', sql.Int, power)
        .query('INSERT INTO devices (name, room, power) VALUES (@name, @room, @power)');
    } else {
      await memoryStore.add(name, room, power);
    }

    res.json({ message: '设备新增成功' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const pool = await getPool();
    if (pool) {
      await pool.request()
        .input('id', sql.Int, req.params.id)
        .query('DELETE FROM devices WHERE id = @id');
    } else {
      await memoryStore.delete(parseInt(req.params.id));
    }

    res.json({ message: '设备删除成功' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, room, power } = req.body;
    const pool = await getPool();

    if (pool) {
      await pool.request()
        .input('id', sql.Int, req.params.id)
        .input('name', sql.VarChar(50), name)
        .input('room', sql.VarChar(50), room)
        .input('power', sql.Int, power)
        .query('UPDATE devices SET name = @name, room = @room, power = @power WHERE id = @id');
    }

    res.json({ message: '设备更新成功' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;