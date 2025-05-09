import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import UserView from "@/pages/UserView";
import AdminView from "@/pages/AdminView";
import Navbar from "@/components/Navbar";
import { RequestProvider } from "@/contexts/RequestContext";
import { useState } from "react";

function Router() {
  const [isAdmin, setIsAdmin] = useState(false);

  const toggleView = () => {
    setIsAdmin(prev => !prev);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar isAdmin={isAdmin} toggleView={toggleView} />
      
      <Switch>
        {isAdmin ? (
          <Route path="/" component={AdminView} />
        ) : (
          <Route path="/" component={UserView} />
        )}
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <RequestProvider>
          <Toaster />
          <Router />
        </RequestProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
