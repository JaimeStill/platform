import {
  ModuleWithProviders,
  NgModule
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { MaterialModule } from './material.module';
import { Components } from './components';
import { ServerConfig } from './config';
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
    CommonModule,
    FormsModule,
    HttpClientModule,
    MaterialModule
  ],
  exports: [
    ...Components,
    ...Dialogs,
    ...Directives,
    ...Pipes
  ]
})
export class <%= classify(library) %>Module {
  static forRoot(config: ServerConfig): ModuleWithProviders<<%= classify(library) %>Module> {
    return {
      ngModule: <%= classify(library) %>Module,
      providers: [
        { provide: ServerConfig, useValue: config }
      ]
    };
  }
}
