import React from 'react'

import { Navigate } from 'react-router-dom';
import { useAuth } from './Useauth';
function ProtectedRoute({children}) {
    const { loading, authenticated } = useAuth();
    if (loading) return <div>Checking authentication...</div>;
    if (!authenticated) return <Navigate to="/" replace />;
    return children;
}
export default ProtectedRoute