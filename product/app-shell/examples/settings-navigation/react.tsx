import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { AppShell, AppShellBody, AppShellHeader, AppShellMain, AppShellNavigation } from '@vyrnforge/react/app-shell';
import { SideNav, SideNavGroup, SideNavGroupLabel, SideNavItem, SideNavLink, SideNavList } from '@vyrnforge/react/side-nav';
import { TabsList, TabsPanel, TabsRoot, TabsTab } from '@vyrnforge/react/tabs';
import '@vyrnforge/web/styles/app-shell.css';
import '@vyrnforge/web/styles/side-nav.css';
import '@vyrnforge/web/styles/tabs.css';

const routes = {
  '/settings/profile': { label: 'Profile', title: 'Profile settings' },
  '/settings/security': { label: 'Security', title: 'Security settings' },
} as const;

type Route = keyof typeof routes;

function readRoute(): Route | 'not-found' {
  const value = new URL(window.location.href).searchParams.get('route');
  if (value && value in routes) return value as Route;
  return value === null ? '/settings/profile' : 'not-found';
}

function hrefFor(route: Route) {
  const url = new URL(window.location.href);
  url.searchParams.set('route', route);
  return `${url.pathname}${url.search}${url.hash}`;
}

function App() {
  const [route, setRoute] = React.useState<Route | 'not-found'>(() => readRoute());
  const [profileTab, setProfileTab] = React.useState('details');
  const mainRef = React.useRef<HTMLElement>(null);
  const focusAfterRoute = React.useRef(false);

  React.useEffect(() => {
    const onPopState = () => {
      focusAfterRoute.current = true;
      setRoute(readRoute());
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  React.useEffect(() => {
    document.title = route === 'not-found' ? 'Settings page not found' : routes[route].title;
    if (focusAfterRoute.current) {
      focusAfterRoute.current = false;
      mainRef.current?.focus();
    }
  }, [route]);

  const navigate = (nextRoute: Route) => (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.currentTarget.target === '_blank' || event.currentTarget.hasAttribute('download')) return;
    event.preventDefault();
    window.history.pushState({}, '', event.currentTarget.href);
    focusAfterRoute.current = true;
    setRoute(nextRoute);
  };

  return (
    <AppShell>
      <AppShellHeader><strong>Account settings</strong></AppShellHeader>
      <AppShellBody>
        <AppShellNavigation>
          <SideNav aria-label="Settings">
            <SideNavGroup>
              <SideNavGroupLabel>Account</SideNavGroupLabel>
              <SideNavList>
                {(Object.keys(routes) as Route[]).map((destination) => (
                  <SideNavItem key={destination}>
                    <SideNavLink href={hrefFor(destination)} current={route === destination} onClick={navigate(destination)}>
                      {routes[destination].label}
                    </SideNavLink>
                  </SideNavItem>
                ))}
              </SideNavList>
            </SideNavGroup>
          </SideNav>
        </AppShellNavigation>
        <AppShellMain ref={mainRef} tabIndex={-1}>
          {route === '/settings/profile' ? (
            <>
              <h1>Profile settings</h1>
              <TabsRoot value={profileTab} onValueChange={setProfileTab}>
                <TabsList aria-label="Profile settings sections">
                  <TabsTab value="details">Details</TabsTab>
                  <TabsTab value="preferences">Preferences</TabsTab>
                </TabsList>
                <TabsPanel value="details"><p>Update the public details shown on your profile.</p></TabsPanel>
                <TabsPanel value="preferences"><p>Choose profile display preferences.</p></TabsPanel>
              </TabsRoot>
            </>
          ) : route === '/settings/security' ? (
            <><h1>Security settings</h1><p>Review password and sign-in protections.</p></>
          ) : (
            <><h1>Settings page not found</h1><p><SideNavLink href={hrefFor('/settings/profile')} onClick={navigate('/settings/profile')}>Return to profile settings</SideNavLink></p></>
          )}
        </AppShellMain>
      </AppShellBody>
    </AppShell>
  );
}

createRoot(document.querySelector('#root')!).render(<App />);
