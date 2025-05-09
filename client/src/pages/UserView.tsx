import { useState, useContext } from "react";
import { useToast } from "@/hooks/use-toast";
import RequestForm from "@/components/RequestForm";
import RequestList from "@/components/RequestList";
import { Card, CardContent } from "@/components/ui/card";
import { RequestContext } from "@/contexts/RequestContext";

export default function UserView() {
  const { toast } = useToast();
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const { userSubmittedRequests } = useContext(RequestContext);

  const onSubmitSuccess = () => {
    setSubmissionSuccess(true);
    
    toast({
      title: "Request Submitted",
      description: "Your request has been submitted and is awaiting admin approval.",
      variant: "success",
    });
    
    // Hide success message after 5 seconds
    setTimeout(() => {
      setSubmissionSuccess(false);
    }, 5000);
  };

  return (
    <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto">
        <Card className="bg-white shadow-sm border border-gray-200">
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold mb-6">Submit New Request</h2>
            
            {/* Success Message */}
            {submissionSuccess && (
              <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded relative" role="alert">
                <span className="block sm:inline">Your request has been submitted successfully and is awaiting admin approval.</span>
                <button 
                  onClick={() => setSubmissionSuccess(false)} 
                  className="absolute top-0 bottom-0 right-0 px-4 py-3"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path 
                      fillRule="evenodd" 
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" 
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            )}
            
            {/* Request Form */}
            <RequestForm onSubmitSuccess={onSubmitSuccess} />
          </CardContent>
        </Card>

        {/* User Submitted Requests */}
        <div className="mt-8">
          <h3 className="text-lg font-medium text-gray-700 mb-4">Your Recent Requests</h3>
          
          {userSubmittedRequests.length === 0 ? (
            <div className="text-gray-500 text-sm">
              You haven't submitted any requests yet.
            </div>
          ) : (
            <RequestList 
              requests={userSubmittedRequests} 
              isAdmin={false}
            />
          )}
        </div>
      </div>
    </main>
  );
}
