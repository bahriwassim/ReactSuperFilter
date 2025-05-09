import { useState, useEffect, useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import AdminTabs from "@/components/AdminTabs";
import RequestList from "@/components/RequestList";
import { RequestContext } from "@/contexts/RequestContext";

export default function AdminView() {
  const [activeTab, setActiveTab] = useState<string>("pending");
  const { toast } = useToast();
  const { 
    pendingRequests, 
    approvedRequests, 
    rejectedRequests,
    handleApproveRequest,
    handleRejectRequest
  } = useContext(RequestContext);

  // Get stored requests from database
  const { data: storedRequests = [], isLoading } = useQuery({
    queryKey: ["/api/requests"],
  });

  // Show notification when a new request comes in
  useEffect(() => {
    if (pendingRequests.length > 0) {
      const lastRequest = pendingRequests[0];
      
      // Check if this is a new request by using the browser's sessionStorage
      const notifiedRequests = JSON.parse(sessionStorage.getItem("notifiedRequests") || "[]");
      
      if (!notifiedRequests.includes(lastRequest.id)) {
        toast({
          title: "New Request",
          description: `"${lastRequest.title}" requires your review.`,
          variant: "info",
        });
        
        // Update notified requests
        sessionStorage.setItem(
          "notifiedRequests", 
          JSON.stringify([...notifiedRequests, lastRequest.id])
        );
      }
    }
  }, [pendingRequests, toast]);

  // Filter requests based on active tab
  const getFilteredRequests = () => {
    switch (activeTab) {
      case "pending":
        return pendingRequests;
      case "approved":
        return approvedRequests;
      case "rejected":
        return rejectedRequests;
      case "all":
        return [...pendingRequests, ...approvedRequests, ...rejectedRequests];
      default:
        return [];
    }
  };

  // Get message when no requests are available
  const getNoRequestsMessage = () => {
    switch (activeTab) {
      case "pending":
        return "There are no pending requests to review.";
      case "approved":
        return "No requests have been approved yet.";
      case "rejected":
        return "No requests have been rejected.";
      case "all":
        return "No requests have been submitted.";
      default:
        return "No requests found.";
    }
  };

  const filteredRequests = getFilteredRequests();
  
  return (
    <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      {/* Admin Tabs */}
      <AdminTabs 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        pendingCount={pendingRequests.length}
        approvedCount={approvedRequests.length}
        rejectedCount={rejectedRequests.length}
        allCount={pendingRequests.length + approvedRequests.length + rejectedRequests.length}
      />
      
      {/* Admin Content */}
      <div className="mt-6">
        {isLoading ? (
          <div className="text-center py-12">
            <svg className="animate-spin h-8 w-8 mx-auto text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="mt-2 text-gray-500">Loading requests...</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="text-center py-12">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No requests</h3>
            <p className="mt-1 text-sm text-gray-500">{getNoRequestsMessage()}</p>
          </div>
        ) : (
          <RequestList 
            requests={filteredRequests} 
            isAdmin={true}
            onApprove={handleApproveRequest}
            onReject={handleRejectRequest}
          />
        )}
      </div>
    </main>
  );
}
