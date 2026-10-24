import React from "react";
import {Routes,Route,Navigate} from "react-router-dom";
import {useAuth} from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AppShell from "./components/AppShell";
import Landing from "./pages/Landing";
import {Login,Register} from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import Closet from "./pages/Closet";
import GarmentDetails from "./pages/GarmentDetails";
import Stylist from "./pages/Stylist";
import OutfitGenerator from "./pages/OutfitGenerator";
import SavedOutfits from "./pages/SavedOutfits";
import Shop from "./pages/Shop";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";

function Protected({children}){return <ProtectedRoute><AppShell>{children}</AppShell></ProtectedRoute>}
export default function App(){const {user}=useAuth();return <Routes>
 <Route path="/" element={<Landing/>}/><Route path="/login" element={user?<Navigate to="/dashboard"/>:<Login/>}/><Route path="/register" element={user?<Navigate to="/dashboard"/>:<Register/>}/>
 <Route path="/onboarding" element={<Protected><Onboarding/></Protected>}/>
 <Route path="/dashboard" element={<Protected><Dashboard/></Protected>}/><Route path="/closet" element={<Protected><Closet/></Protected>}/><Route path="/closet/:id" element={<Protected><GarmentDetails/></Protected>}/>
 <Route path="/stylist" element={<Protected><Stylist/></Protected>}/><Route path="/outfit-generator" element={<Protected><OutfitGenerator/></Protected>}/><Route path="/outfits" element={<Protected><SavedOutfits/></Protected>}/><Route path="/shop" element={<Protected><Shop/></Protected>}/><Route path="/profile" element={<Protected><Profile/></Protected>}/><Route path="/settings" element={<Protected><Settings/></Protected>}/>
 <Route path="*" element={<Navigate to={user?"/dashboard":"/"}/>}/>
 </Routes> }