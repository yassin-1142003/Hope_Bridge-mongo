import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { 
  createSuccessResponse, 
  createCreatedResponse, 
  createBadRequestResponse, 
  createUnauthorizedResponse, 
  createForbiddenResponse, 
  createNotFoundResponse, 
  handleApiError, 
  setCorsHeaders 
} from "@/lib/apiResponse";
import { UserRole, hasPermission } from "@/lib/roles";
import { MessageService } from "@/lib/services/MessageService";

const messageService = new MessageService();

// Handle OPTIONS method for CORS preflight
export async function OPTIONS() {
  const response = new NextResponse(null, { status: 204 });
  return setCorsHeaders(response);
}

// GET - Get messages for current user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return setCorsHeaders(createUnauthorizedResponse("Authentication required to access messages"));
    }

    const userRole = session.user.role as UserRole;
    const userId = session.user.id || session.user.email; // Use email as fallback
    
    if (!hasPermission(userRole, 'canReceiveMessages')) {
      return setCorsHeaders(createForbiddenResponse("Insufficient permissions to access messages"));
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const filter = searchParams.get("filter") as 'all' | 'sent' | 'received' | 'unread' || 'all';
    const conversations = searchParams.get("conversations") === "true";

    if (conversations) {
      const conversationsList = await messageService.getConversations(userId, userRole);
      return setCorsHeaders(createSuccessResponse(conversationsList));
    }

    const result = await messageService.getMessagesForUser(userId, userRole, page, limit, filter);
    
    return setCorsHeaders(createSuccessResponse({
      messages: result.messages,
      pagination: {
        page,
        limit,
        total: result.total,
        pages: Math.ceil(result.total / limit)
      }
    }));
    
  } catch (error) {
    console.error("Error getting messages:", error);
    return setCorsHeaders(handleApiError(error));
  }
}

// POST - Send new message
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return setCorsHeaders(createUnauthorizedResponse("Authentication required to send messages"));
    }

    const userRole = session.user.role as UserRole;
    const userId = session.user.id || session.user.email;
    
    if (!hasPermission(userRole, 'canSendMessages')) {
      return setCorsHeaders(createForbiddenResponse("Insufficient permissions to send messages"));
    }

    const body = await request.json();
    
    // Validate required fields
    if (!body.toUserId || !body.subject || !body.content) {
      return setCorsHeaders(createBadRequestResponse("Missing required fields: toUserId, subject, content"));
    }

    const message = await messageService.sendMessage({
      fromUserId: userId,
      fromUserRole: userRole,
      toUserId: body.toUserId,
      toUserRole: body.toUserRole,
      subject: body.subject,
      content: body.content,
      attachments: body.attachments,
      priority: body.priority || 'medium'
    });
    
    return setCorsHeaders(createCreatedResponse(message));
    
  } catch (error) {
    console.error("Error sending message:", error);
    
    if (error instanceof Error && error.message.includes("cannot send messages")) {
      return setCorsHeaders(createForbiddenResponse(error.message));
    }
    
    return setCorsHeaders(handleApiError(error));
  }
}
