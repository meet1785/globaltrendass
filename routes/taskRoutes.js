const express = require('express');
const router = express.Router();
const Task = require('../models/Task');

// GET all tasks
router.get('/', async (req, res) => {
    try {
        // optional filter by status
        const filter = {};
        if (req.query.status) {
            filter.status = req.query.status;
        }
        
        const tasks = await Task.find(filter).sort({ createdAt: -1 });
        res.json(tasks);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching tasks', error: err.message });
    }
});

// GET single task
router.get('/:id', async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        res.json(task);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching task', error: err.message });
    }
});

// POST create task
router.post('/', async (req, res) => {
    try {
        const { title, description, status } = req.body;
        
        if (!title || title.trim() === '') {
            return res.status(400).json({ message: 'Title is required' });
        }
        
        const task = new Task({
            title: title.trim(),
            description: description ? description.trim() : '',
            status: status || 'pending'
        });
        
        const savedTask = await task.save();
        res.status(201).json(savedTask);
    } catch (err) {
        res.status(400).json({ message: 'Error creating task', error: err.message });
    }
});

// PUT update task
router.put('/:id', async (req, res) => {
    try {
        const { title, description, status } = req.body;
        
        const updateData = {};
        if (title !== undefined) updateData.title = title.trim();
        if (description !== undefined) updateData.description = description.trim();
        if (status !== undefined) updateData.status = status;
        
        const task = await Task.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );
        
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        
        res.json(task);
    } catch (err) {
        res.status(400).json({ message: 'Error updating task', error: err.message });
    }
});

// DELETE task
router.delete('/:id', async (req, res) => {
    try {
        const task = await Task.findByIdAndDelete(req.params.id);
        
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        
        res.json({ message: 'Task deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting task', error: err.message });
    }
});

module.exports = router;
