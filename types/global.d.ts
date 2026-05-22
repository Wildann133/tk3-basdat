declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}

declare module 'react/jsx-runtime' {
  export const Fragment: any;
  export const jsx: any;
  export const jsxs: any;
}

declare module 'react/jsx-dev-runtime' {
  export const Fragment: any;
  export const jsxDEV: any;
}
