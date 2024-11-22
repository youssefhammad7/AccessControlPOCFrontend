import { ComponentType } from 'react';

export const getComponentName = (component: ComponentType<any> | string): string => {
  if (typeof component === 'string') {
    return component;
  }
  return component.displayName || component.name || 'UnknownComponent';
};