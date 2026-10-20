/// <reference types="vite/client" />

declare module '*.webp' {
  const content: string;
  export default content;
}

declare module '*?v=4' {
  const content: string;
  export default content;
}

declare module '*?v=3' {
  const content: string;
  export default content;
}

declare module '*?v=2' {
  const content: string;
  export default content;
}

declare module '*?v=1' {
  const content: string;
  export default content;
}

declare module '*?v2' {
  const content: string;
  export default content;
}

declare module '*?url' {
  const content: string;
  export default content;
}
