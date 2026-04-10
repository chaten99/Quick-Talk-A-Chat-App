import swaggerJSDoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Quick Talk API",
      version: "1.0.0",
      description: "Detailed API documentation for authentication, profile management, friendships, conversations, messages, notifications, and Google OAuth in Quick Talk.",
    },
    servers: [
      {
        url: "/api",
        description: "Relative API base URL",
      },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "token",
        },
      },
      schemas: {
        SuccessResponse: {
          type: "object",
          required: ["success", "message"],
          properties: {
            success: {
              type: "boolean",
              example: true,
            },
            message: {
              type: "string",
              example: "Request completed successfully",
            },
          },
        },
        ErrorResponse: {
          type: "object",
          required: ["success", "message"],
          properties: {
            success: {
              type: "boolean",
              example: false,
            },
            message: {
              type: "string",
              example: "Something went wrong",
            },
            stack: {
              type: "string",
              description: "Returned in development mode only.",
            },
            details: {
              oneOf: [
                {
                  type: "array",
                  items: {
                    type: "string",
                  },
                },
                {
                  type: "object",
                  additionalProperties: true,
                },
              ],
            },
          },
        },
        AuthUser: {
          type: "object",
          required: ["id", "email", "username", "avatar", "phone", "authProvider", "friendsCount", "createdAt"],
          properties: {
            id: {
              type: "string",
              example: "67f4d3b1f0be2ea0d8f915aa",
            },
            email: {
              type: "string",
              format: "email",
              example: "john@example.com",
            },
            username: {
              type: "string",
              example: "john_doe",
            },
            avatar: {
              type: "string",
              example: "https://res.cloudinary.com/demo/image/upload/v1/avatar.jpg",
            },
            phone: {
              type: "string",
              example: "+91 98765 43210",
            },
            authProvider: {
              type: "string",
              enum: ["local", "google"],
              example: "local",
            },
            friendsCount: {
              type: "integer",
              example: 12,
            },
            createdAt: {
              type: "string",
              format: "date-time",
              example: "2026-04-09T10:10:00.000Z",
            },
          },
        },
        PublicUser: {
          type: "object",
          required: ["_id", "username"],
          properties: {
            _id: {
              type: "string",
              example: "67f4d3b1f0be2ea0d8f915aa",
            },
            username: {
              type: "string",
              example: "john_doe",
            },
            email: {
              type: "string",
              format: "email",
              example: "john@example.com",
            },
            avatar: {
              type: "string",
              example: "https://res.cloudinary.com/demo/image/upload/v1/avatar.jpg",
            },
            phone: {
              type: "string",
              example: "+91 98765 43210",
            },
            is_online: {
              type: "boolean",
              example: true,
            },
            last_seen: {
              type: "string",
              format: "date-time",
              example: "2026-04-09T10:10:00.000Z",
            },
          },
        },
        FriendRequest: {
          type: "object",
          required: ["_id", "sender_id", "receiver_id", "status", "createdAt", "updatedAt"],
          properties: {
            _id: {
              type: "string",
              example: "67f4d58bf0be2ea0d8f91601",
            },
            sender_id: {
              $ref: "#/components/schemas/PublicUser",
            },
            receiver_id: {
              $ref: "#/components/schemas/PublicUser",
            },
            status: {
              type: "string",
              enum: ["pending", "accepted", "rejected"],
              example: "pending",
            },
            rejected_at: {
              type: "string",
              format: "date-time",
              nullable: true,
            },
            createdAt: {
              type: "string",
              format: "date-time",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
            },
          },
        },
        MessageSeen: {
          type: "object",
          properties: {
            user_id: {
              $ref: "#/components/schemas/PublicUser",
            },
            seen_at: {
              type: "string",
              format: "date-time",
            },
          },
        },
        Message: {
          type: "object",
          required: ["_id", "conversation_id", "sender_id", "content", "message_type", "status", "createdAt", "updatedAt"],
          properties: {
            _id: {
              type: "string",
            },
            conversation_id: {
              type: "string",
            },
            sender_id: {
              $ref: "#/components/schemas/PublicUser",
            },
            content: {
              type: "string",
              example: "Hey, how are you?",
            },
            message_type: {
              type: "string",
              enum: ["text", "file"],
              example: "text",
            },
            status: {
              type: "string",
              enum: ["sent", "delivered", "read"],
              example: "read",
            },
            seen_by: {
              type: "array",
              items: {
                $ref: "#/components/schemas/MessageSeen",
              },
            },
            createdAt: {
              type: "string",
              format: "date-time",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
            },
          },
        },
        Conversation: {
          type: "object",
          required: ["_id", "is_group", "is_direct", "unread_count", "updatedAt"],
          properties: {
            _id: {
              type: "string",
            },
            is_group: {
              type: "boolean",
              example: false,
            },
            is_direct: {
              type: "boolean",
              example: true,
            },
            group_name: {
              type: "string",
              nullable: true,
              example: "Weekend Plans",
            },
            group_avatar: {
              type: "string",
              nullable: true,
            },
            unread_count: {
              type: "integer",
              example: 2,
            },
            can_message: {
              type: "boolean",
              example: true,
            },
            last_message: {
              $ref: "#/components/schemas/Message",
            },
            friend: {
              $ref: "#/components/schemas/PublicUser",
            },
            members: {
              type: "array",
              items: {
                $ref: "#/components/schemas/PublicUser",
              },
            },
            member_count: {
              type: "integer",
              example: 3,
            },
            updatedAt: {
              type: "string",
              format: "date-time",
            },
          },
        },
        Notification: {
          type: "object",
          required: ["_id", "user_id", "type", "content", "is_read", "createdAt"],
          properties: {
            _id: {
              type: "string",
            },
            user_id: {
              type: "string",
            },
            from_user: {
              $ref: "#/components/schemas/PublicUser",
            },
            type: {
              type: "string",
              enum: ["friend_request", "friend_accepted", "friend_rejected", "message", "conversation"],
              example: "friend_request",
            },
            content: {
              type: "string",
              example: "john_doe sent you a friend request",
            },
            reference_id: {
              type: "string",
              nullable: true,
            },
            is_read: {
              type: "boolean",
              example: false,
            },
            createdAt: {
              type: "string",
              format: "date-time",
            },
          },
        },
        SignupRequest: {
          type: "object",
          required: ["username", "email", "password"],
          properties: {
            username: {
              type: "string",
              example: "john_doe",
            },
            email: {
              type: "string",
              format: "email",
              example: "john@example.com",
            },
            phone: {
              type: "string",
              example: "+91 98765 43210",
            },
            password: {
              type: "string",
              format: "password",
              example: "secret123",
            },
          },
        },
        LoginRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: {
              type: "string",
              format: "email",
              example: "john@example.com",
            },
            password: {
              type: "string",
              format: "password",
              example: "secret123",
            },
          },
        },
        EmailRequest: {
          type: "object",
          required: ["email"],
          properties: {
            email: {
              type: "string",
              format: "email",
              example: "john@example.com",
            },
          },
        },
        VerifyOtpRequest: {
          type: "object",
          required: ["email", "otp"],
          properties: {
            email: {
              type: "string",
              format: "email",
            },
            otp: {
              type: "string",
              example: "123456",
            },
          },
        },
        ResetPasswordRequest: {
          type: "object",
          required: ["email", "otp", "newPassword"],
          properties: {
            email: {
              type: "string",
              format: "email",
            },
            otp: {
              type: "string",
              example: "123456",
            },
            newPassword: {
              type: "string",
              format: "password",
              example: "newSecret123",
            },
          },
        },
        SendFriendRequestRequest: {
          type: "object",
          required: ["receiverId"],
          properties: {
            receiverId: {
              type: "string",
              example: "67f4d3b1f0be2ea0d8f915bb",
            },
          },
        },
        DirectConversationRequest: {
          type: "object",
          required: ["friendId"],
          properties: {
            friendId: {
              type: "string",
              example: "67f4d3b1f0be2ea0d8f915bb",
            },
          },
        },
        AddGroupMembersRequest: {
          type: "object",
          required: ["memberIds"],
          properties: {
            memberIds: {
              type: "array",
              items: {
                type: "string",
              },
              example: ["67f4d3b1f0be2ea0d8f915bb", "67f4d3b1f0be2ea0d8f915cc"],
            },
          },
        },
        SendMessageRequest: {
          type: "object",
          required: ["content"],
          properties: {
            content: {
              type: "string",
              example: "Hello from Quick Talk",
            },
          },
        },
        UpdateProfileRequest: {
          type: "object",
          required: ["username"],
          properties: {
            username: {
              type: "string",
              example: "john_doe_updated",
            },
          },
        },
        PaginatedConversationsData: {
          type: "object",
          properties: {
            conversations: {
              type: "array",
              items: {
                $ref: "#/components/schemas/Conversation",
              },
            },
            hasMore: {
              type: "boolean",
              example: false,
            },
            page: {
              type: "integer",
              example: 1,
            },
          },
        },
        PaginatedMessagesData: {
          type: "object",
          properties: {
            messages: {
              type: "array",
              items: {
                $ref: "#/components/schemas/Message",
              },
            },
            hasMore: {
              type: "boolean",
              example: false,
            },
            page: {
              type: "integer",
              example: 1,
            },
          },
        },
        PaginatedFriendsData: {
          type: "object",
          properties: {
            friends: {
              type: "array",
              items: {
                $ref: "#/components/schemas/PublicUser",
              },
            },
            total: {
              type: "integer",
              example: 12,
            },
            page: {
              type: "integer",
              example: 1,
            },
            hasMore: {
              type: "boolean",
              example: false,
            },
          },
        },
        SearchUsersData: {
          type: "object",
          properties: {
            users: {
              type: "array",
              items: {
                $ref: "#/components/schemas/PublicUser",
              },
            },
            hasMore: {
              type: "boolean",
              example: false,
            },
          },
        },
        PaginatedNotificationsData: {
          type: "object",
          properties: {
            notifications: {
              type: "array",
              items: {
                $ref: "#/components/schemas/Notification",
              },
            },
            hasMore: {
              type: "boolean",
              example: false,
            },
            page: {
              type: "integer",
              example: 1,
            },
          },
        },
        CountData: {
          type: "object",
          properties: {
            count: {
              type: "integer",
              example: 4,
            },
          },
        },
        AuthResponse: {
          allOf: [
            {
              $ref: "#/components/schemas/SuccessResponse",
            },
            {
              type: "object",
              properties: {
                data: {
                  $ref: "#/components/schemas/AuthUser",
                },
              },
            },
          ],
        },
        ConversationResponse: {
          allOf: [
            {
              $ref: "#/components/schemas/SuccessResponse",
            },
            {
              type: "object",
              properties: {
                data: {
                  $ref: "#/components/schemas/Conversation",
                },
              },
            },
          ],
        },
        ConversationListResponse: {
          allOf: [
            {
              $ref: "#/components/schemas/SuccessResponse",
            },
            {
              type: "object",
              properties: {
                data: {
                  $ref: "#/components/schemas/PaginatedConversationsData",
                },
              },
            },
          ],
        },
        MessageResponse: {
          allOf: [
            {
              $ref: "#/components/schemas/SuccessResponse",
            },
            {
              type: "object",
              properties: {
                data: {
                  $ref: "#/components/schemas/Message",
                },
              },
            },
          ],
        },
        MessageListResponse: {
          allOf: [
            {
              $ref: "#/components/schemas/SuccessResponse",
            },
            {
              type: "object",
              properties: {
                data: {
                  $ref: "#/components/schemas/PaginatedMessagesData",
                },
              },
            },
          ],
        },
        FriendsResponse: {
          allOf: [
            {
              $ref: "#/components/schemas/SuccessResponse",
            },
            {
              type: "object",
              properties: {
                data: {
                  $ref: "#/components/schemas/PaginatedFriendsData",
                },
              },
            },
          ],
        },
        SearchUsersResponse: {
          allOf: [
            {
              $ref: "#/components/schemas/SuccessResponse",
            },
            {
              type: "object",
              properties: {
                data: {
                  $ref: "#/components/schemas/SearchUsersData",
                },
              },
            },
          ],
        },
        FriendRequestResponse: {
          allOf: [
            {
              $ref: "#/components/schemas/SuccessResponse",
            },
            {
              type: "object",
              properties: {
                data: {
                  $ref: "#/components/schemas/FriendRequest",
                },
              },
            },
          ],
        },
        FriendRequestListResponse: {
          allOf: [
            {
              $ref: "#/components/schemas/SuccessResponse",
            },
            {
              type: "object",
              properties: {
                data: {
                  type: "array",
                  items: {
                    $ref: "#/components/schemas/FriendRequest",
                  },
                },
              },
            },
          ],
        },
        NotificationsResponse: {
          allOf: [
            {
              $ref: "#/components/schemas/SuccessResponse",
            },
            {
              type: "object",
              properties: {
                data: {
                  $ref: "#/components/schemas/PaginatedNotificationsData",
                },
              },
            },
          ],
        },
        CountResponse: {
          allOf: [
            {
              $ref: "#/components/schemas/SuccessResponse",
            },
            {
              type: "object",
              properties: {
                data: {
                  $ref: "#/components/schemas/CountData",
                },
              },
            },
          ],
        },
      },
    },
    security: [
      {
        cookieAuth: [],
      },
    ],
  },
  apis: ["./src/routes/*.js"],
};

export const swaggerSpecs = swaggerJSDoc(options);
