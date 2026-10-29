// Angular libraries are published in partial-Ivy APF form. Load the compiler in the Node test runtime so direct package-import SSR smoke tests can execute without an application linker.
import '@angular/compiler';
