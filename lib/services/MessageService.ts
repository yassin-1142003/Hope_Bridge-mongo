import { getCollection } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { UserRole, canSendMessage } from "@/lib/roles";

export interface Message {
  _id: string;
  fromUserId: string;
  fromUserRole: UserRole;
  toUserId: string;
  toUserRole: UserRole;
  subject: string;
  content: string;
  attachments?: string[];
  isRead: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: Date;
  updatedAt: Date;
}

export interface NewMessage {
  fromUserId: string;
  fromUserRole: UserRole;
  toUserId: string;
  toUserRole: UserRole;
  subject: string;
  content: string;
  attachments?: string[];
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}

export class MessageService {
  async sendMessage(message: NewMessage): Promise<Message> {
    // Check if sender can send message to recipient
    if (!canSendMessage(message.fromUserRole, message.toUserRole)) {
      throw new Error(`Role '${message.fromUserRole}' cannot send messages to role '${message.toUserRole}'`);
    }

    const messagesCollection = await getCollection('messages');
    
    const newMessage = {
      ...message,
      isRead: false,
      priority: message.priority || 'medium',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await messagesCollection.insertOne(newMessage);
    
    return {
      _id: result.insertedId.toString(),
      ...newMessage
    };
  }

  async getMessagesForUser(
    userId: string, 
    userRole: UserRole,
    page: number = 1,
    limit: number = 20,
    filter: 'all' | 'sent' | 'received' | 'unread' = 'all'
  ): Promise<{ messages: Message[]; total: number }> {
    const messagesCollection = await getCollection('messages');
    
    const query: any = {};
    
    switch (filter) {
      case 'sent':
        query.fromUserId = userId;
        break;
      case 'received':
        query.toUserId = userId;
        break;
      case 'unread':
        query.toUserId = userId;
        query.isRead = false;
        break;
      default:
        query.$or = [
          { fromUserId: userId },
          { toUserId: userId }
        ];
    }

    const skip = (page - 1) * limit;
    
    const [messages, total] = await Promise.all([
      messagesCollection
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      messagesCollection.countDocuments(query)
    ]);

    return {
      messages: messages.map(msg => ({
        _id: msg._id.toString(),
        fromUserId: msg.fromUserId,
        fromUserRole: msg.fromUserRole,
        toUserId: msg.toUserId,
        toUserRole: msg.toUserRole,
        subject: msg.subject,
        content: msg.content,
        attachments: msg.attachments,
        isRead: msg.isRead,
        priority: msg.priority,
        createdAt: msg.createdAt,
        updatedAt: msg.updatedAt
      })),
      total
    };
  }

  async markAsRead(messageId: string, userId: string): Promise<Message | null> {
    const messagesCollection = await getCollection('messages');
    
    const result = await messagesCollection.updateOne(
      { 
        _id: new ObjectId(messageId),
        toUserId: userId // Only recipient can mark as read
      },
      { 
        $set: { isRead: true, updatedAt: new Date() }
      }
    );

    if (result.matchedCount === 0) return null;

    const message = await messagesCollection.findOne({ _id: new ObjectId(messageId) });
    
    if (!message) return null;

    return {
      _id: message._id.toString(),
      fromUserId: message.fromUserId,
      fromUserRole: message.fromUserRole,
      toUserId: message.toUserId,
      toUserRole: message.toUserRole,
      subject: message.subject,
      content: message.content,
      attachments: message.attachments,
      isRead: message.isRead,
      priority: message.priority,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt
    };
  }

  async deleteMessage(messageId: string, userId: string): Promise<boolean> {
    const messagesCollection = await getCollection('messages');
    
    const result = await messagesCollection.deleteOne({
      _id: new ObjectId(messageId),
      $or: [
        { fromUserId: userId }, // Sender can delete
        { toUserId: userId }    // Recipient can delete
      ]
    });

    return result.deletedCount > 0;
  }

  async getUnreadCount(userId: string): Promise<number> {
    const messagesCollection = await getCollection('messages');
    
    return await messagesCollection.countDocuments({
      toUserId: userId,
      isRead: false
    });
  }

  async getConversations(userId: string, userRole: UserRole): Promise<Array<{
    userId: string;
    userRole: UserRole;
    lastMessage: Message;
    unreadCount: number;
  }>> {
    const messagesCollection = await getCollection('messages');
    
    // Get all messages involving this user
    const messages = await messagesCollection
      .find({
        $or: [
          { fromUserId: userId },
          { toUserId: userId }
        ]
      })
      .sort({ createdAt: -1 })
      .toArray();

    // Group by conversation partner
    const conversations = new Map();
    
    for (const message of messages) {
      const partnerId = message.fromUserId === userId ? message.toUserId : message.fromUserId;
      const partnerRole = message.fromUserId === userId ? message.toUserRole : message.fromUserRole;
      
      if (!conversations.has(partnerId)) {
        conversations.set(partnerId, {
          userId: partnerId,
          userRole: partnerRole,
          lastMessage: null,
          unreadCount: 0
        });
      }
      
      const conversation = conversations.get(partnerId);
      
      if (!conversation.lastMessage) {
        conversation.lastMessage = {
          _id: message._id.toString(),
          fromUserId: message.fromUserId,
          fromUserRole: message.fromUserRole,
          toUserId: message.toUserId,
          toUserRole: message.toUserRole,
          subject: message.subject,
          content: message.content,
          attachments: message.attachments,
          isRead: message.isRead,
          priority: message.priority,
          createdAt: message.createdAt,
          updatedAt: message.updatedAt
        };
      }
      
      // Count unread messages
      if (message.toUserId === userId && !message.isRead) {
        conversation.unreadCount++;
      }
    }

    return Array.from(conversations.values());
  }

  async getAvailableRecipients(senderRole: UserRole): Promise<Array<{
    userId: string;
    userRole: UserRole;
    canReceive: boolean;
  }>> {
    const usersCollection = await getCollection('users');
    
    const users = await usersCollection
      .find({ isActive: true })
      .sort({ createdAt: -1 })
      .toArray();

    return users.map(user => ({
      userId: user._id.toString(),
      userRole: user.role,
      canReceive: canSendMessage(senderRole, user.role)
    }));
  }
}
