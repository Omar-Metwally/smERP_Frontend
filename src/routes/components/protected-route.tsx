import { Navigate, Outlet } from 'react-router-dom';
import { useAuth, useRequireAuth } from 'src/contexts/AuthContext';

interface ProtectedRouteProps {
    children: React.ReactNode;
    fallback: JSX.Element
    requiredRole?: 'admin' | 'customer' | 'chief' | 'Chief';
}

function ProtectedRoute({ children, requiredRole, fallback }: ProtectedRouteProps) {
    const { isLoading } = useRequireAuth();
    const { user } = useAuth();

    if (isLoading) {
        return fallback;
    }

    if (!user) {
        return <Navigate to="/sign-in" replace />;
    }

    if (requiredRole && user.role.includes(requiredRole[0])) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
}

export default ProtectedRoute;