import React from "react";
import {Navigate,useLocation} from "react-router-dom";
import {useAuth} from "../context/AuthContext";
export default function ProtectedRoute({children}){
 const {user,loading}=useAuth(); const loc=useLocation();
 if(loading) return <div className="screen-center"><div className="spinner"/></div>;
 return user ? children : <Navigate to="/login" replace state={{from:loc.pathname}} />;
}