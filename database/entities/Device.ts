/**
 * Database Entity: Device
 * Physical devices (phones, tablets, car systems) with hardware fingerprinting
 */

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { UserProfile } from './UserProfile.js';
import { UserSession } from './UserSession.js';

@Entity('devices')
export class Device {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 17, unique: true })
  macAddress!: string; // Primary device identifier

  @Column({ type: 'varchar', length: 100 })
  deviceName!: string;

  @Column({ type: 'varchar', length: 50 })
  deviceType!: 'smartphone' | 'tablet' | 'laptop' | 'infotainment' | 'car_system' | 'other';

  @Column({ type: 'varchar', length: 100, nullable: true })
  manufacturer?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  model?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  operatingSystem?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  osVersion?: string;

  @Column({ type: 'text', nullable: true })
  userAgent?: string;

  @Column({ type: 'text', nullable: true })
  capabilities?: string; // JSON string of device capabilities

  @Column({ type: 'varchar', length: 20, default: 'active' })
  status!: 'active' | 'inactive' | 'blocked';

  @Column({ type: 'boolean', default: false })
  isTrusted!: boolean;

  @Column({ type: 'text', nullable: true })
  fingerprint?: string; // Hardware fingerprint hash

  @Column({ type: 'varchar', length: 100, nullable: true })
  location?: string; // Last known location

  @Column({ type: 'datetime', nullable: true })
  lastSeenAt?: Date;

  @Column({ type: 'varchar', length: 45, nullable: true })
  lastIpAddress?: string;

  @Column({ type: 'integer', default: 0 })
  sessionCount!: number;

  @Column({ type: 'integer', default: 0 })
  totalUsageMinutes!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  // Relations
  @OneToMany(() => UserProfile, profile => profile.device)
  profiles!: UserProfile[];

  @OneToMany(() => UserSession, session => session.device)
  sessions!: UserSession[];

  // Methods
  getCapabilities(): Record<string, any> {
    if (!this.capabilities) return {};
    try {
      return JSON.parse(this.capabilities);
    } catch {
      return {};
    }
  }

  setCapabilities(caps: Record<string, any>): void {
    this.capabilities = JSON.stringify(caps);
  }

  isActive(): boolean {
    return this.status === 'active';
  }

  isBlocked(): boolean {
    return this.status === 'blocked';
  }

  updateActivity(ipAddress?: string, location?: string): void {
    this.lastSeenAt = new Date();
    if (ipAddress) this.lastIpAddress = ipAddress;
    if (location) this.location = location;
  }

  incrementUsage(minutes: number = 0): void {
    this.sessionCount++;
    this.totalUsageMinutes += minutes;
  }

  generateFingerprint(additionalData: Record<string, any> = {}): string {
    const data = {
      mac: this.macAddress,
      type: this.deviceType,
      manufacturer: this.manufacturer,
      model: this.model,
      os: this.operatingSystem,
      osVersion: this.osVersion,
      ...additionalData
    };
    
    // Simple hash generation (in production, use a proper crypto library)
    return Buffer.from(JSON.stringify(data)).toString('base64').slice(0, 32);
  }

  updateFingerprint(additionalData: Record<string, any> = {}): void {
    this.fingerprint = this.generateFingerprint(additionalData);
  }

  getDisplayName(): string {
    if (this.manufacturer && this.model) {
      return `${this.manufacturer} ${this.model}`;
    }
    return this.deviceName;
  }

  isCarSystem(): boolean {
    return this.deviceType === 'car_system' || this.deviceType === 'infotainment';
  }

  isMobileDevice(): boolean {
    return this.deviceType === 'smartphone' || this.deviceType === 'tablet';
  }
}