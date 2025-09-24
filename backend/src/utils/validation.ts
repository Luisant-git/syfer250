import Joi from 'joi';

export const authSchemas = {
  register: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    firstName: Joi.string().optional(),
    lastName: Joi.string().optional()
  }),
  
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  })
};

export const campaignSchemas = {
  create: Joi.object({
    name: Joi.string().required(),
    subject: Joi.string().required(),
    content: Joi.string().required(),
    senderId: Joi.string().allow('', null).optional(),
    scheduledAt: Joi.date().allow(null).optional(),
    scheduleType: Joi.string().valid('now', 'later', 'draft').optional(),
    recipients: Joi.array().items(
      Joi.object({
        email: Joi.string().email().required(),
        firstName: Joi.string().allow('').optional(),
        lastName: Joi.string().allow('').optional()
      })
    ).min(1).required()
  }),
  
  update: Joi.object({
    name: Joi.string().optional(),
    subject: Joi.string().optional(),
    content: Joi.string().optional(),
    senderId: Joi.string().allow('', null).optional(),
    scheduledAt: Joi.date().allow(null).optional(),
    status: Joi.string().valid('DRAFT', 'SCHEDULED', 'SENDING', 'SENT', 'PAUSED', 'CANCELLED').optional()
  })
};

export const senderSchemas = {
  create: Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().allow('', null).optional(),
    host: Joi.string().allow('', null).optional(),
    port: Joi.number().allow(null).optional(),
    imapHost: Joi.string().allow('', null).optional(),
    imapPort: Joi.number().allow(null).optional(),
    popHost: Joi.string().allow('', null).optional(),
    popPort: Joi.number().allow(null).optional(),
    useSSL: Joi.boolean().optional(),
    isVerified: Joi.boolean().optional(),
    provider: Joi.string().valid('SMTP', 'GMAIL', 'OUTLOOK', 'IMAP', 'POP3').optional(),
    accessToken: Joi.string().allow('', null).optional(),
    refreshToken: Joi.string().allow('', null).optional(),
    expiresAt: Joi.date().allow('', null).optional(),
    tenantId: Joi.string().allow('', null).optional(),
    scope: Joi.string().allow('', null).optional()
  })
};
