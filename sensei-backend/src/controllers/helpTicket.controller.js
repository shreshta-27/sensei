import HelpTicket from '../models/HelpTicket.js';
import User from '../models/User.js';
import { createNotification } from '../services/notification.service.js';
import getIO from '../config/socket.js';

export const createTicket = async (req, res) => {
  try {
    const { message, category, urgency } = req.body;
    const ticket = await HelpTicket.create({
      studentId: req.user.userId,
      message,
      category,
      urgency: urgency || 'medium',
      status: 'pending'
    });

    const populatedTicket = await HelpTicket.findById(ticket._id)
      .populate('studentId', 'name studentId email avatar');

    try {
      const io = getIO();
      io.of('/teacher').emit('help:new_ticket', populatedTicket);
    } catch (e) {}

    res.status(201).json(ticket);
  } catch (error) {
    res.status(500).json({ error: error.message, code: 500 });
  }
};

export const getTickets = async (req, res) => {
  try {
    const filter = {};
    const role = req.user.role?.toLowerCase();
    if (role === 'student') {
      filter.studentId = req.user.userId;
    } else if (role === 'teacher' || role === 'faculty' || role === 'admin') {
      filter.$or = [
        { assignedTo: req.user.userId },
        { status: 'pending' }
      ];
    }

    const tickets = await HelpTicket.find(filter)
      .populate('studentId', 'name studentId email avatar')
      .populate('assignedTo', 'name')
      .sort({ createdAt: -1 });
    
    res.json({ tickets });
  } catch (error) {
    res.status(500).json({ error: error.message, code: 500 });
  }
};

export const respondToTicket = async (req, res) => {
  try {
    const { response } = req.body;
    const ticket = await HelpTicket.findByIdAndUpdate(req.params.id, {
      response,
      status: 'responded',
      respondedAt: new Date(),
      assignedTo: req.user.userId
    }, { new: true })
      .populate('studentId', 'name studentId email avatar');

    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

    await createNotification(ticket.studentId._id, {
      type: 'info',
      title: 'Help Ticket Responded',
      message: `A teacher responded to your help ticket.`,
      link: '/student/help-desk'
    });

    try {
      const io = getIO();
      io.of('/student').to(ticket.studentId._id.toString()).emit('help:ticket_updated', ticket);
    } catch (e) {}

    res.json(ticket);
  } catch (error) {
    res.status(500).json({ error: error.message, code: 500 });
  }
};

export const resolveTicket = async (req, res) => {
  try {
    const ticket = await HelpTicket.findByIdAndUpdate(req.params.id, {
      status: 'resolved',
      resolvedAt: new Date()
    }, { new: true })
      .populate('studentId', 'name studentId email avatar');

    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

    try {
      const io = getIO();
      io.of('/student').to(ticket.studentId._id.toString()).emit('help:ticket_updated', ticket);
    } catch (e) {}

    res.json(ticket);
  } catch (error) {
    res.status(500).json({ error: error.message, code: 500 });
  }
};
