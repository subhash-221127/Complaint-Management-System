const express = require('express');
const router = express.Router();
const Department = require('../models/Department');
const Complaint = require('../models/Complaint');
const Officer = require('../models/Officer');

// ----------------------------------
// Get all departments
// ----------------------------------
router.get('/', async (req, res) => {
    try {
        const departments = await Department.find({});
        res.json(departments);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// ----------------------------------
// Add a new department
// ----------------------------------
router.post('/', async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ error: 'Department name required' });

        // Check if department already exists
        const existing = await Department.findOne({ name });
        if (existing) return res.status(400).json({ error: 'Department already exists' });

        const newDepartment = new Department({ name });
        await newDepartment.save();
        res.json(newDepartment);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// ----------------------------------
// Delete a department
// ----------------------------------
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Department.findByIdAndDelete(id);
        if (!deleted) return res.status(404).json({ error: 'Department not found' });
        res.json({ message: 'Department deleted', department: deleted });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// ----------------------------------
// Get department stats
// ----------------------------------
router.get('/:id/stats', async (req, res) => {
    try {
        const { id } = req.params;

        const department = await Department.findById(id);
        if (!department) return res.status(404).json({ error: 'Department not found' });

        const totalComplaints = await Complaint.countDocuments({ department: id });
        const resolvedComplaints = await Complaint.countDocuments({ department: id, status: 'Resolved' });
        const pendingComplaints = totalComplaints - resolvedComplaints;
        const officers = await Officer.find({ department: id });
        const activeOfficers = officers.filter(o => o.active).length;

        res.json({
            department,
            stats: {
                totalComplaints,
                resolvedComplaints,
                pendingComplaints,
                totalOfficers: officers.length,
                activeOfficers
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
