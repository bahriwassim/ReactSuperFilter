interface AdminTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  allCount: number;
}

export default function AdminTabs({ 
  activeTab, 
  setActiveTab,
  pendingCount,
  approvedCount,
  rejectedCount,
  allCount
}: AdminTabsProps) {
  return (
    <div className="border-b border-gray-200">
      <nav className="flex -mb-px space-x-8">
        <a 
          href="#" 
          onClick={(e) => {
            e.preventDefault();
            setActiveTab("pending");
          }} 
          className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
            activeTab === "pending" 
              ? "border-primary text-primary" 
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          Pending
          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            {pendingCount}
          </span>
        </a>
        
        <a 
          href="#" 
          onClick={(e) => {
            e.preventDefault();
            setActiveTab("approved");
          }} 
          className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
            activeTab === "approved" 
              ? "border-primary text-primary" 
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          Approved
          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            {approvedCount}
          </span>
        </a>
        
        <a 
          href="#" 
          onClick={(e) => {
            e.preventDefault();
            setActiveTab("rejected");
          }} 
          className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
            activeTab === "rejected" 
              ? "border-primary text-primary" 
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          Rejected
          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            {rejectedCount}
          </span>
        </a>
        
        <a 
          href="#" 
          onClick={(e) => {
            e.preventDefault();
            setActiveTab("all");
          }} 
          className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
            activeTab === "all" 
              ? "border-primary text-primary" 
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          All Requests
          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {allCount}
          </span>
        </a>
      </nav>
    </div>
  );
}
