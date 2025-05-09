// WebSocket client implementation
let wsClient: WebSocket | null = null;
const eventHandlers: Map<string, Set<(data: any) => void>> = new Map();

// Initialize the WebSocket connection
export function initWebSocket(): Promise<WebSocket | null> {
  return new Promise((resolve) => {
    if (wsClient && (wsClient.readyState === WebSocket.OPEN || wsClient.readyState === WebSocket.CONNECTING)) {
      resolve(wsClient);
      return;
    }

    // Close any existing connection
    if (wsClient) {
      wsClient.close();
    }

    // Create a new WebSocket connection
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    wsClient = new WebSocket(wsUrl);
    
    wsClient.onopen = () => {
      console.log("WebSocket connection established");
      resolve(wsClient);
    };
    
    wsClient.onclose = () => {
      console.log("WebSocket connection closed");
      
      // Auto-reconnect after a delay
      setTimeout(() => {
        initWebSocket();
      }, 3000);
    };
    
    wsClient.onerror = (error) => {
      console.error("WebSocket error:", error);
      resolve(null);
    };
    
    wsClient.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        const { type, data } = message;
        
        if (!type) return;
        
        // Call all registered event handlers for this event type
        const handlers = eventHandlers.get(type);
        if (handlers) {
          handlers.forEach(handler => handler(data));
        }
      } catch (error) {
        console.error("Error processing WebSocket message:", error);
      }
    };
  });
}

// Subscribe to WebSocket events
export function subscribeToEvent(eventType: string, callback: (data: any) => void) {
  if (!eventHandlers.has(eventType)) {
    eventHandlers.set(eventType, new Set());
  }
  
  const handlers = eventHandlers.get(eventType)!;
  handlers.add(callback);
  
  // Return an unsubscribe function
  return () => {
    handlers.delete(callback);
    if (handlers.size === 0) {
      eventHandlers.delete(eventType);
    }
  };
}

// Check WebSocket connection status
export function getConnectionStatus(): boolean {
  return wsClient !== null && wsClient.readyState === WebSocket.OPEN;
}

// Get connected status
export async function checkConnection(): Promise<boolean> {
  try {
    const response = await fetch('/api/ws-status');
    const data = await response.json();
    return data.ready === true;
  } catch (error) {
    console.error('Error checking WebSocket status:', error);
    return false;
  }
}

// Initialize WebSocket connection immediately
initWebSocket();