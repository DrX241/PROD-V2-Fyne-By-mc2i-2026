export type BlockType =
  | 'text' | 'image' | 'video' | 'audio' | 'accordion'
  | 'quote' | 'separator' | 'qcm' | 'qcm_scored' | 'download' | 'callout';

export interface BaseBlock {
  id: string;
  type: BlockType;
  aiPlaceholder?: string;
}

export interface TextBlock extends BaseBlock { type: 'text'; html: string; }
export interface ImageBlock extends BaseBlock { type: 'image'; url: string; caption: string; alt: string; width?: 'full' | 'medium' | 'small'; }
export interface VideoBlock extends BaseBlock { type: 'video'; source: 'youtube' | 'vimeo' | 'upload'; url: string; title?: string; }
export interface AudioBlock extends BaseBlock { type: 'audio'; url: string; title?: string; duration?: number; }
export interface AccordionBlock extends BaseBlock { type: 'accordion'; items: { title: string; content: string }[]; }
export interface QuoteBlock extends BaseBlock { type: 'quote'; text: string; author?: string; role?: string; }
export interface SeparatorBlock extends BaseBlock { type: 'separator'; style?: 'line' | 'space' | 'dots'; }
export interface QcmOption { id: string; text: string; correct: boolean; }
export interface QcmBlock extends BaseBlock { type: 'qcm'; question: string; options: QcmOption[]; explanation?: string; showFeedback: boolean; }
export interface QcmScoredBlock extends BaseBlock { type: 'qcm_scored'; question: string; options: QcmOption[]; explanation?: string; points: number; }
export interface DownloadBlock extends BaseBlock { type: 'download'; url: string; fileName: string; fileSize?: number; fileType?: string; }
export interface CalloutBlock extends BaseBlock { type: 'callout'; variant: 'info' | 'warning' | 'tip' | 'danger'; title?: string; content: string; }

export type Block = TextBlock | ImageBlock | VideoBlock | AudioBlock | AccordionBlock | QuoteBlock | SeparatorBlock | QcmBlock | QcmScoredBlock | DownloadBlock | CalloutBlock;

export interface Lesson {
  id: string;
  title: string;
  description?: string;
  blocks: Block[];
  estimatedDurationMin?: number;
}

export interface Chapter {
  id: string;
  title: string;
  description?: string;
  lessons: Lesson[];
  order: number;
}

export interface LmsCourseContent {
  chapters: Chapter[];
  scoringEnabled: boolean;
  passingScore?: number;
  completionMode: 'linear' | 'free';
}
