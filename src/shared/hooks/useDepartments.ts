import { useState, useEffect } from "react";
import { Department } from "../types/Department"
import SharePointService from "../services/SharePointService";

export const useDepartments = () => {
    const [departments, setDepartments] = useState<Department[]>([]); 
    const [loading, setLoading] = useState<boolean>(false); 
    const [error, setError] = useState<string | null>(null); 
    


const fetchDepartments = async (): Promise<void> => { 
    try {
        setLoading(true);
        const data = await SharePointService.getDepartments();
        setDepartments(data);
        setError(null); 

        
    } catch (error) {
        setError("Failed to fetch departments"); 
        console.error("Error fetching departments:", error); 

        
    } finally { 
        setLoading(false); 
    }

}; 

useEffect(() => { 
     fetchDepartments().catch(console.error);
}, []); 
return { departments, loading, error };
}; 