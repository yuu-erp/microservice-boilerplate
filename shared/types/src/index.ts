export type UserId = string;
export type ChatId = string;
export type MessageId = string;

export interface JwtUser { sub: UserId; email: string; displayName?: string; }

export interface NewMessage { chatId: ChatId; text: string; }
export interface MessageDTO { id: MessageId; chatId: ChatId; senderId: UserId; text: string; sentAt: string; }
