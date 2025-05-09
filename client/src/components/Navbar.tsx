import { Bell } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useContext } from "react";
import { RequestContext } from "@/contexts/RequestContext";

interface NavbarProps {
  isAdmin: boolean;
  toggleView: () => void;
}

export default function Navbar({ isAdmin, toggleView }: NavbarProps) {
  const { pendingRequests } = useContext(RequestContext);
  const pendingCount = pendingRequests.length;

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <span className="text-xl font-semibold text-gray-800">
              Request Approval System
            </span>
          </div>
          <div className="flex items-center space-x-4">
            {/* User / Admin Toggle */}
            <div className="flex items-center space-x-2">
              <span className={isAdmin ? "text-gray-500" : "text-primary font-medium"}>User</span>
              <button 
                onClick={toggleView} 
                className={`relative inline-flex h-6 w-11 items-center rounded-full ${isAdmin ? "bg-primary" : "bg-gray-300"}`}
              >
                <span 
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${isAdmin ? "translate-x-6" : "translate-x-1"}`}
                ></span>
              </button>
              <span className={isAdmin ? "text-primary font-medium" : "text-gray-500"}>Admin</span>
            </div>
            
            {/* Admin Notification Badge */}
            {isAdmin && (
              <div className="relative">
                <button className="p-1 rounded-full text-gray-600 hover:text-primary focus:outline-none">
                  <Bell className="h-5 w-5" />
                  {pendingCount > 0 && (
                    <span className="absolute top-0 right-0 h-5 w-5 rounded-full bg-danger flex items-center justify-center text-white text-xs font-semibold">
                      {pendingCount}
                    </span>
                  )}
                </button>
              </div>
            )}
            
            {/* Profile Placeholder */}
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                <span className="text-gray-600">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
