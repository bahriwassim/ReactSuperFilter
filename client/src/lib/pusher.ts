import Pusher from 'pusher-js';

let pusherClient: Pusher | null = null;

async function initializePusher() {
  if (pusherClient) return pusherClient;
  
  try {
    // Fetch Pusher credentials from the server
    const response = await fetch('/api/pusher-credentials');
    if (!response.ok) {
      throw new Error('Failed to fetch Pusher credentials');
    }
    
    const { key, cluster } = await response.json();
    
    if (!key || !cluster) {
      throw new Error('Invalid Pusher credentials');
    }
    
    // Initialize Pusher client
    pusherClient = new Pusher(key, {
      cluster,
      forceTLS: true,
    });
    
    return pusherClient;
  } catch (error) {
    console.error('Error initializing Pusher:', error);
    return null;
  }
}

export async function subscribeToChannel(channelName: string, eventName: string, callback: (data: any) => void) {
  const pusher = await initializePusher();
  
  if (!pusher) {
    console.error('Pusher client not initialized');
    return null;
  }
  
  try {
    const channel = pusher.subscribe(channelName);
    channel.bind(eventName, callback);
    
    return () => {
      channel.unbind(eventName, callback);
      pusher.unsubscribe(channelName);
    };
  } catch (error) {
    console.error(`Error subscribing to ${channelName}:`, error);
    return null;
  }
}

export async function unsubscribeFromChannel(channelName: string) {
  const pusher = await initializePusher();
  
  if (!pusher) return;
  
  try {
    pusher.unsubscribe(channelName);
  } catch (error) {
    console.error(`Error unsubscribing from ${channelName}:`, error);
  }
}

export { initializePusher };
