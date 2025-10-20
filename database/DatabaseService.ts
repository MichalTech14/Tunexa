/**
 * Database Service  
 * Main database service integrating with Tunexa modules
 */

import { initializeDatabase, closeDatabase, getRepository } from './config.js';
import { UserRepository } from './repositories/UserRepository.js';
import { User, UserProfile, Device, UserSession, MeasurementRecord, Vehicle } from './entities/index.js';
import { dbPerformanceAnalyzer } from './performance-analyzer.js';
import { dbConnectionManager, ConnectionMetrics, QueryPerformance } from './connection-manager.js';
import { 
  OptimizedUserRepository, 
  OptimizedVehicleRepository, 
  OptimizedMeasurementRepository 
} from './optimized-repositories.js';
import { getMigrationManager, MigrationManager } from './migration-manager.js';

export class DatabaseService {
  private static instance: DatabaseService;
  private isInitialized = false;

  // Standard Repositories
  public userRepo: UserRepository;
  public profileRepo: any;
  public deviceRepo: any;
  public sessionRepo: any;
  public measurementRepo: any;
  public vehicleRepo: any;

    // Enhanced repositories with optimization features
  public optimizedUserRepo!: OptimizedUserRepository;
  public optimizedVehicleRepo!: OptimizedVehicleRepository;
  public optimizedMeasurementRepo!: OptimizedMeasurementRepository;
  
  // Migration management
  public migrationManager!: MigrationManager;

  private constructor() {
    this.userRepo = new UserRepository();
  }

  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  /**
   * Initialize database service with enhanced connection management
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Initialize with enhanced connection manager
      await dbConnectionManager.initialize();
      
      // Initialize standard repositories using enhanced manager
      this.profileRepo = dbConnectionManager.getRepository(UserProfile);
      this.deviceRepo = dbConnectionManager.getRepository(Device);  
      this.sessionRepo = dbConnectionManager.getRepository(UserSession);
      this.measurementRepo = dbConnectionManager.getRepository(MeasurementRecord);
      this.vehicleRepo = dbConnectionManager.getRepository(Vehicle);

      // Initialize optimized repositories
      this.optimizedUserRepo = new OptimizedUserRepository(
        dbConnectionManager.getRepository(User), 
        'User'
      );
      this.optimizedVehicleRepo = new OptimizedVehicleRepository(
        dbConnectionManager.getRepository(Vehicle), 
        'Vehicle'
      );
      this.optimizedMeasurementRepo = new OptimizedMeasurementRepository(
        dbConnectionManager.getRepository(MeasurementRecord), 
        'MeasurementRecord'
      );

      // Initialize migration manager
      // this.migrationManager = getMigrationManager(await dbConnectionManager.initialize());
      // await this.migrationManager.initialize();
      // await this.migrationManager.loadMigrations();

      // Setup real-time query monitoring
      dbConnectionManager.addQueryListener((query) => {
        if (query.duration > 1000) {
          console.warn(`⚠️  Slow query detected: ${query.query.substring(0, 100)}... (${query.duration.toFixed(2)}ms)`);
        }
      });

      this.isInitialized = true;
      console.log('🗄️  Enhanced database service initialized with connection monitoring');
      
    } catch (error) {
      console.error('❌ Database service initialization failed:', error);
      throw error;
    }
  }

  /**
   * Close database connections
   */
  async close(): Promise<void> {
    if (!this.isInitialized) return;
    
    await closeDatabase();
    this.isInitialized = false;
    console.log('🗄️  Database service closed');
  }

  /**
   * Check if service is initialized
   */
  isReady(): boolean {
    return this.isInitialized;
  }

  // User methods
  async createUser(userData: {
    username: string;
    email: string; 
    password: string;
    firstName?: string;
    lastName?: string;
    role?: 'user' | 'admin' | 'premium';
  }): Promise<User> {
    return await this.userRepo.createUser(userData);
  }

  async findUserById(id: string): Promise<User | null> {
    return await this.userRepo.findById(id);
  }

  async authenticateUser(login: string, password: string): Promise<User | null> {
    return await this.userRepo.authenticate(login, password);
  }

  // Vehicle methods
  async findVehicleBySlug(slug: string): Promise<Vehicle | null> {
    if (!this.isInitialized) throw new Error('Database service not initialized');
    return await this.vehicleRepo.findOne({ where: { slug } });
  }

