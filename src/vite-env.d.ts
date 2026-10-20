/// <reference types="vite/client" />

declare module '*.webp' {
  const content: string;
  export default content;
}

declare module '*.webp?v=3' {
  const content: string;
  export default content;
}

declare module '*.webp?v2' {
  const content: string;
  export default content;
}

declare module '@/assets/*.webp?v2' {
  const content: string;
  export default content;
}

declare module '@/assets/logo-jenama.webp?v2' {
  const content: string;
  export default content;
}
