import db from '../models/index.js'; // Correct the import path
const { Message, User, Request } = db;

export const sendMessage = async (req, res) => {
  try {
    const { requestId, content } = req.body;
    
    const message = await Message.create({
      content,
      senderId: req.user.id,
      requestId
    });

    // Real-time broadcast via WebSocket
    req.app.get('wss').clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({
          type: 'newMessage',
          data: message
        }));
      }
    });

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getRequestMessages = async (req, res) => {
  try {
    const messages = await Message.findAll({
      where: { requestId: req.params.requestId },
      include: [{ model: User, as: 'sender', attributes: ['id', 'firstName', 'lastName'] }],
      order: [['createdAt', 'ASC']]
    });
    
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
