import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { decisionSchema, insertRequestSchema, pendingRequestSchema } from "@shared/schema";
import { ZodError } from "zod";
import { WebSocketServer, WebSocket } from "ws";

// In-memory store for pending requests (not yet stored in database)
const pendingRequests = new Map<string, any>();
let nextPendingId = 1;

// WebSocket clients for real-time communication
const wsClients = new Set<WebSocket>();

export async function registerRoutes(app: Express): Promise<Server> {
  // WebSocket status endpoint
  app.get("/api/ws-status", (_req: Request, res: Response) => {
    res.json({
      connected: wsClients.size,
      ready: true,
    });
  });

  // Submit a new request (not stored in DB yet)
  app.post("/api/submit-request", async (req: Request, res: Response) => {
    try {
      // Validate the request data
      const pendingRequest = pendingRequestSchema.parse(req.body);
      
      // Generate a unique id for this pending request
      const id = `pending-${nextPendingId++}`;
      
      // Add timestamp
      const requestWithId = {
        ...pendingRequest,
        id,
        createdAt: new Date().toISOString(),
      };
      
      // Store in memory
      pendingRequests.set(id, requestWithId);
      
      // Notify admin of new request via WebSocket
      broadcastMessage("new-request", requestWithId);
      
      res.status(201).json({ id, message: "Request submitted for approval" });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ 
          message: "Invalid request data", 
          errors: error.errors.map(e => e.message).join(', ')
        });
      } else {
        console.error("Error submitting request:", error);
        res.status(500).json({ message: "Failed to submit request" });
      }
    }
  });

  // Get all pending requests (from memory)
  app.get("/api/pending-requests", (_req: Request, res: Response) => {
    const requests = Array.from(pendingRequests.values());
    res.json(requests);
  });

  // Handle admin decision (approve/reject)
  app.post("/api/handle-decision", async (req: Request, res: Response) => {
    try {
      // Validate the decision data
      const decision = decisionSchema.parse(req.body);
      
      // Check if the request exists
      const pendingRequest = pendingRequests.get(decision.id);
      if (!pendingRequest) {
        return res.status(404).json({ message: "Request not found" });
      }
      
      if (decision.action === "approve") {
        // Format for database
        const requestToStore = insertRequestSchema.parse({
          title: pendingRequest.title,
          details: pendingRequest.details,
          category: pendingRequest.category,
          priority: pendingRequest.priority,
          status: "approved",
          userName: pendingRequest.userName || "Anonymous",
          userId: pendingRequest.userId || null,
        });
        
        // Store in database
        const savedRequest = await storage.createRequest(requestToStore);
        
        // Notify via WebSocket about approved request
        broadcastMessage("request-approved", {
          ...pendingRequest,
          dbId: savedRequest.id,
          status: "approved"
        });
        
        res.json({ 
          message: "Request approved and stored",
          request: savedRequest
        });
      } else {
        // For rejected requests, just notify but don't store
        broadcastMessage("request-rejected", {
          ...pendingRequest,
          status: "rejected"
        });
        
        res.json({ 
          message: "Request rejected",
          request: { ...pendingRequest, status: "rejected" }
        });
      }
      
      // Remove from pending requests
      pendingRequests.delete(decision.id);
      
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ 
          message: "Invalid decision data", 
          errors: error.errors.map(e => e.message).join(', ')
        });
      } else {
        console.error("Error handling decision:", error);
        res.status(500).json({ message: "Failed to process decision" });
      }
    }
  });

  // Get stored requests (from database)
  app.get("/api/requests", async (_req: Request, res: Response) => {
    try {
      const requests = await storage.getRequests();
      res.json(requests);
    } catch (error) {
      console.error("Error fetching requests:", error);
      res.status(500).json({ message: "Failed to fetch requests" });
    }
  });

  // Get stored requests by status (from database)
  app.get("/api/requests/:status", async (req: Request, res: Response) => {
    try {
      const { status } = req.params;
      const requests = await storage.getRequestsByStatus(status);
      res.json(requests);
    } catch (error) {
      console.error(`Error fetching ${req.params.status} requests:`, error);
      res.status(500).json({ message: `Failed to fetch ${req.params.status} requests` });
    }
  });

  const httpServer = createServer(app);
  
  // Setup WebSocket server
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // Helper function to send messages to all connected WebSocket clients
  const broadcastMessage = (eventType: string, data: any) => {
    const message = JSON.stringify({ type: eventType, data });
    wsClients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  };
  
  wss.on('connection', (ws) => {
    console.log('WebSocket client connected');
    wsClients.add(ws);
    
    // Send initial pending requests to newly connected client
    const pendingArray = Array.from(pendingRequests.values());
    ws.send(JSON.stringify({ 
      type: 'initial-requests', 
      data: { 
        pending: pendingArray,
      }
    }));
    
    ws.on('close', () => {
      console.log('WebSocket client disconnected');
      wsClients.delete(ws);
    });
  });

  return httpServer;
}
