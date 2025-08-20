import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/database';

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        company: true,
        jobTitle: true,
        department: true,
        location: true,
        timezone: true,
        bio: true,
        website: true,
        linkedin: true,
        twitter: true,
        avatar: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch profile' });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { 
      firstName, 
      lastName, 
      phone, 
      company, 
      jobTitle, 
      department, 
      location, 
      timezone, 
      bio, 
      website, 
      linkedin, 
      twitter 
    } = req.body;

    // Build update data object, only including provided fields
    const updateData: any = {};
    if (firstName !== undefined) updateData.firstName = firstName?.trim();
    if (lastName !== undefined) updateData.lastName = lastName?.trim();
    if (phone !== undefined) updateData.phone = phone?.trim();
    if (company !== undefined) updateData.company = company?.trim();
    if (jobTitle !== undefined) updateData.jobTitle = jobTitle?.trim();
    if (department !== undefined) updateData.department = department?.trim();
    if (location !== undefined) updateData.location = location?.trim();
    if (timezone !== undefined) updateData.timezone = timezone;
    if (bio !== undefined) updateData.bio = bio?.trim();
    if (website !== undefined) updateData.website = website?.trim();
    if (linkedin !== undefined) updateData.linkedin = linkedin?.trim();
    if (twitter !== undefined) updateData.twitter = twitter?.trim();

    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        company: true,
        jobTitle: true,
        department: true,
        location: true,
        timezone: true,
        bio: true,
        website: true,
        linkedin: true,
        twitter: true,
        avatar: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, error: 'Failed to update profile' });
  }
};

export const getSettings = async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        timezone: true,
        // Add other settings fields as needed
      }
    });

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Default settings structure
    const settings = {
      general: {
        timezone: user.timezone || 'UTC',
        dateFormat: 'MM/DD/YYYY',
        language: 'en',
        theme: 'light'
      },
      email: {
        defaultSendingLimit: 100,
        emailTrackingEnabled: true,
        autoUnsubscribeEnabled: true,
        bounceHandlingEnabled: true
      },
      notifications: {
        emailNotifications: true,
        campaignAlerts: true,
        weeklyReports: true,
        systemUpdates: false
      },
      api: {
        webhookUrl: '',
        apiRateLimit: 1000,
        enableApiLogging: true
      }
    };

    res.json({ success: true, data: settings });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch settings' });
  }
};

export const updateSettings = async (req: AuthRequest, res: Response) => {
  try {
    const { timezone, ...otherSettings } = req.body;

    // Update user timezone if provided
    if (timezone) {
      await prisma.user.update({
        where: { id: req.user!.id },
        data: { timezone }
      });
    }

    // Here you could store other settings in a separate settings table
    // For now, we'll just return success

    res.json({ success: true, message: 'Settings updated successfully' });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ success: false, error: 'Failed to update settings' });
  }
};

export const updatePassword = async (req: AuthRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, error: 'Current password and new password are required' });
    }

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id }
    });

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ success: false, error: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: req.user!.id },
      data: { password: hashedNewPassword }
    });

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({ success: false, error: 'Failed to update password' });
  }
};