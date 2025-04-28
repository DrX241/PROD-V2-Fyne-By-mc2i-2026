import React, { useState } from 'react';
import { useCyberCrisisContext } from '../CyberCrisisContext';
import { User } from 'lucide-react';

const UserNameInput: React.FC = () => {
  const { state, setUserName } = useCyberCrisisContext();
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation simple
    if (name.trim().length < 2) {
      setError('Veuillez entrer un prénom valide (au moins 2 caractères)');
      return;
    }
    
    // Mettre à jour le nom d'utilisateur dans le contexte
    setUserName(name.trim());
  };

  // Si le nom est déjà défini, afficher une confirmation
  if (state.userName) {
    return (
      <div className="mb-8 bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-800 rounded-lg p-4">
        <div className="flex items-center">
          <User className="h-5 w-5 text-green-500 mr-2" />
          <span className="text-green-700 dark:text-green-300">
            Bonjour, <span className="font-bold">{state.userName}</span> ! Vous êtes prêt à continuer.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">
        Comment souhaitez-vous être appelé ?
      </h2>
      
      <form onSubmit={handleSubmit} className="max-w-md">
        <div className="mb-4">
          <label htmlFor="userName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Votre prénom
          </label>
          <div className="flex">
            <input
              type="text"
              id="userName"
              className={`flex-1 p-3 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 ${
                error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder="Prénom"
              value={name}
              onChange={handleNameChange}
              autoComplete="given-name"
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-r-lg px-4 py-2"
            >
              Confirmer
            </button>
          </div>
          {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>
        
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Ce nom sera utilisé dans les communications pendant la simulation de crise.
        </p>
      </form>
    </div>
  );
};

export default UserNameInput;