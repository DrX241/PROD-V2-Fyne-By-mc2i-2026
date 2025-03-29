import { useChatContext } from "@/contexts/ChatContext";
import { Shield, Lock, Database } from "lucide-react";

export default function Sidebar() {
  const { resetChat } = useChatContext();

  return (
    <div className="hidden md:flex md:flex-col w-64 bg-white border-r border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h2 className="heading font-semibold text-neutral-800">Modules</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        <div 
          className="bg-primary-50 text-primary-700 rounded-lg p-3 mb-2 font-medium flex items-center cursor-pointer"
          onClick={resetChat}
        >
          <Shield className="mr-2 h-5 w-5" />
          I AM CYBER
        </div>
        <div className="text-neutral-500 rounded-lg p-3 mb-2 hover:bg-gray-100 flex items-center">
          <Lock className="mr-2 h-5 w-5" />
          Module 2 (à venir)
        </div>
        <div className="text-neutral-500 rounded-lg p-3 mb-2 hover:bg-gray-100 flex items-center">
          <Database className="mr-2 h-5 w-5" />
          Module 3 (à venir)
        </div>
      </div>
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="heading font-medium text-neutral-700">Progression</h3>
          <span className="text-primary-600 text-sm font-medium">15%</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-primary-600 rounded-full w-[15%]"></div>
        </div>
      </div>
    </div>
  );
}
