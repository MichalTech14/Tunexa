/**
 * Database Entity: UserProfile  
 * User audio profiles with preferences and settings
 */

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from './User.js';
import { Device } from './Device.js';
import { UserSession } from './UserSession.js';

@Entity('user_profiles')
export class UserProfile {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'uuid' })
  userId!: string;

  @Column({ type: 'uuid', nullable: true })
  deviceId?: string;

  @Column({ type: 'text', nullable: true })
  audioSettings?: string; // JSON string for EQ, volume, etc.

  @Column({ type: 'text', nullable: true })
  spotifySettings?: string; // JSON string for Spotify preferences

  @Column({ type: 'text', nullable: true })
  vehicleSettings?: string; // JSON string for OEM integration settings

  @Column({ type: 'varchar', length: 20, default: 'none' })
  lockLevel!: 'none' | 'soft' | 'medium' | 'hard';

  @Column({ type: 'boolean', default: true })
  autoSwitch!: boolean;

  @Column({ type: 'boolean', default: true })
  syncAcrossDevices!: boolean;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ type: 'boolean', default: false })
  isDefault!: boolean;

  @Column({ type: 'text', nullable: true })
  tags?: string; // JSON array of tags

  @Column({ type: 'integer', default: 0 })
  usageCount!: number;

  @Column({ type: 'datetime', nullable: true })
  lastUsedAt?: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  // Relations
  @ManyToOne(() => User, user => user.profiles)
  @JoinColumn({ name: 'userId' })
  user!: User;

  @ManyToOne(() => Device, device => device.profiles, { nullable: true })
  @JoinColumn({ name: 'deviceId' })
  device?: Device;

  @OneToMany(() => UserSession, session => session.profile)
  sessions!: UserSession[];

  // Methods
  getAudioSettings(): Record<string, any> {
    if (!this.audioSettings) return {};
    try {
      return JSON.parse(this.audioSettings);
    } catch {
      return {};
    }
  }

  setAudioSettings(settings: Record<string, any>): void {
    this.audioSettings = JSON.stringify(settings);
  }

  getSpotifySettings(): Record<string, any> {
    if (!this.spotifySettings) return {};
    try {
      return JSON.parse(this.spotifySettings);
    } catch {
      return {};
    }
  }

  setSpotifySettings(settings: Record<string, any>): void {
    this.spotifySettings = JSON.stringify(settings);
  }

  getVehicleSettings(): Record<string, any> {
    if (!this.vehicleSettings) return {};
    try {
      return JSON.parse(this.vehicleSettings);
    } catch {
      return {};
    }
  }

  setVehicleSettings(settings: Record<string, any>): void {
    this.vehicleSettings = JSON.stringify(settings);
  }

  getTags(): string[] {
    if (!this.tags) return [];
    try {
      return JSON.parse(this.tags);
    } catch {
      return [];
    }
  }

  setTags(tags: string[]): void {
    this.tags = JSON.stringify(tags);
  }

  incrementUsage(): void {
    this.usageCount = (this.usageCount || 0) + 1;
    this.lastUsedAt = new Date();
  }

  isLocked(): boolean {
    return this.lockLevel !== 'none';
  }

  canAutoSwitch(): boolean {
    return this.autoSwitch && this.isActive;
  }
}