import React from "react";
import { BinaryDecision } from "@shared/types/cyber";
import { useChatContext } from "@/contexts/ChatContext";
import { CornerDownRight, Shield, ShieldAlert } from "lucide-react";

interface BinaryDecisionMessageProps {
  decision: BinaryDecision;
}

export default function BinaryDecisionMessage({ decision }: BinaryDecisionMessageProps) {
  const { makeDecision } = useChatContext();

  const handleOptionClick = (optionId: string) => {
    makeDecision(optionId);
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Contexte de la décision */}
      <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-2">
        <div className="flex items-start space-x-2">
          <div className="flex-shrink-0 mt-0.5">
            <ShieldAlert className="h-5 w-5 text-[#006a9e]" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 mb-1">Situation critique</h3>
            <p className="text-gray-700">{decision.context}</p>
          </div>
        </div>
      </div>

      {/* Options de décision */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Option A */}
        <div 
          className="border border-[#006a9e]/30 rounded-lg bg-white hover:bg-blue-50 transition-colors p-4 cursor-pointer"
          onClick={() => handleOptionClick(decision.optionA.id)}
        >
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-[#006a9e] text-white flex items-center justify-center font-bold">
              A
            </div>
            <h3 className="font-bold text-gray-800">{decision.optionA.text}</h3>
          </div>
          
          <div className="pl-10 space-y-2">
            <p className="text-gray-700 text-sm">{decision.optionA.description}</p>
            
            <div className="flex items-start space-x-2 mt-1">
              <CornerDownRight className="h-4 w-4 flex-shrink-0 text-yellow-600 mt-0.5" />
              <p className="text-sm text-gray-600 italic">{decision.optionA.consequences}</p>
            </div>
          </div>
        </div>

        {/* Option B */}
        <div 
          className="border border-[#006a9e]/30 rounded-lg bg-white hover:bg-blue-50 transition-colors p-4 cursor-pointer"
          onClick={() => handleOptionClick(decision.optionB.id)}
        >
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-[#006a9e] text-white flex items-center justify-center font-bold">
              B
            </div>
            <h3 className="font-bold text-gray-800">{decision.optionB.text}</h3>
          </div>
          
          <div className="pl-10 space-y-2">
            <p className="text-gray-700 text-sm">{decision.optionB.description}</p>
            
            <div className="flex items-start space-x-2 mt-1">
              <CornerDownRight className="h-4 w-4 flex-shrink-0 text-yellow-600 mt-0.5" />
              <p className="text-sm text-gray-600 italic">{decision.optionB.consequences}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center text-xs text-gray-500 mt-1">
        Étape {decision.step}/5
      </div>
    </div>
  );
}