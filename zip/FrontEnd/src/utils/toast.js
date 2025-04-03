import { createRoot } from 'react-dom/client';
import Toast from '../components/Toast';

export const showToast = (type, message, duration = 3000) => {
  const toast = document.createElement('div');
  document.body.appendChild(toast);

  const root = createRoot(toast);

  root.render(
    <Toast
      type={type}
      message={message}
      duration={duration}
      onClose={() => {
        root.unmount();
        document.body.removeChild(toast);
      }}
    />
  );
};

