import React from "react";

export default function AmoaModeSelectionFixed() {
  // Cette page est maintenant redéfinie 
  if (typeof window !== "undefined") {
    window.location.href = "/amoa/new";
  }
  return <div>Redirection vers l'accueil...</div>;
}