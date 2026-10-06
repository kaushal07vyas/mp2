import styles from './TypeBadge.module.css';
import { typeClass } from '../utils/typeClass';

interface Props {
  type: string;
  size?: 'small' | 'regular';
}

export default function TypeBadge({ type, size = 'regular' }: Props) {
  const sizeClass = size === 'small' ? styles.small : '';
  return <span className={`${styles.badge} ${sizeClass} ${typeClass(type)}`}>{type}</span>;
}
