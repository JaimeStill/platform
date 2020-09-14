import {
  ModuleWithProviders,
  NgModule
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import {
  ApiComponents,
  ApiDialogs,
  ApiDirectives,
  ApiPipes
} from './api';

import { MaterialModule } from './material.module';
import { ServerConfig } from './config';
import { Dialogs } from './dialogs';
import { Directives } from './directives';
import { Pipes } from './pipes';

@NgModule({
  declarations: [
    ...ApiComponents,
    ...ApiDialogs,
    ...ApiDirectives,
    ...ApiPipes,
    ...Dialogs,
    ...Directives,
    ...Pipes
  ],
  entryComponents: [
    ...ApiDialogs,
    ...Dialogs
  ],
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    MaterialModule
  ],
  exports: [
    MaterialModule,
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