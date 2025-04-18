import React from 'react';

interface AmoaEmailMessageProps {
  content: string;
}

export default function AmoaEmailMessage({ content }: AmoaEmailMessageProps) {
  // Extraire les parties d'un e-mail au format texte
  const extractEmailParts = (content: string) => {
    const lines = content.split('\n');
    let from = '';
    let to = '';
    let subject = '';
    let body = '';
    let inBody = false;

    for (const line of lines) {
      if (line.startsWith('De:')) {
        from = line.substring(3).trim();
      } else if (line.startsWith('À:')) {
        to = line.substring(2).trim();
      } else if (line.startsWith('Objet:')) {
        subject = line.substring(6).trim();
      } else {
        if (from && to && subject) {
          inBody = true;
        }
        
        if (inBody) {
          body += line + '\n';
        }
      }
    }

    return { from, to, subject, body: body.trim() };
  };

  const { from, to, subject, body } = extractEmailParts(content);

  return (
    <div className="w-full my-4 overflow-hidden rounded-lg shadow-sm border border-gray-200">
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-4 py-3 border-b border-gray-200">
        <div className="text-sm text-gray-600">
          <div className="flex items-start mb-1">
            <span className="font-medium text-gray-700 inline-block w-16">De:</span>
            <span>{from}</span>
          </div>
          <div className="flex items-start mb-1">
            <span className="font-medium text-gray-700 inline-block w-16">À:</span>
            <span>{to}</span>
          </div>
          <div className="flex items-start">
            <span className="font-medium text-gray-700 inline-block w-16">Objet:</span>
            <span className="font-medium">{subject}</span>
          </div>
        </div>
      </div>
      <div className="bg-white px-4 py-4">
        <div className="text-sm whitespace-pre-wrap text-gray-800">{body}</div>
      </div>
    </div>
  );
}