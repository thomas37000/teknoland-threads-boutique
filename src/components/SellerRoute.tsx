import { Navigate, useLocation } from "react-router-dom";
import { useSellerAccess } from "@/hooks/use-seller-access";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

const SellerRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const { loading, hasAccess } = useSellerAccess();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-tekno-blue"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (!hasAccess) {
    toast.error("Accès réservé aux vendeurs");
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default SellerRoute;
