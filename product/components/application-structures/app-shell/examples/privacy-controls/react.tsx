import { Text } from '@vyrnforge/react/text';
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { AppShell, AppShellBody, AppShellHeader, AppShellMain } from '@vyrnforge/react/app-shell';
import {
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogDescription,
  AlertDialogRoot,
  AlertDialogTitle,
} from '@vyrnforge/react/alert-dialog';
import { Button } from '@vyrnforge/react/button';
import '@vyrnforge/web/styles.css';
import './example.css';

type AnalyticsPreference = 'not-set' | 'allowed' | 'declined';
type CameraState = 'not-requested' | 'denied' | 'granted';
type ExportState = 'not-requested' | 'ready';
type AccountState = 'active' | 'deleted';

function createFakePrivacyServices() {
  let analytics: AnalyticsPreference = 'not-set';
  let cameraAttempts = 0;
  let account: AccountState = 'active';

  return {
    setAnalytics(next: Exclude<AnalyticsPreference, 'not-set'>) {
      analytics = next;
      return { state: analytics };
    },
    requestCamera(): { state: CameraState } {
      cameraAttempts += 1;
      return { state: cameraAttempts === 1 ? 'denied' : 'granted' };
    },
    requestExport() {
      return {
        state: 'ready' as const,
        scope: 'Profile and account settings',
      };
    },
    deleteAccount() {
      account = 'deleted';
      return { state: account };
    },
  };
}

const privacyServices = createFakePrivacyServices();

