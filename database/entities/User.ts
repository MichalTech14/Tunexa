/**
 * Database Entity: User
 * User account management with authentication
 */

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, Index } from 'typeorm';

@Entity('users')
@Index(['email']) // Index for login/authentication (already unique)
@Index(['username']) // Index for username lookups (already unique)
@Index(['status', 'createdAt']) // Composite index for active users
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  username!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email!: string;

  @Column({ type: 'varchar', length: 255 })
  passwordHash!: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  firstName?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  lastName?: string;

  @Column({ type: 'varchar', length: 20, default: 'active' })
  status!: 'active' | 'inactive' | 'banned';

  @Column({ type: 'varchar', length: 20, default: 'user' })
  role!: 'user' | 'admin' | 'premium';

  @Column({ type: 'text', nullable: true })
  preferences?: string; // JSON string

  @Column({ type: 'datetime', nullable: true })
  lastLoginAt?: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  avatarUrl?: string;

  @Column({ type: 'boolean', default: false })
  emailVerified!: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  verificationToken?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  resetPasswordToken?: string;

  @Column({ type: 'datetime', nullable: true })
  resetPasswordExpires?: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  // Relations
  @OneToMany('UserProfile', 'user')
  profiles!: any[];

  @OneToMany('UserSession', 'user')
  sessions!: any[];

  @OneToMany('MeasurementRecord', 'user')
  measurements!: any[];

  // Methods
  getDisplayName(): string {
    if (this.firstName && this.lastName) {
      return `${this.firstName} ${this.lastName}`;
    }
    return this.username;
  }

  getPreferences(): Record<string, any> {
    if (!this.preferences) return {};
    try {
      return JSON.parse(this.preferences);
    } catch {
      return {};
    }
  }

  setPreferences(prefs: Record<string, any>): void {
    this.preferences = JSON.stringify(prefs);
  }

  isAdmin(): boolean {
    return this.role === 'admin';
  }

  isPremium(): boolean {
    return this.role === 'premium' || this.role === 'admin';
  }

  isActive(): boolean {
    return this.status === 'active';
  }
}