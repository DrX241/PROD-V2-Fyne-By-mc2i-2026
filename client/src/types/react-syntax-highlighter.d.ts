declare module 'react-syntax-highlighter' {
  import { ReactNode } from 'react';
  
  export interface SyntaxHighlighterProps {
    language?: string;
    style?: any;
    customStyle?: any;
    codeTagProps?: any;
    useInlineStyles?: boolean;
    showLineNumbers?: boolean;
    startingLineNumber?: number;
    lineNumberStyle?: any;
    wrapLines?: boolean;
    lineProps?: any;
    wrapLongLines?: boolean;
    children?: string | ReactNode;
    className?: string;
    [key: string]: any;
  }
  
  export const Prism: React.ComponentType<SyntaxHighlighterProps>;
  export const Light: React.ComponentType<SyntaxHighlighterProps>;
  export default React.ComponentType<SyntaxHighlighterProps>;
}

declare module 'react-syntax-highlighter/dist/esm/styles/prism' {
  const atomDark: any;
  const prism: any;
  const a11yDark: any;
  const coy: any;
  const dark: any;
  const funky: any;
  const okaidia: any;
  const solarizedlight: any;
  const tomorrow: any;
  const twilight: any;
  const vscDarkPlus: any;
  
  export {
    atomDark,
    prism,
    a11yDark,
    coy,
    dark,
    funky,
    okaidia,
    solarizedlight,
    tomorrow,
    twilight,
    vscDarkPlus
  };
}