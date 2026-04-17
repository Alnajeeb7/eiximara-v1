const express = require('express');
const db = require('../database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Get messages for a project
router.get('/project/:projectId', authenticate, (req, res) => {
  try {
    const projectId = req.params.projectId;

    // Check project access
    const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (req.user.role !== 'admin' && project.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get messages with sender info
    const messages = db.prepare(`
      SELECT m.*, u.first_name, u.last_name, u.email
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.project_id = ?
      ORDER BY m.created_at ASC
    `).all(projectId);

    // Mark messages as read if user is the recipient
    if (req.user.role !== 'admin') {
      db.prepare(`
        UPDATE messages 
        SET is_read = 1 
        WHERE project_id = ? AND sender_role = 'admin'
      `).run(projectId);
    } else {
      db.prepare(`
        UPDATE messages 
        SET is_read = 1 
        WHERE project_id = ? AND sender_role = 'user'
      `).run(projectId);
    }

    res.json(messages.map(m => ({
      id: m.id,
      projectId: m.project_id,
      senderId: m.sender_id,
      senderName: `${m.first_name} ${m.last_name}`,
      senderEmail: m.email,
      senderRole: m.sender_role,
      content: m.content,
      isRead: !!m.is_read,
      createdAt: m.created_at
    })));
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all user's messages (across all projects)
router.get('/', authenticate, (req, res) => {
  try {
    let messages;

    if (req.user.role === 'admin') {
      // Admin sees all unread messages from users
      messages = db.prepare(`
        SELECT m.*, u.first_name, u.last_name, u.email, p.project_type
        FROM messages m
        JOIN users u ON m.sender_id = u.id
        JOIN projects p ON m.project_id = p.id
        WHERE m.sender_role = 'user'
        ORDER BY m.created_at DESC
        LIMIT 50
      `).all();
    } else {
      // User sees messages for their projects
      messages = db.prepare(`
        SELECT m.*, u.first_name, u.last_name, u.email, p.project_type
        FROM messages m
        JOIN users u ON m.sender_id = u.id
        JOIN projects p ON m.project_id = p.id
        WHERE p.user_id = ?
        ORDER BY m.created_at DESC
        LIMIT 50
      `).all(req.user.id);
    }

    res.json(messages.map(m => ({
      id: m.id,
      projectId: m.project_id,
      projectType: m.project_type,
      senderId: m.sender_id,
      senderName: `${m.first_name} ${m.last_name}`,
      senderEmail: m.email,
      senderRole: m.sender_role,
      content: m.content,
      isRead: !!m.is_read,
      createdAt: m.created_at
    })));
  } catch (error) {
    console.error('Get all messages error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Send a message
router.post('/', authenticate, (req, res) => {
  try {
    const { projectId, content } = req.body;

    if (!projectId || !content) {
      return res.status(400).json({ error: 'Project ID and content are required' });
    }

    // Check project access
    const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (req.user.role !== 'admin' && project.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Create message
    const result = db.prepare(`
      INSERT INTO messages (project_id, sender_id, sender_role, content)
      VALUES (?, ?, ?, ?)
    `).run(projectId, req.user.id, req.user.role, content);

    const message = db.prepare(`
      SELECT m.*, u.first_name, u.last_name, u.email
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.id = ?
    `).get(result.lastInsertRowid);

    res.status(201).json({
      id: message.id,
      projectId: message.project_id,
      senderId: message.sender_id,
      senderName: `${message.first_name} ${message.last_name}`,
      senderRole: message.sender_role,
      content: message.content,
      isRead: false,
      createdAt: message.created_at
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get unread count
router.get('/unread/count', authenticate, (req, res) => {
  try {
    let count;

    if (req.user.role === 'admin') {
      count = db.prepare(`
        SELECT COUNT(*) as count FROM messages 
        WHERE sender_role = 'user' AND is_read = 0
      `).get();
    } else {
      count = db.prepare(`
        SELECT COUNT(*) as count FROM messages m
        JOIN projects p ON m.project_id = p.id
        WHERE p.user_id = ? AND m.sender_role = 'admin' AND m.is_read = 0
      `).get(req.user.id);
    }

    res.json({ count: count.count });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
