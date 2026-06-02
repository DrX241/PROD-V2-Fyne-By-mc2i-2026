import{c as Y,r as n,aj as K,j as e,ae as Q,ac as ee,B as l,A as g,_ as se,$ as te,a0 as N,J as ae,F as C,N as L,a1 as y,l as w,a2 as q,a4 as M,n as S,I as ie,v as F,ar as ne,ai as A,H as re,V as le,am as ce,X as oe,Y as me,C as ue,as as de,an as xe,ah as pe}from"./index-DWypS7Mv.js";import{S as P}from"./scroll-area-BcCvxxty.js";/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const he=Y("FileDown",[["path",{d:"M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z",key:"1rqfz7"}],["path",{d:"M14 2v4a2 2 0 0 0 2 2h4",key:"tnqrlb"}],["path",{d:"M12 18v-6",key:"17g6i2"}],["path",{d:"m9 15 3 3 3-3",key:"1npd3o"}]]);function je(){const[c,p]=n.useState(""),[d,h]=n.useState("intermediaire"),[x,b]=n.useState("resume"),[k,z]=n.useState(""),[T,D]=n.useState(!1),[r,v]=n.useState(null),[R,I]=n.useState(!1),[W,m]=n.useState("creation"),[f,E]=n.useState([{title:"Zero Trust",content:`# Mémo: Principes du Zero Trust

## Définition
Le Zero Trust est un modèle de sécurité basé sur le principe "ne jamais faire confiance, toujours vérifier". Il part du principe que les menaces existent à la fois à l'intérieur et à l'extérieur du réseau.

## Principes fondamentaux
1. **Vérification explicite** - Authentifier et autoriser toutes les demandes d'accès
2. **Moindre privilège** - Limiter l'accès au strict nécessaire
3. **Micro-segmentation** - Diviser le réseau en zones isolées
4. **Vérification continue** - Réévaluer régulièrement la confiance
5. **Accès basé sur l'identité** plutôt que sur l'emplacement réseau

## Technologies clés
- IAM avec authentification multifacteur
- Solutions d'accès réseau Zero Trust (ZTNA)
- Micro-segmentation
- Chiffrement des données
- Surveillance et analytique avancées

## Avantages
- Limitation du mouvement latéral des attaquants
- Protection adaptée au cloud et mobilité
- Sécurité cohérente pour le travail à distance
- Réduction de la surface d'attaque`,date:"12/05/2025"},{title:"Principes RGPD",content:`# Mémo: Principes clés du RGPD

## Les 7 principes fondamentaux
1. **Licéité, loyauté et transparence** - Traitement légal, équitable et transparent
2. **Limitation des finalités** - Collecte pour des objectifs spécifiques et légitimes
3. **Minimisation des données** - Uniquement les données nécessaires
4. **Exactitude** - Données exactes et mises à jour
5. **Limitation de conservation** - Stockage limité dans le temps
6. **Intégrité et confidentialité** - Sécurité appropriée
7. **Responsabilité** - Capacité à démontrer la conformité

## Droits des personnes concernées
- Droit d'accès
- Droit de rectification
- Droit à l'effacement ("droit à l'oubli")
- Droit à la limitation du traitement
- Droit à la portabilité
- Droit d'opposition
- Droits relatifs à la décision automatisée

## Obligations des organisations
- Désigner un DPO (dans certains cas)
- Tenir un registre des traitements
- Notifier les violations de données
- Mener des analyses d'impact (AIPD)
- Intégrer la protection des données dès la conception

## Sanctions
- Jusqu'à 20M€ ou 4% du CA mondial annuel`,date:"08/05/2025"}]),{toast:o}=K(),G=["Authentification multifacteur (MFA)","Ransomware","Sécurité du cloud","SIEM (Security Information and Event Management)","Analyse des risques cybersécurité","DevSecOps","Gestion des vulnérabilités","Social engineering"],V=()=>{if(!c.trim()){o({title:"Sujet requis",description:"Veuillez saisir un sujet pour générer un mémo.",variant:"destructive"});return}D(!0),v(null),setTimeout(()=>{const t=O(c,d,x,k);v(t),D(!1),m("resultat"),o({title:"Mémo généré avec succès !",description:"Votre mémo personnalisé est prêt.",variant:"default"})},3e3)},O=(t,a,i,u)=>{const J=`# Mémo: ${t}

`;let s="";return a==="debutant"?(s+=`## Concepts de base
`,s+=`${t} est un domaine important de la cybersécurité qui concerne la protection des systèmes et des données contre les menaces. Il s'agit d'une approche fondamentale pour maintenir la confidentialité, l'intégrité et la disponibilité des informations.

`,s+=`## Points essentiels à retenir
`,s+=`- La sensibilisation des utilisateurs est cruciale
`,s+=`- Une approche multicouche est recommandée
`,s+=`- Les mises à jour régulières sont importantes
`,s+=`- La sauvegarde des données est une pratique indispensable

`):a==="intermediaire"?(s+=`## Définition et contexte
`,s+=`${t} représente un ensemble de techniques et pratiques visant à protéger les systèmes d'information contre les accès non autorisés et les attaques. Cette approche s'inscrit dans une stratégie globale de défense en profondeur et nécessite une compréhension des vecteurs de menaces courants.

`,s+=`## Principes fondamentaux
`,s+=`1. **Défense en profondeur** - Multiple couches de sécurité
`,s+=`2. **Moindre privilège** - Accès limité au strict nécessaire
`,s+=`3. **Segmentation** - Isolation des composants critiques
`,s+=`4. **Surveillance continue** - Détection précoce des incidents

`,s+=`## Bonnes pratiques
`,s+=`- Mise en œuvre d'une politique de sécurité documentée
`,s+=`- Formation régulière du personnel
`,s+=`- Évaluations périodiques des risques
`,s+=`- Plan de réponse aux incidents testé régulièrement

`):(s+=`## Analyse approfondie
`,s+=`${t} constitue un domaine complexe de la cybersécurité qui nécessite une approche holistique intégrant des contrôles techniques, des processus organisationnels et des considérations liées au facteur humain. Les organisations doivent adopter une posture de sécurité adaptative face à l'évolution constante du paysage des menaces.

`,s+=`## Cadre méthodologique
`,s+=`1. **Évaluation des risques** - Identification systématique des menaces et vulnérabilités avec quantification des impacts potentiels
`,s+=`2. **Conception de l'architecture** - Élaboration d'une infrastructure résiliente intégrant des mécanismes de défense spécialisés
`,s+=`3. **Implémentation des contrôles** - Déploiement coordonné de mesures techniques et organisationnelles
`,s+=`4. **Surveillance et détection** - Mise en place de capacités avancées d'analyse comportementale et de corrélation d'événements
`,s+=`5. **Réponse et remédiation** - Protocoles d'intervention rapide et procédures de restauration sécurisée

`,s+=`## Considérations techniques avancées
`,s+=`- Orchestration et automatisation des contrôles de sécurité
`,s+=`- Intégration de capacités d'intelligence artificielle pour la détection d'anomalies
`,s+=`- Approche Zero Trust avec vérification explicite à chaque point d'accès
`,s+=`- Gestion cryptographique avancée des données sensibles

`),i==="resume"||(i==="ficheRecap"?(s+=`## À retenir
`,s+=`✅ Points clés à mémoriser
`,s+=`✅ Concepts fondamentaux
`,s+=`✅ Références importantes

`,s+=`## Pour aller plus loin
`,s+=`- Ressources recommandées
`,s+=`- Outils et frameworks associés
`,s+=`- Standards et bonnes pratiques

`):i==="mindmap"&&(s+=`## Structure en carte mentale

`,s+=`${t}
`,s+=`├── Définition
`,s+=`│   ├── Concepts clés
`,s+=`│   └── Objectifs principaux
`,s+=`├── Composants
`,s+=`│   ├── Élément 1
`,s+=`│   ├── Élément 2
`,s+=`│   └── Élément 3
`,s+=`└── Applications
`,s+=`    ├── Cas d'usage 1
`,s+=`    ├── Cas d'usage 2
`,s+=`    └── Bonnes pratiques

`)),u.trim()&&(s+=`## Points spécifiques
`,u.split(`
`).filter(j=>j.trim()).forEach((j,X)=>{s+=`${X+1}. ${j.trim()}
`})),J+s},$=()=>{r&&navigator.clipboard.writeText(r).then(()=>{I(!0),setTimeout(()=>I(!1),2e3),o({title:"Copié !",description:"Le mémo a été copié dans le presse-papier.",variant:"default"})},t=>{o({title:"Erreur",description:"Impossible de copier le texte: "+t,variant:"destructive"})})},B=()=>{if(!r)return;const t={title:c,content:r,date:new Date().toLocaleDateString("fr-FR")};E([t,...f]),o({title:"Mémo sauvegardé",description:"Votre mémo a été ajouté à votre bibliothèque.",variant:"default"})},Z=()=>{if(!r)return;const t=new Blob([r],{type:"text/markdown"}),a=URL.createObjectURL(t),i=document.createElement("a");i.href=a,i.download=`memo-${c.toLowerCase().replace(/\s+/g,"-")}.md`,document.body.appendChild(i),i.click(),document.body.removeChild(i),URL.revokeObjectURL(a),o({title:"Téléchargement démarré",description:"Votre mémo est en cours de téléchargement.",variant:"default"})},U=()=>e.jsxs("div",{className:"space-y-6",children:[e.jsxs(w,{className:"bg-blue-950/60 border-blue-800/60",children:[e.jsx(q,{children:e.jsx(M,{children:"Créer un mémo personnalisé"})}),e.jsxs(S,{className:"space-y-4",children:[e.jsxs("div",{children:[e.jsx("label",{className:"block text-sm font-medium text-blue-100 mb-1",htmlFor:"subject",children:"Sujet du mémo *"}),e.jsx(ie,{id:"subject",placeholder:"Ex: Authentification multifacteur (MFA)",value:c,onChange:t=>p(t.target.value),className:"bg-blue-900/30 border-blue-700/50 text-white placeholder:text-blue-400/60"}),e.jsxs("div",{className:"mt-2",children:[e.jsx("p",{className:"text-xs text-blue-400 mb-1",children:"Suggestions de sujets :"}),e.jsx("div",{className:"flex flex-wrap gap-2",children:G.map(t=>e.jsx(F,{className:"bg-blue-900/50 hover:bg-blue-800/70 text-blue-200 cursor-pointer",onClick:()=>p(t),children:t},t))})]})]}),e.jsxs("div",{children:[e.jsx("label",{className:"block text-sm font-medium text-blue-100 mb-1",children:"Niveau de complexité"}),e.jsxs("div",{className:"flex gap-4",children:[e.jsxs("div",{className:"flex items-center",children:[e.jsx("input",{type:"radio",id:"debutant",name:"complexity",value:"debutant",checked:d==="debutant",onChange:()=>h("debutant"),className:"mr-2"}),e.jsx("label",{htmlFor:"debutant",className:"text-sm text-blue-200",children:"Débutant"})]}),e.jsxs("div",{className:"flex items-center",children:[e.jsx("input",{type:"radio",id:"intermediaire",name:"complexity",value:"intermediaire",checked:d==="intermediaire",onChange:()=>h("intermediaire"),className:"mr-2"}),e.jsx("label",{htmlFor:"intermediaire",className:"text-sm text-blue-200",children:"Intermédiaire"})]}),e.jsxs("div",{className:"flex items-center",children:[e.jsx("input",{type:"radio",id:"avance",name:"complexity",value:"avance",checked:d==="avance",onChange:()=>h("avance"),className:"mr-2"}),e.jsx("label",{htmlFor:"avance",className:"text-sm text-blue-200",children:"Avancé"})]})]})]}),e.jsxs("div",{children:[e.jsx("label",{className:"block text-sm font-medium text-blue-100 mb-1",children:"Format du mémo"}),e.jsxs("div",{className:"flex gap-4",children:[e.jsxs("div",{className:"flex items-center",children:[e.jsx("input",{type:"radio",id:"resume",name:"format",value:"resume",checked:x==="resume",onChange:()=>b("resume"),className:"mr-2"}),e.jsx("label",{htmlFor:"resume",className:"text-sm text-blue-200",children:"Résumé structuré"})]}),e.jsxs("div",{className:"flex items-center",children:[e.jsx("input",{type:"radio",id:"ficheRecap",name:"format",value:"ficheRecap",checked:x==="ficheRecap",onChange:()=>b("ficheRecap"),className:"mr-2"}),e.jsx("label",{htmlFor:"ficheRecap",className:"text-sm text-blue-200",children:"Fiche récapitulative"})]}),e.jsxs("div",{className:"flex items-center",children:[e.jsx("input",{type:"radio",id:"mindmap",name:"format",value:"mindmap",checked:x==="mindmap",onChange:()=>b("mindmap"),className:"mr-2"}),e.jsx("label",{htmlFor:"mindmap",className:"text-sm text-blue-200",children:"Carte mentale"})]})]})]}),e.jsxs("div",{children:[e.jsx("label",{className:"block text-sm font-medium text-blue-100 mb-1",htmlFor:"specificPoints",children:"Points spécifiques à inclure (optionnel)"}),e.jsx(ne,{id:"specificPoints",placeholder:"Entrez chaque point sur une nouvelle ligne...",value:k,onChange:t=>z(t.target.value),className:"min-h-[100px] bg-blue-900/30 border-blue-700/50 text-white placeholder:text-blue-400/60"})]})]}),e.jsx(A,{children:e.jsx(l,{className:"w-full bg-blue-600 hover:bg-blue-700",onClick:V,disabled:T||!c.trim(),children:T?e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"h-4 w-4 border-2 border-current border-t-transparent animate-spin rounded-full mr-2"}),"Génération en cours..."]}):e.jsxs(e.Fragment,{children:[e.jsx(re,{className:"mr-2 h-4 w-4"}),"Générer mon mémo personnalisé"]})})})]}),e.jsxs(le,{className:"bg-blue-900/20 border-blue-600/30",children:[e.jsx(ce,{className:"h-4 w-4 text-blue-500"}),e.jsx(oe,{children:"Comment ça fonctionne ?"}),e.jsx(me,{className:"text-blue-300",children:"Notre IA analyse votre sujet et crée un mémo personnalisé adapté à vos besoins spécifiques. Les mémos sont générés pour vous aider à comprendre et mémoriser les concepts clés de cybersécurité."})]})]}),H=()=>e.jsx("div",{className:"space-y-6",children:r?e.jsx(e.Fragment,{children:e.jsxs(w,{className:"bg-blue-950/60 border-blue-800/60",children:[e.jsxs(q,{className:"pb-3 flex flex-row items-start justify-between",children:[e.jsxs(M,{children:["Mémo : ",c]}),e.jsxs("div",{className:"flex space-x-2",children:[e.jsxs(l,{size:"sm",variant:"outline",className:"h-8 border-blue-600/50 text-blue-300 hover:bg-blue-900/50",onClick:$,children:[R?e.jsx(ue,{className:"h-4 w-4"}):e.jsx(de,{className:"h-4 w-4"}),e.jsx("span",{className:"ml-1 hidden sm:inline",children:R?"Copié !":"Copier"})]}),e.jsxs(l,{size:"sm",variant:"outline",className:"h-8 border-blue-600/50 text-blue-300 hover:bg-blue-900/50",onClick:Z,children:[e.jsx(he,{className:"h-4 w-4"}),e.jsx("span",{className:"ml-1 hidden sm:inline",children:"Télécharger"})]}),e.jsxs(l,{size:"sm",variant:"outline",className:"h-8 border-blue-600/50 text-blue-300 hover:bg-blue-900/50",onClick:B,children:[e.jsx(C,{className:"h-4 w-4"}),e.jsx("span",{className:"ml-1 hidden sm:inline",children:"Sauvegarder"})]})]})]}),e.jsx(xe,{className:"bg-blue-800/60"}),e.jsx(S,{className:"pt-4",children:e.jsx(P,{className:"h-[500px] pr-4",children:e.jsx("div",{className:"prose prose-invert max-w-none",children:r.split(`
`).map((t,a)=>t.startsWith("# ")?e.jsx("h1",{className:"text-2xl font-bold text-white mt-0 mb-4",children:t.substring(2)},a):t.startsWith("## ")?e.jsx("h2",{className:"text-xl font-semibold text-blue-100 mt-6 mb-3",children:t.substring(3)},a):t.startsWith("### ")?e.jsx("h3",{className:"text-lg font-medium text-blue-200 mt-4 mb-2",children:t.substring(4)},a):t.startsWith("- ")?e.jsx("li",{className:"text-blue-300 ml-5 mb-1",children:t.substring(2)},a):t.startsWith("1. ")||t.startsWith("2. ")||t.startsWith("3. ")||t.startsWith("4. ")||t.startsWith("5. ")?e.jsx("li",{className:"text-blue-300 ml-5 mb-1",children:t.substring(3)},a):t.includes("**")?e.jsx("p",{className:"text-blue-200 mb-2",dangerouslySetInnerHTML:{__html:t.replace(/\*\*(.*?)\*\*/g,"<strong>$1</strong>")}},a):t.trim()===""?e.jsx("div",{className:"h-2"},a):t.startsWith("├──")||t.startsWith("│")||t.startsWith("└──")?e.jsx("div",{className:"text-blue-300 font-mono whitespace-pre mb-0 leading-tight",children:t},a):e.jsx("p",{className:"text-blue-200 mb-2",children:t},a))})})}),e.jsx(A,{className:"flex justify-center pt-2",children:e.jsxs(l,{variant:"outline",className:"border-blue-600/50 text-blue-300 hover:bg-blue-900/50",onClick:()=>m("creation"),children:[e.jsx(g,{className:"mr-2 h-4 w-4"}),"Retour à la création"]})})]})}):e.jsxs("div",{className:"bg-blue-900/30 rounded-lg p-8 text-center flex flex-col items-center",children:[e.jsx(L,{className:"h-12 w-12 text-blue-500 mb-4"}),e.jsx("h3",{className:"text-xl font-medium text-white mb-2",children:"Aucun mémo généré"}),e.jsx("p",{className:"text-blue-300 mb-4",children:`Vous n'avez pas encore généré de mémo. Retournez à l'onglet "Création" pour commencer.`}),e.jsxs(l,{variant:"outline",className:"border-blue-500 text-blue-400 hover:bg-blue-900/20",onClick:()=>m("creation"),children:[e.jsx(g,{className:"mr-2 h-4 w-4"}),"Retour à la création"]})]})}),_=()=>e.jsxs("div",{className:"space-y-6",children:[e.jsx("div",{className:"flex justify-between items-center mb-4",children:e.jsx("h2",{className:"text-xl font-semibold text-white",children:"Mes mémos sauvegardés"})}),f.length>0?e.jsx("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-4",children:f.map((t,a)=>e.jsxs(w,{className:"bg-blue-950/60 border-blue-800/60 hover:bg-blue-900/40 transition-colors",children:[e.jsx(q,{className:"pb-3",children:e.jsxs("div",{className:"flex justify-between items-start",children:[e.jsx(M,{className:"text-lg",children:t.title}),e.jsx(F,{className:"bg-blue-700/40 text-xs",children:t.date})]})}),e.jsx(S,{className:"pb-3",children:e.jsx(P,{className:"h-[120px]",children:e.jsxs("div",{className:"prose prose-invert max-w-none text-sm text-blue-300",children:[t.content.split(`
`).slice(0,10).map((i,u)=>i.startsWith("# ")?null:i.startsWith("## ")?e.jsx("p",{className:"text-blue-200 font-medium",children:i.substring(3)},u):i.trim()===""?null:e.jsx("p",{className:"text-blue-300 text-sm truncate",children:i},u)),t.content.split(`
`).length>10&&e.jsx("p",{className:"text-blue-400 text-xs italic",children:"(...suite du document)"})]})})}),e.jsx(A,{className:"pt-0 flex justify-end",children:e.jsxs(l,{size:"sm",variant:"ghost",className:"text-blue-400 hover:text-blue-300 hover:bg-blue-900/30",onClick:()=>{v(t.content),p(t.title),m("resultat")},children:["Ouvrir",e.jsx(pe,{className:"ml-1 h-4 w-4"})]})})]},a))}):e.jsxs("div",{className:"bg-blue-900/30 rounded-lg p-8 text-center",children:[e.jsx(C,{className:"h-12 w-12 text-blue-500 mx-auto mb-4"}),e.jsx("h3",{className:"text-xl font-medium text-white mb-2",children:"Aucun mémo sauvegardé"}),e.jsx("p",{className:"text-blue-300 mb-4",children:"Vous n'avez pas encore sauvegardé de mémos. Générez un mémo et sauvegardez-le pour le retrouver ici."})]})]});return e.jsxs("div",{className:"min-h-screen bg-[#0a1429]",children:[e.jsx(Q,{title:"Mémo IA personnalisé | Centre de formation"}),e.jsx("header",{className:"border-b border-blue-800/60",children:e.jsxs("div",{className:"container mx-auto px-4 py-4 flex items-center gap-4",children:[e.jsx(ee,{href:"/cyber/learning-center",children:e.jsxs(l,{variant:"ghost",className:"text-blue-300 hover:bg-blue-900/30 hover:text-blue-200",children:[e.jsx(g,{className:"h-4 w-4 mr-2"}),"Retour au centre de formation"]})}),e.jsx("h1",{className:"text-xl text-white font-medium",children:"Mémo IA personnalisé"})]})}),e.jsxs("div",{className:"container mx-auto px-4 py-8",children:[e.jsxs("div",{className:"mb-8",children:[e.jsx("h1",{className:"text-3xl font-bold text-white mb-2",children:"Mémo IA personnalisé"}),e.jsx("p",{className:"text-blue-300 max-w-3xl",children:"Créez des aide-mémoires sur mesure pour consolider vos connaissances en cybersécurité. Notre IA génère des mémos adaptés à votre niveau et vos besoins spécifiques."})]}),e.jsxs(se,{value:W,onValueChange:m,className:"mb-6",children:[e.jsxs(te,{className:"bg-blue-950/70 border border-blue-800/60",children:[e.jsxs(N,{value:"creation",className:"data-[state=active]:bg-blue-700",children:[e.jsx(ae,{className:"h-4 w-4 mr-2"}),"Création"]}),e.jsxs(N,{value:"resultat",className:"data-[state=active]:bg-blue-700",children:[e.jsx(C,{className:"h-4 w-4 mr-2"}),"Mémo généré"]}),e.jsxs(N,{value:"bibliotheque",className:"data-[state=active]:bg-blue-700",children:[e.jsx(L,{className:"h-4 w-4 mr-2"}),"Ma bibliothèque"]})]}),e.jsx(y,{value:"creation",children:U()}),e.jsx(y,{value:"resultat",children:H()}),e.jsx(y,{value:"bibliotheque",children:_()})]})]})]})}export{je as default};