function App() {
  const [analytics, setAnalytics] = React.useState<AnalyticsPreference>('not-set');
  const [camera, setCamera] = React.useState<CameraState>('not-requested');
  const [exportState, setExportState] = React.useState<ExportState>('not-requested');
  const [account, setAccount] = React.useState<AccountState>('active');
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [message, setMessage] = React.useState('Optional analytics is off until you choose.');

  function chooseAnalytics(next: 'allowed' | 'declined') {
    const result = privacyServices.setAnalytics(next);
    setAnalytics(result.state);
    setMessage(
      next === 'allowed'
        ? 'Optional analytics allowed by the fake preference service. You can turn it off here at any time.'
        : 'Optional analytics declined. Core account use remains available.',
    );
  }

  function revokeAnalytics() {
    const result = privacyServices.setAnalytics('declined');
    setAnalytics(result.state);
    setMessage('Optional analytics turned off for future demo processing. This example does not claim historical-data erasure.');
  }

  function requestCamera() {
    const result = privacyServices.requestCamera();
    setCamera(result.state);
    setMessage(
      result.state === 'denied'
        ? 'Camera access was denied by the fake platform service. No native prompt is simulated; you can continue using the account or try the camera again.'
        : 'Camera access was granted by the fake platform service. Real browser permission lifetime remains platform-owned.',
    );
  }

  function requestExport() {
    const result = privacyServices.requestExport();
    setExportState(result.state);
    setMessage(`Data export ready. Scope: ${result.scope}. The example does not simulate or claim a download.`);
  }

  function deleteAccount() {
    const result = privacyServices.deleteAccount();
    setAccount(result.state);
    setMessage('Account deletion committed by the fake service. This does not prove universal erasure, retention fulfillment, or legal compliance.');
  }

  return (
    <AppShell>
      <AppShellHeader className="privacy-shell-header">
        <Text as="strong" variant="label-md">Privacy controls</Text>
        <Text as="span">STD-17 fake consumer services</Text>
      </AppShellHeader>
      <AppShellBody>
        <AppShellMain className="privacy-example-main">
          <header>
            <Text as="h1" variant="heading-lg">Privacy and account choices</Text>
            <Text as="p" className="privacy-note">
              This representative uses application-local fake preference, permission, export, and deletion services. VyrnForge does not decide legal basis, run analytics or cookies, invoke real device permissions, generate exports, delete production data, or certify compliance.
            </Text>
          </header>

          <section className="privacy-status" aria-labelledby="privacy-status-heading">
            <Text as="h2" variant="heading-md" id="privacy-status-heading">Privacy status</Text>
            <Text as="p" role="status">{message}</Text>
          </section>

          <section className="privacy-card" aria-labelledby="analytics-heading">
            <Text as="h2" variant="heading-md" id="analytics-heading">Optional product analytics</Text>
            <Text as="p">Purpose: measure how this demo account surface is used so a consuming product could improve it. This optional demo choice does not affect core account access.</Text>
            <Text as="p">Current committed choice: <Text as="strong" variant="label-md">{analytics === 'not-set' ? 'Not chosen — analytics remains off' : analytics === 'allowed' ? 'Allowed' : 'Declined'}</Text>.</Text>
            {analytics === 'allowed' ? (
              <div className="privacy-choice-actions">
                <Button type="button" variant="secondary" onClick={revokeAnalytics}>Turn off optional analytics</Button>
              </div>
            ) : (
              <div className="privacy-choice-actions" aria-label="Optional analytics choices">
                <Button type="button" variant="secondary" onClick={() => chooseAnalytics('allowed')}>Allow optional analytics</Button>
                <Button type="button" variant="secondary" onClick={() => chooseAnalytics('declined')}>Decline optional analytics</Button>
              </div>
            )}
          </section>

          <section className="privacy-card" aria-labelledby="camera-heading">
            <Text as="h2" variant="heading-md" id="camera-heading">Profile photo camera</Text>
            <Text as="p">Use camera to add a profile photo. The real browser or device would own its permission prompt, grant lifetime, indicators, and settings.</Text>
            {camera === 'granted' ? (
              <Text as="p">Fake camera state: granted. No real device access occurred.</Text>
            ) : (
              <Button type="button" variant="secondary" onClick={requestCamera}>
                {camera === 'denied' ? 'Try camera again' : 'Use camera'}
              </Button>
            )}
          </section>

          <section className="privacy-card" aria-labelledby="export-heading">
            <Text as="h2" variant="heading-md" id="export-heading">Personal data export</Text>
            <Text as="p">Demo scope: profile and account settings. A real product would own authorization, identity checks, format, snapshot, artifact generation, delivery, and retention.</Text>
            {exportState === 'ready' ? (
              <Text as="p"><Text as="strong" variant="label-md">Export state:</Text> ready. No download is simulated.</Text>
            ) : (
              <Button type="button" variant="secondary" onClick={requestExport}>Request data export</Button>
            )}
          </section>

          <section className="privacy-card" aria-labelledby="deletion-heading">
            <Text as="h2" variant="heading-md" id="deletion-heading">Account deletion</Text>
            {account === 'deleted' ? (
              <Text as="p"><Text as="strong" variant="label-md">Fake account state:</Text> deleted. This UI evidence does not prove backend erasure or retention compliance.</Text>
            ) : (
              <>
                <Text as="p">Deleting the account is account-wide and ends access when the fake service commits the deletion.</Text>
                <Button type="button" onClick={() => setDeleteOpen(true)}>Delete account</Button>
                <AlertDialogRoot open={deleteOpen} onOpenChange={setDeleteOpen} descriptionId="privacy-delete-description">
                  <AlertDialogTitle>Delete account?</AlertDialogTitle>
                  <AlertDialogDescription id="privacy-delete-description">
                    Account access ends when deletion commits. Some records may remain under the demo organization’s external retention, security, backup, or legal-hold policy. This fake example has no self-service recovery after commit.
                  </AlertDialogDescription>
                  <div className="privacy-dialog-actions">
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={deleteAccount}>Delete account</AlertDialogAction>
                  </div>
                </AlertDialogRoot>
              </>
            )}
          </section>
        </AppShellMain>
      </AppShellBody>
    </AppShell>
  );
}

createRoot(document.querySelector('#root')!).render(<App />);