  async findAllVehicles(): Promise<Vehicle[]> {
    if (!this.isInitialized) throw new Error('Database service not initialized');
    return await this.vehicleRepo.find({
      where: { isActive: true },
      order: { brand: 'ASC', model: 'ASC' }
    });
  }

  async searchVehicles(query: string): Promise<Vehicle[]> {
    if (!this.isInitialized) throw new Error('Database service not initialized');
    return await this.vehicleRepo
      .createQueryBuilder('vehicle')
      .where('vehicle.brand LIKE :query OR vehicle.model LIKE :query', {
        query: `%${query}%`
      })
      .andWhere('vehicle.isActive = :active', { active: true })
      .orderBy('vehicle.brand', 'ASC')
      .addOrderBy('vehicle.model', 'ASC')
      .getMany();
  }

  // Profile methods
  async findProfilesByUserId(userId: string): Promise<UserProfile[]> {
    if (!this.isInitialized) throw new Error('Database service not initialized');
    return await this.profileRepo.find({
      where: { userId, isActive: true },
      relations: ['device'],
      order: { isDefault: 'DESC', name: 'ASC' }
    });
  }

  async createProfile(profileData: {
    name: string;
    description?: string;
    userId: string;
    deviceId?: string;
    audioSettings?: Record<string, any>;
    lockLevel?: 'none' | 'soft' | 'medium' | 'hard';
    isDefault?: boolean;
  }): Promise<UserProfile> {
    if (!this.isInitialized) throw new Error('Database service not initialized');
    
    const profile = this.profileRepo.create({
      ...profileData,
      audioSettings: profileData.audioSettings ? JSON.stringify(profileData.audioSettings) : undefined,
      usageCount: 0
    });
    
    return await this.profileRepo.save(profile);
  }

  // Device methods
  async findDeviceByMac(macAddress: string): Promise<Device | null> {
    if (!this.isInitialized) throw new Error('Database service not initialized');
    return await this.deviceRepo.findOne({ where: { macAddress } });
  }

  async createDevice(deviceData: {
    macAddress: string;
    deviceName: string;
    deviceType: 'smartphone' | 'tablet' | 'laptop' | 'infotainment' | 'car_system' | 'other';
    manufacturer?: string;
    model?: string;
    operatingSystem?: string;
    osVersion?: string;
    userAgent?: string;
  }): Promise<Device> {
    if (!this.isInitialized) throw new Error('Database service not initialized');
    
    const device = this.deviceRepo.create(deviceData);
    device.updateFingerprint();
    device.updateActivity();
    
    return await this.deviceRepo.save(device);
  }

  // Session methods
  async createSession(sessionData: {
    userId: string;
    deviceId: string;
    profileId?: string;
    ipAddress?: string;
    location?: string;
  }): Promise<UserSession> {
    if (!this.isInitialized) throw new Error('Database service not initialized');
    
    const session = this.sessionRepo.create({
      ...sessionData,
      startedAt: new Date(),
      lastActivityAt: new Date(),
      status: 'active'
    });
    
    return await this.sessionRepo.save(session);
  }

  async findActiveSessionsByUserId(userId: string): Promise<UserSession[]> {
    if (!this.isInitialized) throw new Error('Database service not initialized');
    return await this.sessionRepo.find({
      where: { userId, status: 'active' },
      relations: ['device', 'profile'],
      order: { lastActivityAt: 'DESC' }
    });
  }

  async endSession(sessionId: string): Promise<boolean> {
    if (!this.isInitialized) throw new Error('Database service not initialized');
    
    const session = await this.sessionRepo.findOne({ where: { id: sessionId } });
    if (!session) return false;
    
    session.end();
    await this.sessionRepo.save(session);
    return true;
  }

  // Measurement methods
  async createMeasurement(measurementData: {
    userId?: string;
    vehicleId: string;
    measurementType: 'full' | 'frequency_response' | 'thd' | 'noise_floor' | 'power_output' | 'certification';
    standard: 'iso' | 'iec' | 'din' | 'custom';
    configuration: Record<string, any>;
  }): Promise<MeasurementRecord> {
    if (!this.isInitialized) throw new Error('Database service not initialized');
    
    const measurement = this.measurementRepo.create({
      ...measurementData,
      configuration: JSON.stringify(measurementData.configuration),
      status: 'pending'
    });
    
    return await this.measurementRepo.save(measurement);
  }

