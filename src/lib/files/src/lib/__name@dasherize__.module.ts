import {
  ModuleWithProviders,
  NgModule
} from '@angular/core';

import { CommonModule } from '@angular/common';

import { Components } from './components';
import { Dialogs } from './dialogs';
import { Directives } from './directives';
import { Pipes } from './pipes';

import { <%= classify(name) %>Config } from './config';

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
export class <%= classify(name) %>Module {
  static forRoot(config: <%= classify(name) %>Config): ModuleWithProviders<<%= classify(name) %>Module> {
    return {
      ngModule: <%= classify(name) %>Module,
      providers: [
        { provide: <%= classify(name) %>Config, useValue: config }
      ]
    };
  }
}
