// utils/elementFinder.ts
export const getElementByStyleId = (styleId: string): HTMLElement | null => {
    return document.querySelector(`[data-style-id="${styleId}"]`);
  };
  
  export const getAllElementsByStyleId = (styleId: string): NodeListOf<HTMLElement> => {
    return document.querySelectorAll(`[data-style-id="${styleId}"]`);
  };
  
  export const getAllStyledElements = (): NodeListOf<HTMLElement> => {
    return document.querySelectorAll('[data-style-id]');
  };