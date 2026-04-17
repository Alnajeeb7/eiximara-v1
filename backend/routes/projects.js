const express = require('express');
const db = require('../database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Get user's projects (or all projects for admin)
router.get('/', authenticate, (req, res) => {
  try {
    let projects;
    
    if (req.user.role === 'admin') {
      // Admin sees all projects with user info
      projects = db.prepare(`
        SELECT p.*, u.email, u.first_name, u.last_name
        FROM projects p
        JOIN users u ON p.user_id = u.id
        ORDER BY p.created_at DESC
      `).all();
    } else {
      // User sees only their projects
      projects = db.prepare(`
        SELECT * FROM projects WHERE user_id = ? ORDER BY created_at DESC
      `).all(req.user.id);
    }

    // Format response
    const formattedProjects = projects.map(p => ({
      id: p.id,
      userId: p.user_id,
      userEmail: p.email || null,
      userName: p.first_name ? `${p.first_name} ${p.last_name}` : null,
      projectType: p.project_type,
      description: p.description,
      budget: p.budget,
      timeline: p.timeline,
      status: p.status,
      progress: p.progress,
      paymentStatus: p.payment_status,
      paymentUrl: p.payment_url,
      paymentAmount: p.payment_amount,
      projectUrl: p.project_url,
      githubRepo: p.github_repo,
      githubTransferred: !!p.github_transferred,
      createdAt: p.created_at,
      updatedAt: p.updated_at
    }));

    res.json(formattedProjects);
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single project
router.get('/:id', authenticate, (req, res) => {
  try {
    const project = db.prepare(`
      SELECT p.*, u.email, u.first_name, u.last_name
      FROM projects p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = ?
    `).get(req.params.id);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check authorization
    if (req.user.role !== 'admin' && project.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get status history
    const statusHistory = db.prepare(`
      SELECT * FROM status_history WHERE project_id = ? ORDER BY created_at ASC
    `).all(req.params.id);

    res.json({
      id: project.id,
      userId: project.user_id,
      userEmail: project.email,
      userName: `${project.first_name} ${project.last_name}`,
      projectType: project.project_type,
      description: project.description,
      budget: project.budget,
      timeline: project.timeline,
      status: project.status,
      progress: project.progress,
      paymentStatus: project.payment_status,
      paymentUrl: project.payment_url,
      paymentAmount: project.payment_amount,
      projectUrl: project.project_url,
      githubRepo: project.github_repo,
      githubTransferred: !!project.github_transferred,
      createdAt: project.created_at,
      updatedAt: project.updated_at,
      statusHistory: statusHistory.map(h => ({
        status: h.status,
        description: h.description,
        date: h.created_at
      }))
    });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new project (booking)
router.post('/', authenticate, (req, res) => {
  try {
    const { projectType, description, budget, timeline } = req.body;

    if (!projectType) {
      return res.status(400).json({ error: 'Project type is required' });
    }

    // Check if user already has an active project
    const existingProject = db.prepare(`
      SELECT id FROM projects WHERE user_id = ? AND status != 'completed'
    `).get(req.user.id);

    if (existingProject) {
      return res.status(400).json({ 
        error: 'You already have an active project. Complete it before booking a new one.' 
      });
    }

    // Create project
    const result = db.prepare(`
      INSERT INTO projects (user_id, project_type, description, budget, timeline)
      VALUES (?, ?, ?, ?, ?)
    `).run(req.user.id, projectType, description || '', budget || '', timeline || '');

    // Add initial status history
    db.prepare(`
      INSERT INTO status_history (project_id, status, description)
      VALUES (?, 'pending', 'Project booked and awaiting confirmation')
    `).run(result.lastInsertRowid);

    const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json({
      message: 'Project booked successfully',
      project: {
        id: project.id,
        projectType: project.project_type,
        status: project.status,
        createdAt: project.created_at
      }
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Submit payment
router.post('/:id/payment', authenticate, (req, res) => {
  try {
    const { paymentUrl } = req.body;
    const projectId = req.params.id;

    const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (project.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (!paymentUrl) {
      return res.status(400).json({ error: 'Payment URL is required' });
    }

    // Update payment status
    db.prepare(`
      UPDATE projects 
      SET payment_status = 'submitted', payment_url = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(paymentUrl, projectId);

    res.json({ message: 'Payment submitted successfully' });
  } catch (error) {
    console.error('Submit payment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
