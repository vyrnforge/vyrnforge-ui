import { createRoot } from 'react-dom/client';
import { ToggleGroupRoot, ToggleGroupItem } from '@vyrnforge/react/toggle-group';
import { Icon } from '@vyrnforge/react/icon';
import { microphoneIcon } from '@vyrnforge/icons/microphone';
import { cameraIcon } from '@vyrnforge/icons/camera';
import { volumeIcon } from '@vyrnforge/icons/volume';
import { Flow } from '@vyrnforge/react/layout';
import '@vyrnforge/web/styles/toggle-group.css';
import '@vyrnforge/web/styles/icon.css';
import '@vyrnforge/web/styles/layout.css';

function App() {
  return (
    <Flow direction="inline" wrap="wrap" gap="sm">
      <ToggleGroupRoot type="multiple" defaultValue={['microphone']} aria-label="Call audio and video">
        <ToggleGroupItem value="microphone" data-vf-icon-only="" aria-label="Microphone">
          <Icon icon={microphoneIcon} />
        </ToggleGroupItem>
        <ToggleGroupItem value="camera" data-vf-icon-only="" aria-label="Camera">
          <Icon icon={cameraIcon} />
        </ToggleGroupItem>
        <ToggleGroupItem value="speaker" data-vf-icon-only="" aria-label="Speaker" disabled>
          <Icon icon={volumeIcon} />
        </ToggleGroupItem>
      </ToggleGroupRoot>
    </Flow>
  );
}
const root = document.getElementById('root');
if (!root) throw new Error('Missing example root');
createRoot(root).render(<App />);
