import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Components } from './components';
import { Dialogs } from './dialogs';
import { Directives } from './directives';
import { Pipes } from './pipes';

@NgModule({
  declarations: [
    ...Components,
    ...Dialogs,
    ...Directives,
    ...Pipes
  ],
  entryComponents: [
    ...Dialogs
  ],
  imports: [
    CommonModule
  ],
  exports: [
    ...Components,
    ...Dialogs,
    ...Directives,
    ...Pipes
  ]
})
export class <%= classify(name) %>Module { }
