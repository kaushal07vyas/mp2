import { Link } from 'react-router-dom';
import StatusMessage from '../components/StatusMessage';

export default function NotFound() {
  return (
    <StatusMessage title="This page does not exist">
      <p>
        Head back to <Link to="/">search</Link> or the <Link to="/gallery">gallery</Link>.
      </p>
    </StatusMessage>
  );
}
