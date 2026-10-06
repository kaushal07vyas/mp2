import typeStyles from '../styles/types.module.css';

export function typeClass(type: string | undefined): string {
  return (type && typeStyles[type]) || typeStyles.normal;
}
