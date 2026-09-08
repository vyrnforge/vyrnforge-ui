import { provideZonelessChangeDetection } from "@angular/core";
import { bootstrapApplication } from "@angular/platform-browser";
import { provideVyrnForge } from "@vyrnforge/ui-angular";

import { AppComponent } from "./app/app.component";

bootstrapApplication(AppComponent, {
  providers: [provideZonelessChangeDetection(), provideVyrnForge()],
}).catch((error: unknown) => {
  console.error(error);
});
