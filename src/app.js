const express = require('express');
const Task = require('./models/Task');

const app = express();
app.use(express.json());

const a = 1;

// GET /health
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

// GET /api/tasks
app.get('/api/tasks', async (req, res) => {
  try {
    const tasks = await Task.find();
    res.status(200).json(tasks);
  } catch {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST /api/tasks
app.post('/api/tasks', async (req, res) => {
  try {
    const { title, description, status } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const task = new Task({ title, description, status });
    const savedTask = await task.save();
    
    res.status(201).json(savedTask);
  } catch {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/tasks/:id
app.get('/api/tasks/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.status(200).json(task);
  } catch {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// PUT /api/tasks/:id
app.put('/api/tasks/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const task = await Task.findByIdAndUpdate(
      req.params.id, 
      { status }, 
      { new: true, runValidators: true }
    );
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.status(200).json(task);
  } catch {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// DELETE /api/tasks/:id
app.delete('/api/tasks/:id', async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.status(200).json({ message: 'Task deleted successfully' });
  } catch {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = app;
