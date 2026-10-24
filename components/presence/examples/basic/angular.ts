import '@angular/compiler';
import { Component, provideZonelessChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { VfPresenceDirective } from '@vyrnforge/angular/presence';
class App { present=true; }
Component({selector:'vf-example-root',standalone:true,imports:[VfPresenceDirective],template:'<button (click)="present=false">Close</button><ng-template [vfPresence]="present" let-state let-completeExit="completeExit"><div [attr.data-state]="state">Panel <button *ngIf="false"></button><button [hidden]="state !== \'exiting\'" (click)="completeExit()">Complete exit</button></div></ng-template>'})(App);
bootstrapApplication(App,{providers:[provideZonelessChangeDetection()]});
