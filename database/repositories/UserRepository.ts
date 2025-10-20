/**
 * User Repository
 * Database operations for User entity
 */

import { Repository } from 'typeorm';
import bcrypt from 'bcryptjs';
import { getRepository } from '../config.js';
import { User } from '../entities/User.js';

export class UserRepository {
  private repository: Repository<User>;

  constructor() {
    this.repository = getRepository(User) as Repository<User>;
  }

  /**
   * Create new user
   */
  async createUser(userData: {
    username: string;
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    role?: 'user' | 'admin' | 'premium';
  }): Promise<User> {
    const passwordHash = await bcrypt.hash(userData.password, 10);
    
    const user = this.repository.create({
      ...userData,
      passwordHash,
      role: userData.role || 'user'
    });

    return await this.repository.save(user);
  }

  /**
   * Find user by ID
   */
  async findById(id: string): Promise<User | null> {
    return await this.repository.findOne({ 
      where: { id },
      relations: ['profiles', 'sessions', 'measurements']
    });
  }

  /**
   * Find user by username
   */
  async findByUsername(username: string): Promise<User | null> {
    return await this.repository.findOne({ 
      where: { username }
    });
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    return await this.repository.findOne({ 
      where: { email }
    });
  }

  /**
   * Authenticate user
   */
  async authenticate(login: string, password: string): Promise<User | null> {
    // Try to find by username or email
    const user = await this.repository.findOne({
      where: [
        { username: login },
        { email: login }
      ]
    });

    if (!user) return null;

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) return null;

    // Update last login
    user.lastLoginAt = new Date();
    await this.repository.save(user);

    return user;
  }

  /**
   * Update user password
   */
  async updatePassword(userId: string, newPassword: string): Promise<boolean> {
    const passwordHash = await bcrypt.hash(newPassword, 10);
    const result = await this.repository.update(userId, { passwordHash });
    return result.affected === 1;
  }

  /**
   * Update user preferences
   */
  async updatePreferences(userId: string, preferences: Record<string, any>): Promise<boolean> {
    const result = await this.repository.update(userId, { 
      preferences: JSON.stringify(preferences) 
    });
    return result.affected === 1;
  }

  /**
   * Verify user email
   */
  async verifyEmail(userId: string): Promise<boolean> {
    const result = await this.repository.update(userId, { 
      emailVerified: true,
      verificationToken: undefined
    });
    return result.affected === 1;
  }

  /**
   * Set password reset token
   */
  async setResetToken(email: string, token: string, expiresAt: Date): Promise<boolean> {
    const result = await this.repository.update(
      { email },
      { 
        resetPasswordToken: token,
        resetPasswordExpires: expiresAt
      }
    );
    return result.affected === 1;
  }

  /**
   * Reset password using token
   */
  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    const user = await this.repository.findOne({
      where: { resetPasswordToken: token }
    });

    if (!user || !user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
      return false;
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    const result = await this.repository.update(user.id, {
      passwordHash,
      resetPasswordToken: undefined,
      resetPasswordExpires: undefined
    });

    return result.affected === 1;
  }

  /**
   * Update user status
   */
  async updateStatus(userId: string, status: 'active' | 'inactive' | 'banned'): Promise<boolean> {
    const result = await this.repository.update(userId, { status });
    return result.affected === 1;
  }

  /**
   * Get all users with pagination
   */
  async findAll(options: {
    page?: number;
    limit?: number;
    status?: 'active' | 'inactive' | 'banned';
    role?: 'user' | 'admin' | 'premium';
  } = {}): Promise<{ users: User[]; total: number }> {
    const { page = 1, limit = 20, status, role } = options;
    
    const queryBuilder = this.repository.createQueryBuilder('user');
    
    if (status) {
      queryBuilder.andWhere('user.status = :status', { status });
    }
    
    if (role) {
      queryBuilder.andWhere('user.role = :role', { role });
    }
    
    queryBuilder
      .orderBy('user.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [users, total] = await queryBuilder.getManyAndCount();
    
    return { users, total };
  }

  /**
   * Search users
   */
  async search(query: string, limit: number = 10): Promise<User[]> {
    return await this.repository
      .createQueryBuilder('user')
      .where('user.username LIKE :query OR user.email LIKE :query OR user.firstName LIKE :query OR user.lastName LIKE :query', {
        query: `%${query}%`
      })
      .andWhere('user.status = :status', { status: 'active' })
      .limit(limit)
      .getMany();
  }

  /**
   * Get user statistics
   */
  async getStatistics(): Promise<{
    total: number;
    active: number;
    inactive: number;
    banned: number;
    admins: number;
    premium: number;
    regular: number;
  }> {
    const [
      total,
      active,
      inactive,
      banned,
      admins,
      premium,
      regular
    ] = await Promise.all([
      this.repository.count(),
      this.repository.count({ where: { status: 'active' } }),
      this.repository.count({ where: { status: 'inactive' } }),
      this.repository.count({ where: { status: 'banned' } }),
      this.repository.count({ where: { role: 'admin' } }),
      this.repository.count({ where: { role: 'premium' } }),
      this.repository.count({ where: { role: 'user' } })
    ]);

    return {
      total,
      active,
      inactive,
      banned,
      admins,
      premium,
      regular
    };
  }

  /**
   * Delete user (soft delete by marking inactive)
   */
  async deleteUser(userId: string): Promise<boolean> {
    const result = await this.repository.update(userId, { 
      status: 'inactive',
      email: `deleted_${Date.now()}_${userId}@deleted.local`
    });
    return result.affected === 1;
  }
}