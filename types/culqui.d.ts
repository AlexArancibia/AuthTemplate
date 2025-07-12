// types/culqi.d.ts
export {};

declare global {
  interface Window {
    Culqi: any; // Puedes reemplazar `any` con un tipo si Culqi tiene types
    culqi: () => void;
  }
}
