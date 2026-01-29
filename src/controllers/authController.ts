import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import {
  findUserByUsername,
  verifyPassword,
  createUser,
  updateUserPassword,
} from '../models/User.js';
import { getDataService } from '../services/services.js';
import { DataService } from '../services/dataService.js';
import { loginAttemptService } from '../services/loginAttemptService.js';

const dataService: DataService = getDataService();

// Default secret key - in production, use an environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';
const TOKEN_EXPIRY = '24h';

// Login user
export const login = async (req: Request, res: Response): Promise<void> => {
  // Validate request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, errors: errors.array() });
    return;
  }

  const { username, password } = req.body;
  const clientIp = req.ip || req.connection.remoteAddress || '';
  
  try {
    // 检查IP是否被锁定
    const ipCheck = loginAttemptService.checkIpAttempt(clientIp);
    if (ipCheck.locked) {
      console.warn(`IP ${clientIp} 被锁定，${ipCheck.remainingTime} 秒后重试`);
      res.status(429).json({
        success: false, 
        message: `请求过于频繁，请在 ${ipCheck.remainingTime} 秒后再试`
      });
      return;
    }
    
    // 检查用户是否被锁定，并获取延迟时间
    const userCheck = loginAttemptService.checkUserAttempt(username);
    if (userCheck.locked) {
      console.warn(`用户 ${username} 被锁定，${userCheck.remainingTime} 秒后重试`);
      res.status(429).json({
        success: false, 
        message: `账户暂时锁定，请在 ${userCheck.remainingTime} 秒后再试`
      });
      return;
    }
    
    // 应用渐进式延迟（防止暴力破解）
    if (userCheck.delay > 0) {
      await new Promise(resolve => setTimeout(resolve, userCheck.delay));
    }

    // Find user by username
    const user = findUserByUsername(username);

    // 无论用户是否存在，都使用相同的验证流程和时间（防止用户名枚举）
    let isPasswordValid = false;
    if (user) {
      // Verify password
      isPasswordValid = await verifyPassword(password, user.password);
    } else {
      // 用户不存在时，执行一个模拟的哈希验证操作以保持时间一致
      await new Promise(resolve => setTimeout(resolve, 100)); // 模拟密码验证时间
    }

    if (!isPasswordValid) {
      // 记录失败的登录尝试
      console.warn(`Failed login attempt for user: ${username} from IP: ${clientIp}`);
      res.status(401).json({ 
        success: false, 
        message: loginAttemptService.getSafeErrorMessage() 
      });
      return;
    }

    // 登录成功，重置登录尝试计数
    loginAttemptService.recordSuccess(username, clientIp);
    
    // Generate JWT token
    const payload = {
      user: {
        username: user!.username,
        isAdmin: user!.isAdmin || false,
      },
    };
    
    jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY }, (err, token) => {
      if (err) throw err;
      res.json({
        success: true,
        token,
        user: {
          username: user!.username,
          isAdmin: user!.isAdmin,
          permissions: dataService.getPermissions(user!),
        },
      });
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};

// Register new user
export const register = async (req: Request, res: Response): Promise<void> => {
  // Validate request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, errors: errors.array() });
    return;
  }

  const { username, password, isAdmin } = req.body;

  try {
    // Create new user
    const newUser = await createUser({ username, password, isAdmin });

    if (!newUser) {
      res.status(400).json({ success: false, message: 'User already exists' });
      return;
    }

    // Generate JWT token
    const payload = {
      user: {
        username: newUser.username,
        isAdmin: newUser.isAdmin || false,
      },
    };

    jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY }, (err, token) => {
      if (err) throw err;
      res.json({
        success: true,
        token,
        user: {
          username: newUser.username,
          isAdmin: newUser.isAdmin,
          permissions: dataService.getPermissions(newUser),
        },
      });
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get current user
export const getCurrentUser = (req: Request, res: Response): void => {
  try {
    // User is already attached to request by auth middleware
    const user = (req as any).user;

    res.json({
      success: true,
      user: {
        username: user.username,
        isAdmin: user.isAdmin,
        permissions: dataService.getPermissions(user),
      },
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Change password
export const changePassword = async (req: Request, res: Response): Promise<void> => {
  // Validate request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, errors: errors.array() });
    return;
  }

  const { currentPassword, newPassword } = req.body;
  const username = (req as any).user.username;

  try {
    // Find user by username
    const user = findUserByUsername(username);

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    // Verify current password
    const isPasswordValid = await verifyPassword(currentPassword, user.password);

    if (!isPasswordValid) {
      res.status(401).json({ success: false, message: 'Current password is incorrect' });
      return;
    }

    // Update the password
    const updated = await updateUserPassword(username, newPassword);

    if (!updated) {
      res.status(500).json({ success: false, message: 'Failed to update password' });
      return;
    }

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};