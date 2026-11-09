import '@angular/compiler';
import { Component, provideZonelessChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { VfPortalDirective } from '@vyrnforge/angular/portal';
const host = document.createElement('div'); host.id = 'portal-host'; document.body.append(host);
class App { target = host; }
Component({ selector: 'vf-example-root', standalone: true, imports: [VfPortalDirective], template: '<ng-template [vfPortal]="target"><button>Portal action</button></ng-template>' })(App);
bootstrapApplication(App, { providers: [provideZonelessChangeDetection()] });
