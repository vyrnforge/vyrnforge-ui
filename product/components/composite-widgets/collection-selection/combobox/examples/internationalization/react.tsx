import { ComboboxContent, ComboboxInput, ComboboxOption, ComboboxRoot } from '@vyrnforge/react/combobox';

const instant = new Date('2026-10-27T04:00:00Z');
const amount = 1234567.89;
const currency = 'USD';

const regions = [
  {
    lang: 'en',
    dir: 'ltr' as const,
    locale: 'en-US',
    timeZone: 'America/New_York',
    title: 'English (United States)',
    label: 'Choose the destination region for the international account transfer',
  },
  {
    lang: 'ar',
    dir: 'rtl' as const,
    locale: 'ar-EG',
    timeZone: 'Asia/Riyadh',
    title: 'العربية',
    label: 'اختر منطقة الوجهة الخاصة بعملية التحويل الدولية إلى الحساب المطلوب',
  },
];

const options = [
  { value: 'jakarta', label: 'Jakarta — إندونيسيا' },
  { value: 'riyadh', label: 'Riyadh — الرياض' },
  { value: 'new-york', label: 'New York — نيويورك' },
];

export function Example() {
  return (
    <div>
      {regions.map((region) => {
        const dateTime = new Intl.DateTimeFormat(region.locale, {
          dateStyle: 'long',
          timeStyle: 'short',
          timeZone: region.timeZone,
        }).format(instant);
        const money = new Intl.NumberFormat(region.locale, {
          style: 'currency',
          currency,
        }).format(amount);

        return (
          <section key={region.locale} lang={region.lang} dir={region.dir}>
            <h3>{region.title}</h3>
            <p>
              Account <bdi>ACME-42</bdi>
            </p>
            <p>
              <time dateTime={instant.toISOString()}>{dateTime}</time>
              {' · '}
              <data value={`${currency} ${amount}`}>{money}</data>
            </p>
            <ComboboxRoot>
              <ComboboxInput aria-label={region.label} />
              <ComboboxContent>
                {options.map((option) => (
                  <ComboboxOption key={option.value} value={option.value}>
                    {option.label}
                  </ComboboxOption>
                ))}
              </ComboboxContent>
            </ComboboxRoot>
          </section>
        );
      })}
    </div>
  );
}
