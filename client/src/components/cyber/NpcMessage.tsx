import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { NpcMessageContent, ScenarioContact } from "@shared/schema";

interface NpcMessageProps {
  content: NpcMessageContent;
  sender?: ScenarioContact;
}

export default function NpcMessage({ content, sender }: NpcMessageProps) {
  if (!sender) {
    return (
      <div className="flex items-start gap-3 py-2">
        <Card className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg max-w-[80%] ml-auto">
          <p className="text-sm whitespace-pre-line">{content.text}</p>
        </Card>
      </div>
    );
  }
  
  // Get initials for avatar fallback
  const initials = sender.name
    .split(" ")
    .map((part: string) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  
  const departmentBadge = sender.department && (
    <span className="text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-0.5 rounded">
      {sender.department}
    </span>
  );

  return (
    <div className="flex items-start gap-3 py-2 max-w-[80%] mr-auto">
      <Avatar className="h-8 w-8">
        <AvatarImage src={sender.avatar} alt={sender.name} />
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      
      <div className="flex flex-col">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-sm">{sender.name}</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {sender.role}
          </span>
          {departmentBadge}
        </div>
        
        <Card className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
          <p className="text-sm whitespace-pre-line">{content.text}</p>
        </Card>
      </div>
    </div>
  );
}