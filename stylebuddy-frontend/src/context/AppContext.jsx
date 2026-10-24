import React,{createContext,useContext,useMemo,useState} from "react";
const AppContext=createContext(null);
export function AppProvider({children}){
  const [closet,setCloset]=useState([]);
  const [currentOutfit,setCurrentOutfit]=useState(null);
  const [conversation,setConversation]=useState([]);
  const [uploadState,setUploadState]=useState({files:[],status:"idle"});
  const value=useMemo(()=>({closet,setCloset,currentOutfit,setCurrentOutfit,conversation,setConversation,uploadState,setUploadState}),[closet,currentOutfit,conversation,uploadState]);
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
export const useApp=()=>useContext(AppContext);