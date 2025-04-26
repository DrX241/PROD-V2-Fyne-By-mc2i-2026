import { useChatContext } from "@/contexts/ChatContext";
import { Shield, Lock, Database, BarChart } from "lucide-react";

export default function Sidebar() {
  const { resetChat } = useChatContext();

  return (
    <div className="hidden md:flex md:flex-col w-[260px] bg-white border-r border-gray-100 h-full shadow-sm">
      <div className="p-5 border-b border-gray-100">
        <h2 className="heading font-semibold text-neutral-800">Modules</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
        <div 
          className="bg-primary/10 text-primary rounded-xl p-4 mb-3 font-medium flex items-center cursor-pointer hover:bg-primary/15 transition-colors"
          onClick={resetChat}
        >
          <div className="p-1.5 bg-primary/10 rounded-md mr-3">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <div className="font-semibold">I AM CYBER</div>
            <div className="text-xs text-neutral-500 mt-1">Formation cybersécurité interactive</div>
          </div>
        </div>
        <div className="text-neutral-500 rounded-xl p-4 mb-3 hover:bg-gray-50 transition-colors flex items-center">
          <div className="p-1.5 bg-gray-100 rounded-md mr-3">
            <Lock className="h-5 w-5" />
          </div>
          <div>
            <div className="font-medium">Module 2</div>
            <div className="text-xs text-neutral-400 mt-1">(à venir)</div>
          </div>
        </div>
        <div className="text-neutral-500 rounded-xl p-4 mb-3 hover:bg-gray-50 transition-colors flex items-center">
          <div className="p-1.5 bg-gray-100 rounded-md mr-3">
            <Database className="h-5 w-5" />
          </div>
          <div>
            <div className="font-medium">Module 3</div>
            <div className="text-xs text-neutral-400 mt-1">(à venir)</div>
          </div>
        </div>
      </div>
      <div className="p-5 border-t border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <BarChart className="h-4 w-4 text-neutral-500 mr-2" />
            <h3 className="heading font-medium text-neutral-700">Progression</h3>
          </div>
          <span className="text-primary text-sm font-medium">15%</span>
        </div>
        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full w-[15%] transition-all duration-1000"></div>
        </div>
      </div>
    </div>
  );
}
