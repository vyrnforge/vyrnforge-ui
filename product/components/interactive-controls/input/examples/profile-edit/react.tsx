import { Text } from '@vyrnforge/react/text';
import { Flow } from '@vyrnforge/react/layout';
import { Link } from '@vyrnforge/react/link';
import { Checkbox } from '@vyrnforge/react/checkbox';
import { ToggleButton } from '@vyrnforge/react/toggle-button';
import { useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { Button } from '@vyrnforge/react/button';
import { Input } from '@vyrnforge/react/input';
import { Textarea } from '@vyrnforge/react/textarea';

type Locale = 'en' | 'id';
type Profile = {
  displayName: string;
  email: string;
  biography: string;
  hasWorkPhone: boolean;
  workPhone: string;
};
type ErrorKey = 'displayName' | 'email' | 'workPhone';
type Errors = Partial<Record<ErrorKey, string>>;

const initialProfile: Profile = {
  displayName: 'Atlas Research',
  email: 'team@example.com',
  biography: '',
  hasWorkPhone: false,
  workPhone: '',
};

const copy = {
  en: {
    heading: 'Profile details',
    displayName: 'Display name',
    displayHelp: 'Shown to people in your workspace.',
    email: 'Email address',
    emailHelp: 'Use an address you can access.',
    biography: 'Biography (optional)',
    phoneToggle: 'Add a work phone',
    phone: 'Work phone',
    phoneHelp: 'Include the country code when you know it.',
    save: 'Save changes',
    saveDraft: 'Save draft',
    restoreDraft: 'Restore draft',
    reset: 'Reset',
    cancel: 'Cancel',
    summary: 'There’s a problem',
    displayRequired: 'Enter a display name.',
    emailInvalid: 'Enter an email address in the format name@example.com.',
    emailTaken: 'That email address is already in use.',
    phoneRequired: 'Enter a work phone or turn off “Add a work phone”.',
    draftSaved: 'Draft saved in this example.',
    draftRestored: 'Saved draft restored.',
    noDraft: 'There is no saved draft to restore.',
    saved: 'Profile changes saved by the example service.',
    cancelQuestion: 'Discard unsaved changes?',
    discard: 'Discard changes',
    keepEditing: 'Keep editing',
    discarded: 'Unsaved changes discarded.',
  },
  id: {
    heading: 'Detail profil',
    displayName: 'Nama tampilan',
    displayHelp: 'Ditampilkan kepada orang di ruang kerja Anda.',
    email: 'Alamat email',
    emailHelp: 'Gunakan alamat yang dapat Anda akses.',
    biography: 'Biografi (opsional)',
    phoneToggle: 'Tambahkan telepon kantor',
    phone: 'Telepon kantor',
    phoneHelp: 'Sertakan kode negara jika Anda mengetahuinya.',
    save: 'Simpan perubahan',
    saveDraft: 'Simpan draf',
    restoreDraft: 'Pulihkan draf',
    reset: 'Atur ulang',
    cancel: 'Batal',
    summary: 'Ada masalah',
    displayRequired: 'Masukkan nama tampilan.',
    emailInvalid: 'Masukkan alamat email dengan format nama@example.com.',
    emailTaken: 'Alamat email tersebut sudah digunakan.',
    phoneRequired: 'Masukkan telepon kantor atau nonaktifkan “Tambahkan telepon kantor”.',
    draftSaved: 'Draf disimpan dalam contoh ini.',
    draftRestored: 'Draf tersimpan dipulihkan.',
    noDraft: 'Tidak ada draf tersimpan untuk dipulihkan.',
    saved: 'Perubahan profil disimpan oleh layanan contoh.',
    cancelQuestion: 'Buang perubahan yang belum disimpan?',
    discard: 'Buang perubahan',
    keepEditing: 'Lanjutkan mengedit',
    discarded: 'Perubahan yang belum disimpan dibuang.',
  },
} as const;

let exampleDraft: Profile | null = null;

export function Example() {
  const [locale, setLocale] = useState<Locale>('en');
  const [profile, setProfile] = useState<Profile>(initialProfile);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState('');
  const [pending, setPending] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const summaryRef = useRef<HTMLDivElement>(null);
  const t = copy[locale];

  function change<K extends keyof Profile>(key: K, value: Profile[K]) {
    setProfile((current) => ({ ...current, [key]: value }));
    if (key === 'displayName' || key === 'email' || key === 'workPhone') {
      const errorKey: ErrorKey = key;
      setErrors((current) => {
        const next = { ...current };
        delete next[errorKey];
        return next;
      });
    }
    setStatus('');
  }

  function validate(form: HTMLFormElement) {
    const next: Errors = {};
    const displayName = form.elements.namedItem('displayName') as HTMLInputElement;
    const email = form.elements.namedItem('email') as HTMLInputElement;
    if (!displayName.value.trim()) next.displayName = t.displayRequired;
    if (!email.validity.valid) next.email = t.emailInvalid;
    if (profile.hasWorkPhone && !profile.workPhone.trim()) next.workPhone = t.phoneRequired;
    return next;
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const form = event.currentTarget;
    const next = validate(form);
    if (Object.keys(next).length) {
      setErrors(next);
      requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }

    setPending(true);
    setStatus('');
    await new Promise((resolve) => setTimeout(resolve, 250));
    if (profile.email.toLowerCase() === 'taken@example.com') {
      setErrors({ email: t.emailTaken });
      setPending(false);
      requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }
    setPending(false);
    setStatus(t.saved);
  }

  function resetWorkflow() {
    setProfile(initialProfile);
    setErrors({});
    setStatus('');
    setConfirmCancel(false);
  }

  function saveDraft() {
    exampleDraft = { ...profile };
    setStatus(t.draftSaved);
  }

  function restoreDraft() {
    if (!exampleDraft) {
      setStatus(t.noDraft);
      return;
    }
    setProfile(exampleDraft);
    setErrors({});
    setStatus(t.draftRestored);
  }

  const describedBy = (help: string, error?: string) => error ? `${help} ${error}` : help;

  return (
    <Flow as="section" lang={locale}>
      <Flow direction="inline" wrap="wrap">
        <ToggleButton pressed={locale === 'en'} onClick={() => setLocale('en')}>English</ToggleButton>
        <ToggleButton pressed={locale === 'id'} onClick={() => setLocale('id')}>Bahasa Indonesia</ToggleButton>
      </Flow>
      <Text as="h2" variant="heading-md">{t.heading}</Text>
      <Flow as="form" noValidate onSubmit={submit} onReset={resetWorkflow}>
        {Object.keys(errors).length > 0 && (
          <Flow ref={summaryRef} tabIndex={-1} aria-labelledby="profile-error-heading">
            <Text as="h3" variant="heading-sm" id="profile-error-heading">{t.summary}</Text>
            <Flow as="ul" gap="xs">
              {errors.displayName && <li><Link href="#profile-display-name">{errors.displayName}</Link></li>}
              {errors.email && <li><Link href="#profile-email">{errors.email}</Link></li>}
              {errors.workPhone && <li><Link href="#profile-work-phone">{errors.workPhone}</Link></li>}
            </Flow>
          </Flow>
        )}

        <Flow>
          <label htmlFor="profile-display-name">{t.displayName}</label>
          <Text as="p" id="profile-display-help">{t.displayHelp}</Text>
          <Input
            id="profile-display-name"
            name="displayName"
            autoComplete="name"
            required
            value={profile.displayName}
            aria-invalid={errors.displayName ? true : undefined}
            aria-describedby={describedBy('profile-display-help', errors.displayName ? 'profile-display-error' : undefined)}
            onChange={(event) => change('displayName', event.currentTarget.value)}
          />
          {errors.displayName && <Text as="p" id="profile-display-error">{errors.displayName}</Text>}
        </Flow>

        <Flow>
          <label htmlFor="profile-email">{t.email}</label>
          <Text as="p" id="profile-email-help">{t.emailHelp}</Text>
          <Input
            id="profile-email"
            type="email"
            name="email"
            autoComplete="email"
            required
            value={profile.email}
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={describedBy('profile-email-help', errors.email ? 'profile-email-error' : undefined)}
            onChange={(event) => change('email', event.currentTarget.value)}
          />
          {errors.email && <Text as="p" id="profile-email-error">{errors.email}</Text>}
        </Flow>

        <Flow>
          <label htmlFor="profile-biography">{t.biography}</label>
          <Textarea
            id="profile-biography"
            name="biography"
            value={profile.biography}
            onChange={(event) => change('biography', event.currentTarget.value)}
          />
        </Flow>

        <Flow as="label" direction="inline" align="center" gap="sm">
          <Checkbox
            checked={profile.hasWorkPhone}
            onChange={(event) => change('hasWorkPhone', event.currentTarget.checked)}
          />
          <Text>{t.phoneToggle}</Text>
        </Flow>
        {profile.hasWorkPhone && (
          <Flow>
            <label htmlFor="profile-work-phone">{t.phone}</label>
            <Text as="p" id="profile-phone-help">{t.phoneHelp}</Text>
            <Input
              id="profile-work-phone"
              type="tel"
              name="workPhone"
              autoComplete="tel"
              required
              value={profile.workPhone}
              aria-invalid={errors.workPhone ? true : undefined}
              aria-describedby={describedBy('profile-phone-help', errors.workPhone ? 'profile-phone-error' : undefined)}
              onChange={(event) => change('workPhone', event.currentTarget.value)}
            />
            {errors.workPhone && <Text as="p" id="profile-phone-error">{errors.workPhone}</Text>}
          </Flow>
        )}

        <Flow direction="inline" wrap="wrap">
          <Button type="submit" loading={pending}>{t.save}</Button>
          <Button type="button" variant="secondary" onClick={saveDraft}>{t.saveDraft}</Button>
          <Button type="button" variant="secondary" onClick={restoreDraft}>{t.restoreDraft}</Button>
          <Button type="reset" variant="ghost">{t.reset}</Button>
          <Button type="button" variant="ghost" onClick={() => setConfirmCancel(true)}>{t.cancel}</Button>
        </Flow>

        {confirmCancel && (
          <Flow role="group" aria-labelledby="profile-cancel-question">
            <Text as="p" id="profile-cancel-question">{t.cancelQuestion}</Text>
            <Button type="button" variant="secondary" onClick={() => { resetWorkflow(); setStatus(t.discarded); }}>{t.discard}</Button>
            <Button type="button" variant="ghost" onClick={() => setConfirmCancel(false)}>{t.keepEditing}</Button>
          </Flow>
        )}
        <Text as="p" role="status">{status}</Text>
      </Flow>
    </Flow>
  );
}
