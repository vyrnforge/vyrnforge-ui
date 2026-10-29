import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { Button } from '@vyrnforge/react/button';
import { ToastClose, ToastDescription, ToastRoot, ToastTitle, ToastViewport } from '@vyrnforge/react/toast';
import '@vyrnforge/web/styles/button.css';
import '@vyrnforge/web/styles/toast.css';

type NotificationEvent = 'save-accepted' | 'job-failed' | 'outage-started' | 'security-notice';

function createNotificationService() {
  let listener: ((event: NotificationEvent) => void) | undefined;
  return {
    subscribe(next: (event: NotificationEvent) => void) {
      listener = next;
      return () => { if (listener === next) listener = undefined; };
    },
    emit(event: NotificationEvent) {
      listener?.(event);
    },
  };
}

const service = createNotificationService();
(globalThis as typeof globalThis & { __vfNotificationService?: typeof service }).__vfNotificationService = service;

function App() {
  const [savePending, setSavePending] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [saveToast, setSaveToast] = React.useState(false);
  const [jobFailed, setJobFailed] = React.useState(false);
  const [jobToast, setJobToast] = React.useState(false);
  const [retryCount, setRetryCount] = React.useState(0);
  const [outage, setOutage] = React.useState(false);
  const [outageVisible, setOutageVisible] = React.useState(true);
  const [securityNotice, setSecurityNotice] = React.useState(false);

  React.useEffect(() => service.subscribe((event) => {
    if (event === 'save-accepted') {
      setSavePending(false);
      setSaved(true);
      setSaveToast(true);
    } else if (event === 'job-failed') {
      setJobFailed(true);
      setJobToast(true);
    } else if (event === 'outage-started') {
      setOutage(true);
      setOutageVisible(true);
    } else if (event === 'security-notice') {
      setSecurityNotice(true);
    }
  }), []);

  return (
    <main>
      <h1>Notification and feedback selection</h1>
      <p>This representative uses application-owned events and durable destinations. VyrnForge Toast supplies transient presentation only; it is not the event store or recovery owner.</p>

      <section aria-labelledby="save-heading">
        <h2 id="save-heading">Profile save</h2>
        <p data-saved-state>{saved ? 'Profile saved authoritatively.' : savePending ? 'Save pending; no success has been committed.' : 'Profile has unsaved changes.'}</p>
        <Button type="button" loading={savePending} onClick={() => { setSavePending(true); setSaved(false); setSaveToast(false); }}>Save profile</Button>
      </section>

      <section aria-labelledby="jobs-heading">
        <h2 id="jobs-heading">Background jobs</h2>
        {jobFailed ? (
          <article data-job-record>
            <h3>Quarterly export failed</h3>
            <p>The durable job record remains available until the application resolves it.</p>
            <Button type="button" variant="secondary" onClick={() => { const next = retryCount + 1; setRetryCount(next); document.body.dataset.jobRetries = String(next); }}>Retry export</Button>
          </article>
        ) : <p>No failed background jobs.</p>}
      </section>

      <section aria-labelledby="service-heading">
        <h2 id="service-heading">Service status</h2>
        {outage && outageVisible ? (
          <div data-outage-banner>
            <strong>Reporting service outage</strong>
            <p>Reporting is unavailable. Profile editing remains available.</p>
            <Button type="button" variant="secondary" onClick={() => setOutageVisible(false)}>Hide outage notice</Button>
          </div>
        ) : null}
        {outage ? <p data-outage-durable>Reporting outage remains active.{!outageVisible ? ' Show the notice again when needed.' : ''}</p> : <p>All services available.</p>}
        {outage && !outageVisible ? <Button type="button" variant="secondary" onClick={() => setOutageVisible(true)}>Show outage notice</Button> : null}
      </section>

      <section aria-labelledby="security-heading">
        <h2 id="security-heading">Security activity</h2>
        {securityNotice ? (
          <>
            <div data-security-banner><strong>Critical security notice</strong><p>Review the new sign-in from the durable activity record.</p></div>
            <article data-security-record><h3>Security activity record</h3><p>New sign-in from an unrecognized device. Review remains available here.</p></article>
          </>
        ) : <p>No new security activity.</p>}
      </section>

      <ToastViewport id="notification-viewport">
        <ToastRoot id="save-success-toast" open={saveToast} duration={1000} onOpenChange={setSaveToast}>
          <ToastTitle>Profile saved</ToastTitle>
          <ToastDescription>Your committed profile is visible in the page.</ToastDescription>
          <ToastClose aria-label="Tutup notifikasi">×</ToastClose>
        </ToastRoot>
        <ToastRoot id="job-failure-toast" open={jobToast} duration={0} onOpenChange={setJobToast}>
          <ToastTitle>Export failed</ToastTitle>
          <ToastDescription>Open the durable job record to review and retry.</ToastDescription>
          <ToastClose aria-label="Tutup notifikasi pekerjaan">×</ToastClose>
        </ToastRoot>
      </ToastViewport>
    </main>
  );
}

document.body.dataset.jobRetries = '0';
createRoot(document.querySelector('#root')!).render(<App />);
