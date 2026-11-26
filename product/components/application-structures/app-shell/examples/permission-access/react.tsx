import { Text } from '@vyrnforge/react/text';
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { AppShell, AppShellBody, AppShellHeader, AppShellMain } from '@vyrnforge/react/app-shell';
import { Button } from '@vyrnforge/react/button';
import '@vyrnforge/web/styles/app-shell.css';
import '@vyrnforge/web/styles/button.css';
import './example.css';

type Capabilities = {
  read: boolean;
  edit: boolean;
};

type AccessRequestState = 'idle' | 'pending';

type SaveResult = { ok: true } | { ok: false; reason: 'permission-denied' };

function createFakePermissionService() {
  let capabilities: Capabilities = { read: true, edit: true };
  let denyNextSave = true;

  return {
    readCapabilities() {
      return { ...capabilities };
    },
    saveDraft(): SaveResult {
      if (denyNextSave || !capabilities.edit) {
        denyNextSave = false;
        capabilities = { ...capabilities, edit: false };
        return { ok: false, reason: 'permission-denied' };
      }
      return { ok: true };
    },
    requestEditAccess() {
      return { state: 'pending' as const };
    },
    grantEditAccessForDemo() {
      capabilities = { ...capabilities, edit: true };
    },
    revokeEditAccessForDemo() {
      capabilities = { ...capabilities, edit: false };
    },
  };
}

const permissionService = createFakePermissionService();

function App() {
  const [capabilities, setCapabilities] = React.useState(() => permissionService.readCapabilities());
  const [draft, setDraft] = React.useState('Quarterly plan draft');
  const [savedValue, setSavedValue] = React.useState('Quarterly plan draft');
  const [message, setMessage] = React.useState('Edit access is available. The first save will simulate an authoritative permission denial.');
  const [requestState, setRequestState] = React.useState<AccessRequestState>('idle');
  const [impersonating, setImpersonating] = React.useState(true);

  const canEdit = capabilities.edit;

  function save() {
    const result = permissionService.saveDraft();
    if (!result.ok) {
      setCapabilities(permissionService.readCapabilities());
      setMessage('Your changes were not saved because edit access is no longer available. Your draft is preserved here.');
      return;
    }
    setSavedValue(draft);
    setMessage('Changes saved.');
  }

  function requestAccess() {
    const result = permissionService.requestEditAccess();
    setRequestState(result.state);
    setMessage('Edit access request submitted. Access has not been granted yet.');
  }

  function grantEditAccess() {
    permissionService.grantEditAccessForDemo();
    setCapabilities(permissionService.readCapabilities());
    setRequestState('idle');
    setMessage('Demo permission source now allows editing.');
  }

  function revokeEditAccess() {
    permissionService.revokeEditAccessForDemo();
    setCapabilities(permissionService.readCapabilities());
    setMessage('Edit access changed while you were working. Your unsaved draft is preserved in read-only mode.');
  }

  return (
    <AppShell>
      <AppShellHeader className="permission-shell-header">
        <Text as="strong" variant="label-md">Document workspace</Text>
        {impersonating ? (
          <div className="permission-identity-context" aria-label="Impersonation context">
            <Text as="p"><Text as="strong" variant="label-md">Avery</Text> is acting as <Text as="strong" variant="label-md">Jordan</Text>.</Text>
            <Button type="button" variant="secondary" onClick={() => setImpersonating(false)}>End impersonation</Button>
          </div>
        ) : (
          <Text as="p">Avery is using their own identity.</Text>
        )}
      </AppShellHeader>
      <AppShellBody>
        <AppShellMain className="permission-example-main">
          <header>
            <Text as="h1" variant="heading-lg">Quarterly plan</Text>
            <Text as="p">Illustrative organization role: <Text as="strong" variant="label-md">Editor</Text>. Action availability comes from resource capabilities, not the role label.</Text>
          </header>

          <section className="permission-status" aria-labelledby="permission-status-heading">
            <Text as="h2" variant="heading-md" id="permission-status-heading">Access status</Text>
            <Text as="p">{message}</Text>
            <Text as="p">Current capability: {canEdit ? 'Can edit this document' : 'View only'}. Last committed value: “{savedValue}”.</Text>
          </section>

          <section className="permission-editor" aria-labelledby="permission-editor-heading">
            <Text as="h2" variant="heading-md" id="permission-editor-heading">Draft</Text>
            <label htmlFor="permission-draft">Plan notes</label>
            <textarea
              id="permission-draft"
              value={draft}
              readOnly={!canEdit}
              aria-describedby={!canEdit ? 'permission-readonly-help' : undefined}
              onChange={(event) => setDraft(event.currentTarget.value)}
            />
            {!canEdit ? <Text as="p" id="permission-readonly-help">You can review and copy this preserved draft, but you cannot save changes without edit access.</Text> : null}
            <div className="permission-actions">
              <Button type="button" disabled={!canEdit} onClick={save}>Save changes</Button>
              {!canEdit ? (
                <Button type="button" variant="secondary" disabled={requestState === 'pending'} onClick={requestAccess}>
                  {requestState === 'pending' ? 'Request submitted' : 'Request edit access'}
                </Button>
              ) : null}
            </div>
          </section>

          <section aria-labelledby="permission-demo-heading">
            <Text as="h2" variant="heading-md" id="permission-demo-heading">Fake permission service controls</Text>
            <Text as="p">These controls exist only to exercise STD-16 state transitions. They do not represent a VyrnForge permission runtime.</Text>
            <div className="permission-demo-controls">
              <Button type="button" variant="secondary" onClick={grantEditAccess}>Grant edit access for demo</Button>
              <Button type="button" variant="secondary" onClick={revokeEditAccess}>Revoke edit access for demo</Button>
            </div>
          </section>
        </AppShellMain>
      </AppShellBody>
    </AppShell>
  );
}

createRoot(document.querySelector('#root')!).render(<App />);
