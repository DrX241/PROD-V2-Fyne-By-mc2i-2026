import { useLocation } from 'wouter';

export const useSearchParams = () => {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  
  // Obtention d'un paramètre spécifique
  const get = (param: string): string | null => {
    return searchParams.get(param);
  };
  
  // Construction d'une nouvelle URL avec des paramètres mis à jour
  const getNewURLWithParams = (params: Record<string, string>): string => {
    const newSearchParams = new URLSearchParams(window.location.search);
    
    for (const [key, value] of Object.entries(params)) {
      newSearchParams.set(key, value);
    }
    
    return `${location.split('?')[0]}?${newSearchParams.toString()}`;
  };
  
  // Suppression d'un paramètre
  const remove = (param: string): string => {
    const newSearchParams = new URLSearchParams(window.location.search);
    newSearchParams.delete(param);
    
    const newQueryString = newSearchParams.toString();
    return `${location.split('?')[0]}${newQueryString ? '?' + newQueryString : ''}`;
  };
  
  return {
    get,
    getNewURLWithParams,
    remove
  };
};

export default useSearchParams;