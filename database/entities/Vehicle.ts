/**
 * Database Entity: Vehicle
 * Vehicle information and audio system data
 */

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, Index } from 'typeorm';
import { MeasurementRecord } from './MeasurementRecord.js';

@Entity('vehicles')
@Index(['brand', 'model']) // Composite index for brand+model lookups
@Index(['brand']) // Single index for brand filtering  
@Index(['slug']) // Index for slug-based lookups (already unique)
@Index(['audioSystemBrand']) // Index for audio system brand filtering
export class Vehicle {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 50 })
  brand!: string;

  @Column({ type: 'varchar', length: 100 })
  model!: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  year?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  variant?: string;

  @Column({ type: 'varchar', length: 17, nullable: true })
  vin?: string; // Vehicle Identification Number

  @Column({ type: 'varchar', length: 100, unique: true })
  slug!: string; // URL-friendly identifier (e.g., "bmw-3-series")

  @Column({ type: 'text', nullable: true })
  audioSystem?: string; // JSON string of audio system specs

  @Column({ type: 'text', nullable: true })
  acousticData?: string; // JSON string from acoustics files

  @Column({ type: 'varchar', length: 100, nullable: true })
  audioSystemBrand?: string; // Harman Kardon, Bose, etc.

  @Column({ type: 'integer', nullable: true })
  speakerCount?: number;

  @Column({ type: 'integer', nullable: true })
  amplifierPower?: number; // Watts

  @Column({ type: 'boolean', default: false })
  hasSubwoofer!: boolean;

  @Column({ type: 'boolean', default: false })
  hasDSP!: boolean;

  @Column({ type: 'text', nullable: true })
  supportedProtocols?: string; // JSON array of OEM protocols

  @Column({ type: 'text', nullable: true })
  oemConfiguration?: string; // JSON string of OEM integration config

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ type: 'text', nullable: true })
  images?: string; // JSON array of image URLs

  @Column({ type: 'text', nullable: true })
  specifications?: string; // JSON object of detailed specs

  @Column({ type: 'text', nullable: true })
  tags?: string; // JSON array of tags

  @Column({ type: 'integer', default: 0 })
  measurementCount!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  // Relations
  @OneToMany(() => MeasurementRecord, measurement => measurement.vehicle)
  measurements!: MeasurementRecord[];

  // Methods
  getAudioSystem(): Record<string, any> {
    if (!this.audioSystem) return {};
    try {
      return JSON.parse(this.audioSystem);
    } catch {
      return {};
    }
  }

  setAudioSystem(system: Record<string, any>): void {
    this.audioSystem = JSON.stringify(system);
  }

  getAcousticData(): Record<string, any> {
    if (!this.acousticData) return {};
    try {
      return JSON.parse(this.acousticData);
    } catch {
      return {};
    }
  }

  setAcousticData(data: Record<string, any>): void {
    this.acousticData = JSON.stringify(data);
  }

  getSupportedProtocols(): string[] {
    if (!this.supportedProtocols) return [];
    try {
      return JSON.parse(this.supportedProtocols);
    } catch {
      return [];
    }
  }

  setSupportedProtocols(protocols: string[]): void {
    this.supportedProtocols = JSON.stringify(protocols);
  }

  getOEMConfiguration(): Record<string, any> {
    if (!this.oemConfiguration) return {};
    try {
      return JSON.parse(this.oemConfiguration);
    } catch {
      return {};
    }
  }

  setOEMConfiguration(config: Record<string, any>): void {
    this.oemConfiguration = JSON.stringify(config);
  }

  getImages(): string[] {
    if (!this.images) return [];
    try {
      return JSON.parse(this.images);
    } catch {
      return [];
    }
  }

  setImages(images: string[]): void {
    this.images = JSON.stringify(images);
  }

  getSpecifications(): Record<string, any> {
    if (!this.specifications) return {};
    try {
      return JSON.parse(this.specifications);
    } catch {
      return {};
    }
  }

  setSpecifications(specs: Record<string, any>): void {
    this.specifications = JSON.stringify(specs);
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

  getDisplayName(): string {
    const parts = [this.brand, this.model];
    if (this.year) parts.push(this.year);
    if (this.variant) parts.push(this.variant);
    return parts.join(' ');
  }

  hasPremiumAudio(): boolean {
    const premiumBrands = ['harman kardon', 'bose', 'bang & olufsen', 'meridian', 'mark levinson', 'burmester'];
    if (!this.audioSystemBrand) return false;
    return premiumBrands.includes(this.audioSystemBrand.toLowerCase());
  }

  supportsProtocol(protocol: string): boolean {
    const supported = this.getSupportedProtocols();
    return supported.includes(protocol.toUpperCase());
  }

  incrementMeasurementCount(): void {
    this.measurementCount++;
  }

  static generateSlug(brand: string, model: string): string {
    return `${brand}-${model}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  updateSlug(): void {
    this.slug = Vehicle.generateSlug(this.brand, this.model);
  }
}