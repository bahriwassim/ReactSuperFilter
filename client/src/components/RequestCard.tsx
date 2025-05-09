import { PendingRequest } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";
import StatusBadge from "./StatusBadge";

interface RequestCardProps {
  request: PendingRequest;
  isAdmin: boolean;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
}

export default function RequestCard({ 
  request, 
  isAdmin, 
  onApprove, 
  onReject 
}: RequestCardProps) {
  // Format date from ISO string
  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  const handleApprove = () => {
    if (onApprove && request.id) {
      onApprove(request.id);
    }
  };

  const handleReject = () => {
    if (onReject && request.id) {
      onReject(request.id);
    }
  };

  return isAdmin ? (
    <Card className="bg-white shadow-sm border border-gray-200">
      <CardContent className="p-5">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-medium text-gray-900">{request.title}</h3>
          <StatusBadge status={request.status || "pending"} />
        </div>
        
        <div className="mt-2">
          <p className="text-sm text-gray-600">{request.details}</p>
        </div>
        
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {request.category}
          </span>
          
          {request.priority === "low" && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              Low Priority
            </span>
          )}
          {request.priority === "medium" && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              Medium Priority
            </span>
          )}
          {request.priority === "high" && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
              High Priority
            </span>
          )}
        </div>
        
        <div className="mt-4 flex justify-between text-xs text-gray-500">
          <span>{`From: ${request.userName || 'Anonymous'}`}</span>
          <span>{formatDate(request.createdAt)}</span>
        </div>

        {/* Admin Actions */}
        {request.status === "pending" && (
          <div className="mt-4 flex space-x-3">
            <Button 
              onClick={handleApprove}
              variant="default" 
              className="flex-1 bg-success hover:bg-green-700 text-white"
            >
              <CheckCircle className="mr-1 h-4 w-4" /> Approve
            </Button>
            <Button 
              onClick={handleReject}
              variant="destructive" 
              className="flex-1"
            >
              <XCircle className="mr-1 h-4 w-4" /> Reject
            </Button>
          </div>
        )}
        
        {/* Status Information */}
        {request.status !== "pending" && (
          <div className="mt-4 border-t border-gray-200 pt-3 text-xs">
            {request.status === "approved" ? (
              <span className="text-success flex items-center">
                <CheckCircle className="mr-1 h-4 w-4" /> Approved and stored in database
              </span>
            ) : (
              <span className="text-destructive flex items-center">
                <XCircle className="mr-1 h-4 w-4" /> Rejected - not stored in database
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  ) : (
    <div className="border border-gray-200 rounded-md p-4 bg-white shadow-sm">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-medium text-gray-800">{request.title}</h4>
          <p className="text-sm text-gray-600 mt-1">{request.details}</p>
        </div>
        <StatusBadge status={request.status || "pending"} />
      </div>
      <div className="mt-3 text-xs text-gray-500 flex justify-between">
        <span>{`Category: ${request.category}`}</span>
        <span>{`Priority: ${request.priority}`}</span>
        <span>{`Submitted: ${formatDate(request.createdAt)}`}</span>
      </div>
    </div>
  );
}
