import { Text } from '@vyrnforge/react/text';
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { AppShell, AppShellBody, AppShellHeader, AppShellMain, AppShellNavigation } from '@vyrnforge/react/app-shell';
import { Button } from '@vyrnforge/react/button';
import { DrawerBody, DrawerClose, DrawerRoot, DrawerTitle } from '@vyrnforge/react/drawer';
import { Input } from '@vyrnforge/react/input';
import { SideNav, SideNavGroup, SideNavGroupLabel, SideNavItem, SideNavLink, SideNavList } from '@vyrnforge/react/side-nav';
import { TabsList, TabsPanel, TabsRoot, TabsTab } from '@vyrnforge/react/tabs';
import '@vyrnforge/web/styles/app-shell.css';
import '@vyrnforge/web/styles/button.css';
import '@vyrnforge/web/styles/drawer.css';
import '@vyrnforge/web/styles/input.css';
import '@vyrnforge/web/styles/side-nav.css';
import '@vyrnforge/web/styles/tabs.css';
import './example.css';

const destinations = {
  '/settings/profile': { label: 'Profile', title: 'Profile settings' },
  '/settings/security': { label: 'Security', title: 'Security settings' },
} as const;

const routeTitles = {
  '/settings/profile': 'Profile settings',
  '/settings/profile/edit': 'Edit profile',
  '/settings/security': 'Security settings',
} as const;

type Destination = keyof typeof destinations;
type Route = keyof typeof routeTitles;
type ProfileTab = 'details' | 'preferences';

function readLocation(): { route: Route | 'not-found'; profileTab: ProfileTab } {
  const url = new URL(window.location.href);
  const routeValue = url.searchParams.get('route');
  const tabValue = url.searchParams.get('tab');
  const route = routeValue && routeValue in routeTitles ? routeValue as Route : routeValue === null ? '/settings/profile' : 'not-found';
  const profileTab = tabValue === 'preferences' ? 'preferences' : 'details';
  return { route, profileTab };
}

function hrefFor(route: Route, profileTab: ProfileTab = 'details') {
  const url = new URL(window.location.href);
  url.searchParams.set('route', route);
  if (route === '/settings/profile') url.searchParams.set('tab', profileTab);
  else url.searchParams.delete('tab');
  if (route === '/settings/profile/edit') url.searchParams.set('returnTab', profileTab);
  else url.searchParams.delete('returnTab');
  return `${url.pathname}${url.search}${url.hash}`;
}

function currentDestination(route: Route | 'not-found'): Destination | null {
  if (route === '/settings/profile' || route === '/settings/profile/edit') return '/settings/profile';
  if (route === '/settings/security') return '/settings/security';
  return null;
}

interface SettingsNavigationProps {
  route: Route | 'not-found';
  profileTab: ProfileTab;
  onNavigate(route: Route, afterNavigate?: () => void): (event: React.MouseEvent<HTMLAnchorElement>) => void;
}

function SettingsNavigation({ route, profileTab, onNavigate }: SettingsNavigationProps) {
  const current = currentDestination(route);
  return (
    <SideNav aria-label="Settings">
      <SideNavGroup>
        <SideNavGroupLabel>Account</SideNavGroupLabel>
        <SideNavList>
          {(Object.keys(destinations) as Destination[]).map((destination) => (
            <SideNavItem key={destination}>
              <SideNavLink href={hrefFor(destination, profileTab)} current={current === destination} onClick={onNavigate(destination)}>
                {destinations[destination].label}
              </SideNavLink>
            </SideNavItem>
          ))}
        </SideNavList>
      </SideNavGroup>
    </SideNav>
  );
}

