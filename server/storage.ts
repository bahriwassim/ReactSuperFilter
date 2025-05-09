import { 
  users, type User, type InsertUser,
  requests, type Request, type InsertRequest
} from "@shared/schema";
import { drizzle } from "drizzle-orm/neon-serverless";
import { neon } from "@neondatabase/serverless";
import { eq } from "drizzle-orm";

// Interface for the storage
export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Request methods
  createRequest(request: InsertRequest): Promise<Request>;
  getRequests(): Promise<Request[]>;
  getRequestsByStatus(status: string): Promise<Request[]>;
  updateRequestStatus(id: number, status: string): Promise<Request | undefined>;
}

// Memory storage implementation for development and testing
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private requestsData: Map<number, Request>;
  currentUserId: number;
  currentRequestId: number;

  constructor() {
    this.users = new Map();
    this.requestsData = new Map();
    this.currentUserId = 1;
    this.currentRequestId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createRequest(insertRequest: InsertRequest): Promise<Request> {
    const id = this.currentRequestId++;
    const now = new Date();
    const request: Request = { 
      ...insertRequest, 
      id,
      createdAt: now,
      updatedAt: now,
      status: insertRequest.status || 'pending',
      userName: insertRequest.userName || null,
      userId: insertRequest.userId || null
    };
    this.requestsData.set(id, request);
    return request;
  }

  async getRequests(): Promise<Request[]> {
    return Array.from(this.requestsData.values());
  }

  async getRequestsByStatus(status: string): Promise<Request[]> {
    return Array.from(this.requestsData.values()).filter(
      (request) => request.status === status
    );
  }

  async updateRequestStatus(id: number, status: string): Promise<Request | undefined> {
    const request = this.requestsData.get(id);
    if (request) {
      const updatedRequest = { 
        ...request, 
        status,
        updatedAt: new Date()
      };
      this.requestsData.set(id, updatedRequest);
      return updatedRequest;
    }
    return undefined;
  }
}

// Supabase storage implementation for production
export class SupabaseStorage implements IStorage {
  private db: ReturnType<typeof drizzle>;

  constructor() {
    // Ensure DATABASE_URL is available
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is not set");
    }
    
    try {
      // Vérifie que l'URL est au bon format (postgresql://...)
      const dbUrl = process.env.DATABASE_URL;
      if (!dbUrl.startsWith('postgresql://')) {
        throw new Error("DATABASE_URL should start with postgresql://");
      }
      
      // Créer la connexion
      const client = neon(dbUrl);
      this.db = drizzle(client);
    } catch (error) {
      console.error('Error connecting to database:', error);
      throw new Error('Failed to connect to database. Make sure the URL format is correct: postgresql://user:password@host.tld/dbname');
    }
  }

  async getUser(id: number): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(
      eq(users.id, id)
    );
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(
      eq(users.username, username)
    );
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await this.db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async createRequest(insertRequest: InsertRequest): Promise<Request> {
    const result = await this.db.insert(requests).values({
      ...insertRequest,
      status: insertRequest.status || 'pending',
      userName: insertRequest.userName || null,
      userId: insertRequest.userId || null
    }).returning();
    return result[0];
  }

  async getRequests(): Promise<Request[]> {
    return await this.db.select().from(requests).orderBy(requests.createdAt);
  }

  async getRequestsByStatus(status: string): Promise<Request[]> {
    return await this.db.select().from(requests)
      .where(eq(requests.status, status))
      .orderBy(requests.createdAt);
  }

  async updateRequestStatus(id: number, status: string): Promise<Request | undefined> {
    const result = await this.db.update(requests)
      .set({ 
        status, 
        updatedAt: new Date() 
      })
      .where(eq(requests.id, id))
      .returning();
    
    return result[0];
  }
}

// Export appropriate storage based on environment
export const storage = process.env.DATABASE_URL
  ? new SupabaseStorage()
  : new MemStorage();