  async findMeasurementsByVehicle(vehicleId: string): Promise<MeasurementRecord[]> {
    if (!this.isInitialized) throw new Error('Database service not initialized');
    return await this.measurementRepo.find({
      where: { vehicleId },
      relations: ['user', 'vehicle'],
      order: { createdAt: 'DESC' }
    });
  }

  async updateMeasurementResults(measurementId: string, results: Record<string, any>, certification?: Record<string, any>): Promise<boolean> {
    if (!this.isInitialized) throw new Error('Database service not initialized');
    
    const measurement = await this.measurementRepo.findOne({ where: { id: measurementId } });
    if (!measurement) return false;
    
    measurement.complete(results, certification);
    await this.measurementRepo.save(measurement);
    
    return true;
  }

  // Statistics methods
  async getDatabaseStats(): Promise<{
    users: number;
    devices: number; 
    profiles: number;
    sessions: number;
    measurements: number;
    vehicles: number;
  }> {
    if (!this.isInitialized) throw new Error('Database service not initialized');
    
    const [users, devices, profiles, sessions, measurements, vehicles] = await Promise.all([
      getRepository(User).count({ where: { status: 'active' } }),
      this.deviceRepo.count({ where: { status: 'active' } }),
      this.profileRepo.count({ where: { isActive: true } }),
      this.sessionRepo.count({ where: { status: 'active' } }),
      this.measurementRepo.count(),
      this.vehicleRepo.count({ where: { isActive: true } })
    ]);

    return {
      users,
      devices,
      profiles, 
      sessions,
      measurements,
      vehicles
    };
  }

  /**
   * Get User repository for advanced queries
   */
  public getUserRepository() {
    return getRepository(User);
  }

  /**
   * Get MeasurementRecord repository for advanced queries
   */
  public getMeasurementRepository() {
    return getRepository(MeasurementRecord);
  }

  /**
   * Get Vehicle repository for advanced queries
   */
  public getVehicleRepository() {
    return getRepository(Vehicle);
  }

  /**
   * Get Device repository for advanced queries
   */
  public getDeviceRepository() {
    return getRepository(Device);
  }

  /**
   * Get UserProfile repository for advanced queries
   */
  public getProfileRepository() {
    return getRepository(UserProfile);
  }

  /**
   * Get UserSession repository for advanced queries
   */
  public getSessionRepository() {
    return getRepository(UserSession);
  }

  /**
   * Get database connection metrics
   */
  public getConnectionMetrics(): ConnectionMetrics {
    return dbConnectionManager.getMetrics();
  }

  /**
   * Get database health status
   */
  public async getHealthStatus(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    connectionTime: number;
    metrics: ConnectionMetrics;
  }> {
    return await dbConnectionManager.healthCheck();
  }

  /**
   * Execute optimized query with performance tracking
   */
  public async executeOptimizedQuery<T = any>(query: string, parameters?: any[], useCache: boolean = true): Promise<T[]> {
    return await dbConnectionManager.executeOptimizedQuery<T>(query, parameters, useCache);
  }

  /**
   * Get query performance history
   */
  public getQueryHistory(limit: number = 100): QueryPerformance[] {
    return dbConnectionManager.getQueryHistory(limit);
  }

  /**
   * Get slow queries for analysis
   */
  public getSlowQueries(minDuration: number = 1000): QueryPerformance[] {
    return dbConnectionManager.getSlowQueries(minDuration);
  }

  /**
   * Generate database performance report
   */
  public generatePerformanceReport(): string {
    return dbConnectionManager.generateReport();
  }

  /**
   * Batch operations for improved performance
   */
  public async batchInsert<T>(repository: any, entities: T[], batchSize: number = 100): Promise<void> {
    const batches = [];
    for (let i = 0; i < entities.length; i += batchSize) {
      batches.push(entities.slice(i, i + batchSize));
    }

    console.log(`🔄 Processing ${entities.length} entities in ${batches.length} batches`);

    for (const [index, batch] of batches.entries()) {
      try {
        await repository.save(batch);
        console.log(`✅ Batch ${index + 1}/${batches.length} completed (${batch.length} items)`);
      } catch (error) {
        console.error(`❌ Batch ${index + 1} failed:`, error);
        throw error;
      }
    }
  }

  /**
   * Bulk delete with performance optimization
   */
  public async bulkDelete(repository: any, conditions: any): Promise<number> {
    const result = await repository.delete(conditions);
    console.log(`🗑️  Bulk delete completed: ${result.affected} records removed`);
    return result.affected;
  }
}

// Export singleton instance
export const databaseService = DatabaseService.getInstance();