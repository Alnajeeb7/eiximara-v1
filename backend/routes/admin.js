const express = require('express');
const db = require('../database');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// All routes require admin
router.use(authenticate);
router.use(requireAdmin);

// Get dashboard stats
router.get('/stats', (req, res) => {
  try {
    const totalProjects = db.prepare('SELECT COUNT(*) as count FROM projects').get();
    const pendingProjects = db.prepare("SELECT COUNT(*) as count FROM projects WHERE status = 'pending'").get();
    const inProgressProjects = db.prepare("SELECT COUNT(*) as count FROM projects WHERE status = 'in_progress'").get();
    const completedProjects = db.prepare("SELECT COUNT(*) as count FROM projects WHERE status = 'completed'").get();
    const pendingPayments = db.prepare("SELECT COUNT(*) as count FROM projects WHERE payment_status = 'submitted'").get();
    const totalUsers = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'user'").get();

    res.json({
      totalProjects: totalProjects.count,
      pendingProjects: pendingProjects.count,
      inProgressProjects: inProgressProjects.count,
      completedProjects: completedProjects.count,
      pendingPayments: pendingPayments.count,
      totalUsers: totalUsers.count
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update project status
router.put('/projects/:id/status', (req, res) => {
  try {
    const { status, progress, description } = req.body;
    const projectId = req.params.id;

    const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const validStatuses = ['pending', 'in_progress', 'review', 'completed'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Update project
    const updates = [];
    const values = [];

    if (status) {
      updates.push('status = ?');
      values.push(status);
    }
    if (typeof progress === 'number') {
      updates.push('progress = ?');
      values.push(Math.min(100, Math.max(0, progress)));
    }
    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(projectId);

    db.prepare(`UPDATE projects SET ${updates.join(', ')} WHERE id = ?`).run(...values);

    // Add to status history if status changed
    if (status && status !== project.status) {
      db.prepare(`
        INSERT INTO status_history (project_id, status, description)
        VALUES (?, ?, ?)
      `).run(projectId, status, description || getStatusDescription(status));
    }

    res.json({ message: 'Project updated successfully' });
  } catch (error) {
    console.error('Update project status error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Verify payment
router.put('/projects/:id/verify-payment', (req, res) => {
  try {
    const projectId = req.params.id;

    const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (project.payment_status !== 'submitted') {
      return res.status(400).json({ error: 'No payment to verify' });
    }

    db.prepare(`
      UPDATE projects 
      SET payment_status = 'verified', updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(projectId);

    // Add status history
    db.prepare(`
      INSERT INTO status_history (project_id, status, description)
      VALUES (?, 'payment_verified', 'Payment has been verified by admin')
    `).run(projectId);

    res.json({ message: 'Payment verified successfully' });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Set payment amount
router.put('/projects/:id/payment-amount', (req, res) => {
  try {
    const { amount } = req.body;
    const projectId = req.params.id;

    if (typeof amount !== 'number' || amount < 0) {
      return res.status(400).json({ error: 'Valid amount is required' });
    }

    const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    db.prepare(`
      UPDATE projects 
      SET payment_amount = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(amount, projectId);

    res.json({ message: 'Payment amount updated' });
  } catch (error) {
    console.error('Set payment amount error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Deliver project (set project URL and GitHub repo)
router.put('/projects/:id/deliver', (req, res) => {
  try {
    const { projectUrl, githubRepo } = req.body;
    const projectId = req.params.id;

    const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const updates = [];
    const values = [];

    if (projectUrl) {
      updates.push('project_url = ?');
      values.push(projectUrl);
    }
    if (githubRepo) {
      updates.push('github_repo = ?');
      values.push(githubRepo);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'Project URL or GitHub repo is required' });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(projectId);

    db.prepare(`UPDATE projects SET ${updates.join(', ')} WHERE id = ?`).run(...values);

    // Add status history
    db.prepare(`
      INSERT INTO status_history (project_id, status, description)
      VALUES (?, 'delivered', 'Project files have been delivered')
    `).run(projectId);

    res.json({ message: 'Project delivered successfully' });
  } catch (error) {
    console.error('Deliver project error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Transfer GitHub repo (mark as transferred)
router.put('/projects/:id/transfer-github', (req, res) => {
  try {
    const projectId = req.params.id;

    const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (!project.github_repo) {
      return res.status(400).json({ error: 'No GitHub repo to transfer' });
    }

    db.prepare(`
      UPDATE projects 
      SET github_transferred = 1, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(projectId);

    // Add status history
    db.prepare(`
      INSERT INTO status_history (project_id, status, description)
      VALUES (?, 'github_transferred', 'GitHub repository has been transferred to user')
    `).run(projectId);

    res.json({ message: 'GitHub repo marked as transferred' });
  } catch (error) {
    console.error('Transfer GitHub error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all users
router.get('/users', (req, res) => {
  try {
    const users = db.prepare(`
      SELECT id, email, first_name, last_name, role, created_at
      FROM users
      ORDER BY created_at DESC
    `).all();

    res.json(users.map(u => ({
      id: u.id,
      email: u.email,
      firstName: u.first_name,
      lastName: u.last_name,
      role: u.role,
      createdAt: u.created_at
    })));
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Helper function for status descriptions
function getStatusDescription(status) {
  const descriptions = {
    pending: 'Project is pending review',
    in_progress: 'Development has started',
    review: 'Project is under review',
    completed: 'Project has been completed'
  };
  return descriptions[status] || status;
}

module.exports = router;
