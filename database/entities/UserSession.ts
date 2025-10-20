/**
 * Database Entity: UserSession
 * Active user sessions with device tracking and profile binding
 */

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';

@Entity('user_sessions')
export class UserSession {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  userId!: string;

  @Column({ type: 'uuid' })
  deviceId!: string;

  @Column({ type: 'uuid', nullable: true })
  profileId?: string;

  @Column({ type: 'varchar', length: 20, default: 'active' })
  status!: 'active' | 'paused' | 'ended' | 'expired';

  @Column({ type: 'datetime' })
  startedAt!: Date;

  @Column({ type: 'datetime', nullable: true })
  endedAt?: Date;

  @Column({ type: 'datetime', nullable: true })
  lastActivityAt?: Date;

  @Column({ type: 'integer', default: 0 })
  durationSeconds!: number;

  @Column({ type: 'text', nullable: true })
  activities?: string; // JSON array of session activities

  @Column({ type: 'varchar', length: 45, nullable: true })
  ipAddress?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  location?: string;

  @Column({ type: 'text', nullable: true })
  metadata?: string; // JSON string for additional session data

  @Column({ type: 'boolean', default: false })
  isLocked!: boolean;

  @Column({ type: 'integer', default: 0 })
  lockAttempts!: number;

  @Column({ type: 'datetime', nullable: true })
  lockedAt?: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  // Relations
  @ManyToOne('User')
  @JoinColumn({ name: 'userId' })
  user!: any;

  @ManyToOne('Device')
  @JoinColumn({ name: 'deviceId' })
  device!: any;

  @ManyToOne('UserProfile', { nullable: true })
  @JoinColumn({ name: 'profileId' })
  profile?: any;

  // Methods
  getActivities(): Array<Record<string, any>> {
    if (!this.activities) return [];
    try {
      return JSON.parse(this.activities);
    } catch {
      return [];
    }
  }

  addActivity(activity: Record<string, any>): void {
    const activities = this.getActivities();
    activities.push({
      ...activity,
      timestamp: new Date().toISOString()
    });
    this.activities = JSON.stringify(activities);
    this.updateActivity();
  }

  getMetadata(): Record<string, any> {
    if (!this.metadata) return {};
    try {
      return JSON.parse(this.metadata);
    } catch {
      return {};
    }
  }

  setMetadata(data: Record<string, any>): void {
    this.metadata = JSON.stringify(data);
  }

  updateActivity(): void {
    this.lastActivityAt = new Date();
    if (this.status === 'active' && this.startedAt) {
      this.durationSeconds = Math.floor((Date.now() - this.startedAt.getTime()) / 1000);
    }
  }

  pause(): void {
    this.status = 'paused';
    this.updateActivity();
  }

  resume(): void {
    this.status = 'active';
    this.updateActivity();
  }

  end(): void {
    this.status = 'ended';
    this.endedAt = new Date();
    this.updateActivity();
  }

  lock(): void {
    this.isLocked = true;
    this.lockedAt = new Date();
    this.lockAttempts++;
  }

  unlock(): void {
    this.isLocked = false;
    this.lockedAt = undefined;
  }

  isActive(): boolean {
    return this.status === 'active' && !this.isLocked;
  }

  isExpired(timeoutMinutes: number = 30): boolean {
    if (!this.lastActivityAt) return true;
    const now = new Date();
    const elapsed = (now.getTime() - this.lastActivityAt.getTime()) / (1000 * 60);
    return elapsed > timeoutMinutes;
  }

  getDuration(): number {
    if (this.endedAt && this.startedAt) {
      return Math.floor((this.endedAt.getTime() - this.startedAt.getTime()) / 1000);
    }
    if (this.startedAt) {
      return Math.floor((Date.now() - this.startedAt.getTime()) / 1000);
    }
    return 0;
  }

  getDurationFormatted(): string {
    const seconds = this.getDuration();
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    }
    if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    }
    return `${secs}s`;
  }
}