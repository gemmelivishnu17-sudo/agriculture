const mongoose = require('mongoose');
const ContactMessage = require('../models/ContactMessage');

const requireAdmin = (req, res) => {
  if (req.user?.role === 'admin') return true;
  res.status(403).json({ success: false, message: 'Access denied. Admin only.' });
  return false;
};

const submitContactMessage = async (req, res) => {
  try {
    const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const phone = typeof req.body.phone === 'string' ? req.body.phone.trim() : '';
    const message = typeof req.body.message === 'string' ? req.body.message.trim() : '';

    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: 'Name, email, and message are required.' });
    }
    if (name.length > 120 || email.length > 254 || phone.length > 40 || message.length > 5000) {
      return res.status(400).json({ success: false, message: 'One or more fields exceed the allowed length.' });
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
    }

    const contactMessage = await ContactMessage.create({ name, email, phone, message });
    return res.status(201).json({
      success: true,
      message: 'Your message has been sent to the library team.',
      contactMessage: { _id: contactMessage._id, createdAt: contactMessage.createdAt },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Could not save your message.' });
  }
};

const getContactMessages = async (req, res) => {
  if (!requireAdmin(req, res)) return;

  try {
    const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 20, 1), 100);
    const status = req.query.status;
    if (status && !['new', 'read', 'closed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid message status.' });
    }

    const query = status ? { status } : {};
    const [messages, total] = await Promise.all([
      ContactMessage.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      ContactMessage.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      messages,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Could not load contact messages.' });
  }
};

const updateContactMessage = async (req, res) => {
  if (!requireAdmin(req, res)) return;
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ success: false, message: 'Invalid message ID.' });
  }

  const { status } = req.body;
  if (!['new', 'read', 'closed'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Status must be new, read, or closed.' });
  }

  try {
    const contactMessage = await ContactMessage.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).lean();
    if (!contactMessage) {
      return res.status(404).json({ success: false, message: 'Contact message not found.' });
    }
    return res.status(200).json({ success: true, contactMessage });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Could not update contact message.' });
  }
};

module.exports = { submitContactMessage, getContactMessages, updateContactMessage };