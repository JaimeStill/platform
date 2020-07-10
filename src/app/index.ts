import {
  JsonObject,
  join,
  normalize,
  strings
} from '@angular-devkit/core';

import {
  MergeStrategy,
  Rule,
  SchematicsException,
  Tree,
  apply,
  chain,
  mergeWith,
  move,
  template,
  url,
  SchematicContext
} from '@angular-devkit/schematics';

import {
  NodePackageInstallTask
} from '@angular-devkit/schematics/tasks';

import {
  addTsConfigProjectReferences,
  verifyBaseTsConfigExists
} from '../utility/ts-config';

import {
  getWorkspace,
  updateWorkspace
} from '../utility/workspace';

import {
  Builders,
  ProjectType
} from '../utility/workspace-models';

import { addPackageJsonScript } from '../utility/dependencies';
import { relativePathToWorkspaceRoot } from '../utility/paths';
import { validateProjectName } from '../utility/validation';

import { Schema } from './schema';

function updatePackageJson(options: Schema) {
  return (host: Tree, context: SchematicContext) => {
    addPackageJsonScript(host, `start:${options.name}`, `ng serve ${options.name}`);

    if (!options.skipInstall) {
      context.addTask(new NodePackageInstallTask({ packageManager: 'yarn' }));
    }

    return host;
  };
}

function addAppToWorkspaceFile(options: Schema, appDir: string): Rule {
  let projectRoot = appDir;
  if (projectRoot) {
    projectRoot += '/';
  }

  const schematics: JsonObject = {};

  const componentSchematicsOptions: JsonObject = {};
  componentSchematicsOptions.inlineTemplate = false;
  componentSchematicsOptions.inlineStyle = false;
  componentSchematicsOptions.style = 'scss';
  componentSchematicsOptions.skipTests = true;

  schematics['@schematics/angular:component'] = componentSchematicsOptions;

  ['class', 'directive', 'guard', 'interceptor', 'module', 'pipe', 'service'].forEach((type) => {
    if (!(`@schematics/angular:${type}` in schematics)) {
      schematics[`@schematics/angular:${type}`] = {};
    }
    (schematics[`@schematics/angular:${type}`] as JsonObject).skipTests = true;
  });

  const sourceRoot = join(normalize(projectRoot), 'src');

  let budgets = [
    {
      type: 'initial',
      maximumWarning: '2mb',
      maximumError: '5mb'
    },
    {
      type: 'anyComponentStyle',
      maximumWarning: '6kb',
      maximumError: '10kb'
    }
  ];

  const project = {
    root: normalize(projectRoot),
    sourceRoot,
    projectType: ProjectType.Application,
    prefix: options.prefix || 'app',
    schematics,
    targets: {
      build: {
        builder: Builders.Browser,
        options: {
          outputPath: `dist/${options.name}`,
          index: `${sourceRoot}/index.html`,
          main: `${sourceRoot}/main.ts`,
          polyfills: `${sourceRoot}/polyfills.ts`,
          tsConfig: `${projectRoot}tsconfig.app.json`,
          aot: true,
          assets: [
            `${sourceRoot}/favicon.ico`,
            `${sourceRoot}/assets`,
            {
              "glob": "**/*",
              "input": "./assets",
              "output": `${sourceRoot}/assets`
            }
          ],
          "styles": [
            "theme/theme.scss"
          ],
          "scripts": [
            "node_modules/hammerjs/hammer.js"
          ]
        },
        configurations: {
          production: {
            fileReplacements: [{
              replace: `${sourceRoot}/environments/environment.ts`,
              with: `${sourceRoot}/environments/environment.prod.ts`
            }],
            optimization: true,
            outputHashing: 'all',
            sourceMap: false,
            extractCss: true,
            namedChunks: false,
            extractLicenses: true,
            vendorChunk: false,
            buildOptimizer: true,
            budgets,
          }
        }
      },
      serve: {
        builder: Builders.DevServer,
        options: {
          browserTarget: `${options.name}:build`,
          port: options.port
        },
        configurations: {
          production: {
            browserTarget: `${options.name}:build:production`
          }
        }
      },
      'extract-i18n': {
        builder: Builders.ExtractI18n,
        options: {
          browserTarget: `${options.name}:build`
        }
      },
      lint: {
        builder: Builders.TsLint,
        options: {
          tsConfig: [
            `${projectRoot}/tsconfig.app.json`
          ],
          exclude: [
            '**/node_modules/**'
          ]
        }
      }
    }
  };

  return updateWorkspace(workspace => {
    if (workspace.projects.size === 0) {
      workspace.extensions.defaultProject = options.name;
    }

    workspace.projects.add({
      name: options.name,
      ...project
    });
  });
}

export default function (options: Schema): Rule {
  return async (host: Tree) => {
    if (!options.name) {
      throw new SchematicsException(`Invalid options, "name" is required.`);
    }

    validateProjectName(options.name);
    verifyBaseTsConfigExists(host);

    const workspace = await getWorkspace(host);
    const newProjectRoot = workspace.extensions.newProjectRoot as (string | undefined) || '';
    const isRootApp = options.projectRoot !== undefined;
    const appDir = isRootApp
      ? normalize(options.projectRoot || '')
      : join(normalize(newProjectRoot), options.name);

    return chain([
      addAppToWorkspaceFile(options, appDir),
      mergeWith(
        apply(url('./files'), [
          template({
            ...strings,
            ...options,
            relativePathToWorkspaceRoot: relativePathToWorkspaceRoot(appDir),
            appName: options.name,
            isRootApp
          }),
          move(appDir)
        ]), MergeStrategy.Overwrite
      ),
      addTsConfigProjectReferences([
        join(appDir, 'tsconfig.app.json')
      ]),
      updatePackageJson(options)
    ]);
  };
}
