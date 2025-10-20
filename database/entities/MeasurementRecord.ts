/**
 * Database Entity: MeasurementRecord
 * Audio measurement results and certification data
 */

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from './User.js';
import { Vehicle } from './Vehicle.js';

@Entity('measurement_records')
@Index(['userId', 'createdAt']) // Composite index for user's measurement history
@Index(['vehicleId', 'measurementType']) // Composite index for vehicle measurements by type
@Index(['status', 'createdAt']) // Index for filtering by status and time
@Index(['certificationStatus']) // Index for certification filtering
@Index(['createdAt']) // Index for time-based queries
export class MeasurementRecord {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', nullable: true })
  userId?: string;

  @Column({ type: 'uuid' })
  vehicleId!: string;

  @Column({ type: 'varchar', length: 50 })
  measurementType!: 'full' | 'frequency_response' | 'thd' | 'noise_floor' | 'power_output' | 'certification';

  @Column({ type: 'varchar', length: 20 })
  standard!: 'iso' | 'iec' | 'din' | 'custom';

  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status!: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

  @Column({ type: 'text' })
  configuration!: string; // JSON string of measurement configuration

  @Column({ type: 'text', nullable: true })
  results?: string; // JSON string of measurement results

  @Column({ type: 'text', nullable: true })
  certification?: string; // JSON string of certification data

  @Column({ type: 'varchar', length: 20, nullable: true })
  certificationStatus?: 'passed' | 'failed' | 'warning' | 'not_applicable';

  @Column({ type: 'float', nullable: true })
  overallScore?: number; // 0-100 certification score

  @Column({ type: 'text', nullable: true })
  issues?: string; // JSON array of issues found

  @Column({ type: 'text', nullable: true })
  recommendations?: string; // JSON array of recommendations

  @Column({ type: 'datetime', nullable: true })
  startedAt?: Date;

  @Column({ type: 'datetime', nullable: true })
  completedAt?: Date;

  @Column({ type: 'integer', default: 0 })
  durationSeconds!: number;

  @Column({ type: 'text', nullable: true })
  errorMessage?: string;

  @Column({ type: 'text', nullable: true })
  rawData?: string; // JSON string of raw measurement data

  @Column({ type: 'varchar', length: 255, nullable: true })
  reportPath?: string; // Path to generated report file

  @Column({ type: 'text', nullable: true })
  tags?: string; // JSON array of tags

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  // Relations
  @ManyToOne(() => User, user => user.measurements, { nullable: true })
  @JoinColumn({ name: 'userId' })
  user?: User;

  @ManyToOne(() => Vehicle, vehicle => vehicle.measurements)
  @JoinColumn({ name: 'vehicleId' })
  vehicle!: Vehicle;

  // Methods
  getConfiguration(): Record<string, any> {
    try {
      return JSON.parse(this.configuration);
    } catch {
      return {};
    }
  }

  setConfiguration(config: Record<string, any>): void {
    this.configuration = JSON.stringify(config);
  }

  getResults(): Record<string, any> {
    if (!this.results) return {};
    try {
      return JSON.parse(this.results);
    } catch {
      return {};
    }
  }

  setResults(results: Record<string, any>): void {
    this.results = JSON.stringify(results);
  }

  getCertification(): Record<string, any> {
    if (!this.certification) return {};
    try {
      return JSON.parse(this.certification);
    } catch {
      return {};
    }
  }

  setCertification(cert: Record<string, any>): void {
    this.certification = JSON.stringify(cert);
  }

  getIssues(): string[] {
    if (!this.issues) return [];
    try {
      return JSON.parse(this.issues);
    } catch {
      return [];
    }
  }

  setIssues(issues: string[]): void {
    this.issues = JSON.stringify(issues);
  }

  getRecommendations(): string[] {
    if (!this.recommendations) return [];
    try {
      return JSON.parse(this.recommendations);
    } catch {
      return [];
    }
  }

  setRecommendations(recommendations: string[]): void {
    this.recommendations = JSON.stringify(recommendations);
  }

  getRawData(): Record<string, any> {
    if (!this.rawData) return {};
    try {
      return JSON.parse(this.rawData);
    } catch {
      return {};
    }
  }

  setRawData(data: Record<string, any>): void {
    this.rawData = JSON.stringify(data);
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

  start(): void {
    this.status = 'running';
    this.startedAt = new Date();
  }

  complete(results: Record<string, any>, certification?: Record<string, any>): void {
    this.status = 'completed';
    this.completedAt = new Date();
    this.setResults(results);
    
    if (certification) {
      this.setCertification(certification);
      this.certificationStatus = certification.status || 'not_applicable';
      this.overallScore = certification.score || 0;
    }

    if (this.startedAt) {
      this.durationSeconds = Math.floor((Date.now() - this.startedAt.getTime()) / 1000);
    }
  }

  fail(errorMessage: string): void {
    this.status = 'failed';
    this.completedAt = new Date();
    this.errorMessage = errorMessage;

    if (this.startedAt) {
      this.durationSeconds = Math.floor((Date.now() - this.startedAt.getTime()) / 1000);
    }
  }

  cancel(): void {
    this.status = 'cancelled';
    this.completedAt = new Date();

    if (this.startedAt) {
      this.durationSeconds = Math.floor((Date.now() - this.startedAt.getTime()) / 1000);
    }
  }

  isCompleted(): boolean {
    return this.status === 'completed';
  }

  isFailed(): boolean {
    return this.status === 'failed';
  }

  isRunning(): boolean {
    return this.status === 'running';
  }

  isPassed(): boolean {
    return this.certificationStatus === 'passed';
  }

  getDurationFormatted(): string {
    const seconds = this.durationSeconds;
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