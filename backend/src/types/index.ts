export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

import { Request } from 'express';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export interface CreateCampaignData {
  name: string;
  description?: string;
  tags?: string[];
  subject: string;
  content: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  senderId?: string;
  scheduledAt?: Date;
  recipients: Array<{
    email: string;
    firstName?: string;
    lastName?: string;
  }>;
}

export interface UpdateCampaignData {
  name?: string;
  description?: string;
  tags?: string[];
  subject?: string;
  content?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  senderId?: string;
  scheduledAt?: Date;
  status?: string;
}