function App() {
  const initial = React.useMemo(() => readLocation(), []);
  const [route, setRoute] = React.useState<Route | 'not-found'>(initial.route);
  const [profileTab, setProfileTab] = React.useState<ProfileTab>(initial.profileTab);
  const [navigationOpen, setNavigationOpen] = React.useState(false);
  const [narrow, setNarrow] = React.useState(() => window.matchMedia('(max-width: 48rem)').matches);
  const [displayNameDraft, setDisplayNameDraft] = React.useState('Avery Example');
  const [savedDisplayName, setSavedDisplayName] = React.useState('Avery Example');
  const [profileMessage, setProfileMessage] = React.useState('No unsaved profile changes.');
  const mainRef = React.useRef<HTMLElement>(null);
  const railRef = React.useRef<HTMLElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const responsiveFocus = React.useRef<'trigger' | 'destination' | null>(null);
  const focusAfterRoute = React.useRef(false);

  const focusDestination = React.useCallback(() => {
    const rail = railRef.current;
    const links = [...(rail?.querySelectorAll<HTMLAnchorElement>('a[href]') ?? [])];
    const destination = links.find(link => link.getAttribute('aria-current') === 'page') ?? links[0] ?? mainRef.current;
    destination?.focus();
    if (document.activeElement !== destination) mainRef.current?.focus();
  }, []);

  React.useLayoutEffect(() => {
    const media = window.matchMedia('(max-width: 48rem)');
    const drawer = document.getElementById('settings-navigation-drawer') as HTMLDialogElement;
    const syncViewport = () => {
      const active = document.activeElement;
      if (media.matches) {
        responsiveFocus.current = railRef.current?.contains(active) ? 'trigger' : null;
      } else {
        responsiveFocus.current = drawer.open || active === triggerRef.current ? 'destination' : null;
        setNavigationOpen(false);
      }
      setNarrow(media.matches);
    };
    const afterDrawerClose = () => {
      if (!media.matches && responsiveFocus.current === 'destination') {
        responsiveFocus.current = null;
        focusDestination();
      }
    };
    media.addEventListener('change', syncViewport);
    drawer.addEventListener('close', afterDrawerClose);
    return () => {
      media.removeEventListener('change', syncViewport);
      drawer.removeEventListener('close', afterDrawerClose);
    };
  }, [focusDestination]);

  React.useLayoutEffect(() => {
    if (responsiveFocus.current === 'trigger' && narrow) {
      responsiveFocus.current = null;
      triggerRef.current?.focus();
    } else if (responsiveFocus.current === 'destination' && !narrow) {
      const drawer = document.getElementById('settings-navigation-drawer') as HTMLDialogElement;
      // A modal makes the rail inert until native close. The close listener
      // completes the transfer rather than fighting the Drawer focus contract.
      if (!drawer.open) {
        responsiveFocus.current = null;
        focusDestination();
      }
    }
  }, [narrow, focusDestination]);

  React.useEffect(() => {
    const onPopState = () => {
      const next = readLocation();
      focusAfterRoute.current = true;
      setRoute(next.route);
      setProfileTab(next.profileTab);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  React.useEffect(() => {
    document.title = route === 'not-found' ? 'Settings page not found' : routeTitles[route];
    if (focusAfterRoute.current) {
      focusAfterRoute.current = false;
      requestAnimationFrame(() => mainRef.current?.focus());
    }
  }, [route]);

  const navigate = React.useCallback((nextRoute: Route, afterNavigate?: () => void) => (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.currentTarget.target === '_blank' || event.currentTarget.hasAttribute('download')) return;
    event.preventDefault();
    window.history.pushState({}, '', event.currentTarget.href);
    const next = readLocation();
    focusAfterRoute.current = true;
    setRoute(next.route);
    setProfileTab(next.profileTab);
    afterNavigate?.();
  }, []);

  function changeProfileTab(nextTab: string) {
    const tab = nextTab === 'preferences' ? 'preferences' : 'details';
    setProfileTab(tab);
    const url = new URL(window.location.href);
    url.searchParams.set('route', '/settings/profile');
    url.searchParams.set('tab', tab);
    window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
  }

  function saveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = displayNameDraft.trim();
    if (!value) return;
    setDisplayNameDraft(value);
    setSavedDisplayName(value);
    setProfileMessage(`Saved display name ${value}.`);
  }

  function cancelProfileEdit() {
    setDisplayNameDraft(savedDisplayName);
    setProfileMessage('Unsaved profile changes discarded.');
  }

  const returnTab = new URL(window.location.href).searchParams.get('returnTab') === 'preferences' ? 'preferences' : 'details';

  return (
    <AppShell>
      <AppShellHeader className="settings-shell-header">
        <Text as="strong" variant="label-md">Account settings</Text>
        <Button
          className="settings-nav-trigger"
          ref={triggerRef}
          hidden={!narrow}
          type="button"
          variant="secondary"
          aria-controls="settings-navigation-drawer"
          aria-expanded={navigationOpen}
          onClick={() => setNavigationOpen(true)}
        >
          Settings navigation
        </Button>
      </AppShellHeader>
      <AppShellBody>
        <AppShellNavigation ref={railRef} hidden={narrow} className="settings-persistent-navigation">
          <SettingsNavigation route={route} profileTab={profileTab} onNavigate={navigate} />
        </AppShellNavigation>
        <AppShellMain ref={mainRef} tabIndex={-1}>
          {route === '/settings/profile' ? (
            <>
              <Text as="h1" variant="heading-lg">Profile settings</Text>
              <TabsRoot value={profileTab} onValueChange={changeProfileTab}>
                <TabsList aria-label="Profile settings sections">
                  <TabsTab value="details">Details</TabsTab>
                  <TabsTab value="preferences">Preferences</TabsTab>
                </TabsList>
                <TabsPanel value="details">
                  <Text as="p">Update the public details shown on your profile.</Text>
                  <form className="settings-profile-form" onSubmit={saveProfile}>
                    <label htmlFor="settings-display-name">Display name</label>
                    <Input
                      id="settings-display-name"
                      name="displayName"
                      value={displayNameDraft}
                      onChange={(event) => {
                        setDisplayNameDraft(event.currentTarget.value);
                        setProfileMessage('Display name has unsaved changes.');
                      }}
                    />
                    <div className="settings-profile-actions">
                      <Button type="submit">Save profile</Button>
                      <Button type="button" variant="secondary" onClick={cancelProfileEdit}>Cancel edits</Button>
                    </div>
                    <Text as="p" role="status">{profileMessage}</Text>
                  </form>
                  <Text as="p"><SideNavLink href={hrefFor('/settings/profile/edit', profileTab)} onClick={navigate('/settings/profile/edit')}>Edit profile</SideNavLink></Text>
                </TabsPanel>
                <TabsPanel value="preferences"><Text as="p">Choose profile display preferences.</Text></TabsPanel>
              </TabsRoot>
            </>
          ) : route === '/settings/profile/edit' ? (
            <>
              <Text as="h1" variant="heading-lg">Edit profile</Text>
              <Text as="p">Edit is a nested route owned by the example application.</Text>
              <Text as="p"><SideNavLink href={hrefFor('/settings/profile', returnTab)} onClick={navigate('/settings/profile')}>Return to profile settings</SideNavLink></Text>
            </>
          ) : route === '/settings/security' ? (
            <><Text as="h1" variant="heading-lg">Security settings</Text><Text as="p">Review password and sign-in protections.</Text></>
          ) : (
            <><Text as="h1" variant="heading-lg">Settings page not found</Text><Text as="p"><SideNavLink href={hrefFor('/settings/profile')} onClick={navigate('/settings/profile')}>Return to profile settings</SideNavLink></Text></>
          )}
        </AppShellMain>
      </AppShellBody>
      <DrawerRoot id="settings-navigation-drawer" placement="start" open={navigationOpen} onOpenChange={setNavigationOpen}>
        <DrawerTitle>Settings navigation</DrawerTitle>
        <DrawerBody>
          <SettingsNavigation
            route={route}
            profileTab={profileTab}
            onNavigate={(nextRoute) => navigate(nextRoute, () => setNavigationOpen(false))}
          />
        </DrawerBody>
        <DrawerClose>Close navigation</DrawerClose>
      </DrawerRoot>
    </AppShell>
  );
}

createRoot(document.querySelector('#root')!).render(<App />);
