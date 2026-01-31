const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const { optionalAuth } = require('../middleware/auth');

// GET all tasks with filters and search
router.get('/', optionalAuth, async (req, res) => {
    try {
        const filter = {};
        
        // Filter by user if authenticated
        if (req.user) {
            filter.user = req.user.userId;
        } else {
            filter.user = null; // Show only public tasks for guests
        }
        
        // Status filter
        if (req.query.status && req.query.status !== 'all') {
            filter.status = req.query.status;
        }
        
        // Priority filter
        if (req.query.priority && req.query.priority !== 'all') {
            filter.priority = req.query.priority;
        }
        
        // Search by title or description
        if (req.query.search) {
            const searchRegex = new RegExp(req.query.search, 'i');
            filter.$or = [
                { title: searchRegex },
                { description: searchRegex }
            ];
        }
        
        // Date range filter
        if (req.query.dueBefore) {
            filter.dueDate = { ...filter.dueDate, $lte: new Date(req.query.dueBefore) };
        }
        if (req.query.dueAfter) {
            filter.dueDate = { ...filter.dueDate, $gte: new Date(req.query.dueAfter) };
        }
        
        // Sorting
        let sortOption = { createdAt: -1 };
        if (req.query.sortBy) {
            const sortOrder = req.query.order === 'asc' ? 1 : -1;
            sortOption = { [req.query.sortBy]: sortOrder };
        }
        
        const tasks = await Task.find(filter).sort(sortOption);
        res.json(tasks);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching tasks', error: err.message });
    }
});

// GET task statistics
router.get('/stats/summary', optionalAuth, async (req, res) => {
    try {
        const userFilter = req.user ? { user: req.user.userId } : { user: null };
        
        const stats = await Task.aggregate([
            { $match: userFilter },
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
                    inProgress: { $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] } },
                    completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
                    highPriority: { $sum: { $cond: [{ $eq: ['$priority', 'high'] }, 1, 0] } },
                    overdue: {
                        $sum: {
                            $cond: [
                                { $and: [
                                    { $ne: ['$status', 'completed'] },
                                    { $ne: ['$dueDate', null] },
                                    { $lt: ['$dueDate', new Date()] }
                                ]},
                                1, 0
                            ]
                        }
                    }
                }
            }
        ]);
        
        const result = stats[0] || {
            total: 0, pending: 0, inProgress: 0, completed: 0, highPriority: 0, overdue: 0
        };
        
        // Calculate completion rate
        result.completionRate = result.total > 0 
            ? Math.round((result.completed / result.total) * 100) 
            : 0;
        
        res.json(result);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching stats', error: err.message });
    }
});

// GET single task
router.get('/:id', optionalAuth, async (req, res) => {
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
router.post('/', optionalAuth, async (req, res) => {
    try {
        const { title, description, status, priority, dueDate } = req.body;
        
        if (!title || title.trim() === '') {
            return res.status(400).json({ message: 'Title is required' });
        }
        
        const task = new Task({
            title: title.trim(),
            description: description ? description.trim() : '',
            status: status || 'pending',
            priority: priority || 'medium',
            dueDate: dueDate || null,
            user: req.user ? req.user.userId : null
        });
        
        const savedTask = await task.save();
        res.status(201).json(savedTask);
    } catch (err) {
        res.status(400).json({ message: 'Error creating task', error: err.message });
    }
});

// PUT update task
router.put('/:id', optionalAuth, async (req, res) => {
    try {
        const { title, description, status, priority, dueDate } = req.body;
        
        const updateData = {};
        if (title !== undefined) updateData.title = title.trim();
        if (description !== undefined) updateData.description = description.trim();
        if (status !== undefined) updateData.status = status;
        if (priority !== undefined) updateData.priority = priority;
        if (dueDate !== undefined) updateData.dueDate = dueDate;
        
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
router.delete('/:id', optionalAuth, async (req, res) => {
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

// Export tasks as CSV
router.get('/export/csv', optionalAuth, async (req, res) => {
    try {
        const userFilter = req.user ? { user: req.user.userId } : { user: null };
        const tasks = await Task.find(userFilter).sort({ createdAt: -1 });
        
        // Build CSV
        const headers = ['Title', 'Description', 'Status', 'Priority', 'Due Date', 'Created At'];
        const rows = tasks.map(t => [
            `"${t.title.replace(/"/g, '""')}"`,
            `"${(t.description || '').replace(/"/g, '""')}"`,
            t.status,
            t.priority,
            t.dueDate ? new Date(t.dueDate).toISOString().split('T')[0] : '',
            new Date(t.createdAt).toISOString().split('T')[0]
        ].join(','));
        
        const csv = [headers.join(','), ...rows].join('\n');
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=tasks.csv');
        res.send(csv);
    } catch (err) {
        res.status(500).json({ message: 'Error exporting tasks', error: err.message });
    }
});

module.exports = router;
