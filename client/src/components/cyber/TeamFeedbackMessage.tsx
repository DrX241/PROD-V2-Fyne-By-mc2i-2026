import React from 'react';
import { TeamFeedback } from '@shared/types/cyber';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ThumbsUp, ThumbsDown, Lightbulb } from 'lucide-react';

interface TeamFeedbackMessageProps {
  feedback: TeamFeedback;
}

const TeamFeedbackMessage: React.FC<TeamFeedbackMessageProps> = ({ feedback }) => {
  // Configurer les styles et icônes en fonction du sentiment
  const getSentimentConfig = () => {
    switch (feedback.sentiment) {
      case 'positive':
        return {
          icon: <ThumbsUp className="h-5 w-5 text-green-500" />,
          bgColor: 'bg-green-50 dark:bg-green-950/30',
          borderColor: 'border-green-200 dark:border-green-800/50',
          textColor: 'text-green-700 dark:text-green-400'
        };
      case 'negative':
        return {
          icon: <ThumbsDown className="h-5 w-5 text-rose-500" />,
          bgColor: 'bg-rose-50 dark:bg-rose-950/30',
          borderColor: 'border-rose-200 dark:border-rose-800/50',
          textColor: 'text-rose-700 dark:text-rose-400'
        };
      default:
        return {
          icon: <Lightbulb className="h-5 w-5 text-amber-500" />,
          bgColor: 'bg-amber-50 dark:bg-amber-950/30',
          borderColor: 'border-amber-200 dark:border-amber-800/50',
          textColor: 'text-amber-700 dark:text-amber-400'
        };
    }
  };

  const { icon, bgColor, borderColor, textColor } = getSentimentConfig();

  // Générer les initiales pour l'avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <Card className={`${bgColor} ${borderColor} shadow-sm mb-4 max-w-2xl ml-auto mr-4`}>
      <CardHeader className="flex flex-row items-start space-y-0 pb-2 pt-4">
        <div className="flex-1 flex gap-3 items-center">
          <Avatar className="h-8 w-8 border border-zinc-200 dark:border-zinc-700">
            <AvatarImage src={`/avatars/${feedback.sender.toLowerCase().replace(/\s+/g, '-')}.png`} alt={feedback.sender} />
            <AvatarFallback className="bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs">
              {getInitials(feedback.sender)}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-sm font-medium">{feedback.sender}</CardTitle>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">{feedback.senderRole}</p>
          </div>
          <div className="ml-auto">
            {icon}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-4 pt-0">
        <p className={`${textColor} text-sm`}>{feedback.message}</p>
      </CardContent>
    </Card>
  );
};

export default TeamFeedbackMessage;