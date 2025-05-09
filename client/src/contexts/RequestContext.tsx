import { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { PendingRequest } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import { subscribeToEvent, initWebSocket } from '@/lib/websocket';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';

interface RequestContextType {
  pendingRequests: PendingRequest[];
  approvedRequests: PendingRequest[];
  rejectedRequests: PendingRequest[];
  userSubmittedRequests: PendingRequest[];
  addUserRequest: (request: PendingRequest) => void;
  handleApproveRequest: (id: string) => void;
  handleRejectRequest: (id: string) => void;
}

export const RequestContext = createContext<RequestContextType>({
  pendingRequests: [],
  approvedRequests: [],
  rejectedRequests: [],
  userSubmittedRequests: [],
  addUserRequest: () => {},
  handleApproveRequest: () => {},
  handleRejectRequest: () => {},
});

interface RequestProviderProps {
  children: ReactNode;
}

export const RequestProvider = ({ children }: RequestProviderProps) => {
  const { toast } = useToast();
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [approvedRequests, setApprovedRequests] = useState<PendingRequest[]>([]);
  const [rejectedRequests, setRejectedRequests] = useState<PendingRequest[]>([]);
  const [userSubmittedRequests, setUserSubmittedRequests] = useState<PendingRequest[]>([]);

  // Fetch pending requests on mount
  useEffect(() => {
    const fetchPendingRequests = async () => {
      try {
        const response = await fetch('/api/pending-requests');
        if (response.ok) {
          const data = await response.json();
          setPendingRequests(data);
        }
      } catch (error) {
        console.error('Error fetching pending requests:', error);
      }
    };

    fetchPendingRequests();
  }, []);

  // Subscribe to WebSocket events for real-time updates
  useEffect(() => {
    let cleanupNewRequest: (() => void) | null = null;
    let cleanupApproved: (() => void) | null = null;
    let cleanupRejected: (() => void) | null = null;
    let cleanupInitialRequests: (() => void) | null = null;

    const setupWebSocket = async () => {
      // Initialize WebSocket connection
      await initWebSocket();
      
      // Handle initial requests data
      cleanupInitialRequests = subscribeToEvent('initial-requests', (data) => {
        if (data && data.pending && Array.isArray(data.pending)) {
          setPendingRequests(data.pending);
        }
      });
      
      // Subscribe to 'new-request' events
      cleanupNewRequest = subscribeToEvent('new-request', (data: PendingRequest) => {
        setPendingRequests(prev => [data, ...prev]);
        
        // Show notification for admins
        toast({
          title: "New Request",
          description: `A new request "${data.title}" has been submitted.`,
          variant: "default",
        });
      });

      // Subscribe to 'request-approved' events
      cleanupApproved = subscribeToEvent('request-approved', (data: PendingRequest) => {
        setPendingRequests(prev => prev.filter(req => req.id !== data.id));
        setApprovedRequests(prev => [data, ...prev]);
        
        // Update user's request list if it's their request
        setUserSubmittedRequests(prev => 
          prev.map(req => 
            req.id === data.id 
              ? { ...req, status: 'approved' } 
              : req
          )
        );
        
        // Invalidate queries to refresh data
        queryClient.invalidateQueries({ queryKey: ['/api/requests'] });
      });

      // Subscribe to 'request-rejected' events
      cleanupRejected = subscribeToEvent('request-rejected', (data: PendingRequest) => {
        setPendingRequests(prev => prev.filter(req => req.id !== data.id));
        setRejectedRequests(prev => [data, ...prev]);
        
        // Update user's request list if it's their request
        setUserSubmittedRequests(prev => 
          prev.map(req => 
            req.id === data.id 
              ? { ...req, status: 'rejected' } 
              : req
          )
        );
      });
    };

    setupWebSocket();

    // Cleanup subscriptions on unmount
    return () => {
      if (cleanupNewRequest) cleanupNewRequest();
      if (cleanupApproved) cleanupApproved();
      if (cleanupRejected) cleanupRejected();
      if (cleanupInitialRequests) cleanupInitialRequests();
    };
  }, [toast]);

  // Add a new user request
  const addUserRequest = useCallback((request: PendingRequest) => {
    setUserSubmittedRequests(prev => [request, ...prev]);
  }, []);

  // Handle approving a request
  const handleApproveRequest = useCallback(async (id: string) => {
    try {
      await apiRequest('POST', '/api/handle-decision', {
        id,
        action: 'approve'
      });
      
      toast({
        title: 'Request Approved',
        description: 'The request has been approved and stored in the database.',
        variant: 'default',
      });
    } catch (error) {
      console.error('Error approving request:', error);
      toast({
        title: 'Approval Failed',
        description: 'There was an error approving the request. Please try again.',
        variant: 'destructive',
      });
    }
  }, [toast]);

  // Handle rejecting a request
  const handleRejectRequest = useCallback(async (id: string) => {
    try {
      await apiRequest('POST', '/api/handle-decision', {
        id,
        action: 'reject'
      });
      
      toast({
        title: 'Request Rejected',
        description: 'The request has been rejected and will not be stored in the database.',
        variant: 'default',
      });
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast({
        title: 'Rejection Failed',
        description: 'There was an error rejecting the request. Please try again.',
        variant: 'destructive',
      });
    }
  }, [toast]);

  const value = {
    pendingRequests,
    approvedRequests,
    rejectedRequests,
    userSubmittedRequests,
    addUserRequest,
    handleApproveRequest,
    handleRejectRequest,
  };

  return (
    <RequestContext.Provider value={value}>
      {children}
    </RequestContext.Provider>
  );
};
