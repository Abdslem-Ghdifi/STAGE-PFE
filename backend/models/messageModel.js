const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    id: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'senderRole' },
    role: { type: String, enum: ['apprenant', 'formateur', 'expert', 'admin'], required: true }
  },
  recipient: {
    id: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'recipientRole' },
    role: { type: String, enum: ['apprenant','admin', 'formateur', 'expert'], required: true }
  },
  subject: { type: String, required: true },
  body: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', messageSchema);