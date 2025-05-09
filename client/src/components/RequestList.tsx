import { PendingRequest } from "@shared/schema";
import RequestCard from "./RequestCard";

interface RequestListProps {
  requests: PendingRequest[];
  isAdmin: boolean;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
}

export default function RequestList({ 
  requests, 
  isAdmin, 
  onApprove, 
  onReject 
}: RequestListProps) {
  if (!requests || requests.length === 0) {
    return (
      <div className="text-gray-500 text-sm">
        No requests available.
      </div>
    );
  }

  return (
    <div className={isAdmin ? "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" : "space-y-4"}>
      {requests.map((request) => (
        <RequestCard
          key={request.id}
          request={request}
          isAdmin={isAdmin}
          onApprove={onApprove}
          onReject={onReject}
        />
      ))}
    </div>
  );
}
