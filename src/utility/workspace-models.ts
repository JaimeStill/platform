import { experimental } from '@angular-devkit/core';

export enum ProjectType {
  Application = 'application',
  Library = 'library'
}

export enum Builders {
  AppShell = '@angular-devkit/build-angular:app-shell',
  Server = '@angular-devkit/build-angular:server',
  Browser = '@angular-devkit/build-angular:browser',
  TsLint = '@angular-devkit/build-angular:tslint',
  NgPackagr = '@angular-devkit/build-ng-packagr:build',
  DevServer = '@angular-devkit/build-angular:dev-server',
  ExtractI18n = '@angular-devkit/build-angular:extract-i18n'
}

export interface FileReplacements {
  replace: string;
  with: string;
}

export interface BrowserBuilderBaseOptions {
  main: string;
  tsConfig: string;
  fileReplacements?: FileReplacements[];
  outputPath?: string;
  index?: string;
  polyfills: string;
  assets?: (object|string)[];
  styles?: (object|string)[];
  scripts?: (object|string)[];
  sourceMap?: boolean;
}

export type OutputHashing = 'all' | 'media' | 'none' | 'bundles';

export interface BrowserBuilderOptions extends BrowserBuilderBaseOptions {
  serviceWorker?: boolean;
  optimization?: boolean;
  outputHashing?: OutputHashing;
  resourcesOutputPath?: string;
  extractCss?: boolean;
  namedChunks?: boolean;
  aot?: boolean;
  extractLicenses?: boolean;
  vendorChunk?: boolean;
  buildOptimizer?: boolean;
  ngswConfigPath?: string;
  budgets?: {
    type: string;
    maximumWarning?: string;
    maximumError?: string;
  }[];
  webWorkerTsConfig?: string;
}

export interface ServeBuilderOptions {
  browserTarget: string;
}

export interface LibraryBuilderOptions {
  tsConfig: string;
  project: string;
}

export interface ServerBuilderOptions {
  outputPath: string;
  tsConfig: string;
  main: string;
  fileReplacements?: FileReplacements[];
  optimization?: {
    scripts?: boolean;
    styles?: boolean;
  };
  sourceMap?: boolean | {
    scripts?: boolean;
    styles?: boolean;
    hidden?: boolean;
    vendor?: boolean;
  };
}

export interface AppShellBuilderOptions {
  browserTarget: string;
  serverTarget: string;
  route: string;
}

export interface LintBuilderOptions {
  tsConfig: string[] | string;
  exclude?: string[];
}

export interface ExtractI18nOptions {
  browserTarget: string;
}

export interface BuilderTarget<TBuilder extends Builders, TOptions> {
  builder: TBuilder;
  options: TOptions;
  configurations?: {
    production: Partial<TOptions>;
    [key: string]: Partial<TOptions>;
  };
}

export type LibraryBuilderTarget = BuilderTarget<Builders.NgPackagr, LibraryBuilderOptions>;
export type BrowserBuilderTarget = BuilderTarget<Builders.Browser, BrowserBuilderOptions>;
export type ServerBuilderTarget = BuilderTarget<Builders.Server, ServerBuilderOptions>;
export type AppShellBuilderTarget = BuilderTarget<Builders.AppShell, AppShellBuilderOptions>;
export type LintBuilderTarget = BuilderTarget<Builders.TsLint, LintBuilderOptions>;
export type ServeBuilderTarget = BuilderTarget<Builders.DevServer, ServeBuilderOptions>;
export type ExtractI18nBuilderTarget = BuilderTarget<Builders.ExtractI18n, ExtractI18nOptions>;

export interface WorkspaceTargets<TProjectType extends ProjectType = ProjectType.Application> {
  build?: TProjectType extends ProjectType.Library ? LibraryBuilderTarget : BrowserBuilderTarget;
  server?: ServerBuilderTarget;
  lint?: LintBuilderTarget;
  serve?: ServeBuilderTarget;
  'app-shell'?: AppShellBuilderTarget;
  'extract-i18n'?: ExtractI18nBuilderTarget;
  [key: string]: any;
}

export interface WorkspaceProject<TProjectType extends ProjectType = ProjectType.Application>
  extends experimental.workspace.WorkspaceProject {
    projectType: ProjectType;
    architect?: WorkspaceTargets<TProjectType>;
    targets?: WorkspaceTargets<TProjectType>;
  }

export interface WorkspaceSchema extends experimental.workspace.WorkspaceSchema {
  projects: {
    [key: string]: WorkspaceProject<ProjectType.Application | ProjectType.Library>;
  };
}
