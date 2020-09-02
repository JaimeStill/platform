import {
  JsonParseMode,
  join,
  normalize,
  parseJson,
  strings
} from '@angular-devkit/core';

import {
  Rule,
  SchematicContext,
  Tree,
  apply,
  chain,
  mergeWith,
  move,
  template,
  url
} from '@angular-devkit/schematics';

import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';

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

import { Schema } from './schema';

interface UpdateJsonFn<T> {
  (obj: T): T | void;
}

type TsConfigPartialType = {
  compilerOptions: {
    baseUrl: string,
    paths: {
      [key: string]: string[];
    }
  }
};

function updateJsonFile<T>(host: Tree, path: string, callback: UpdateJsonFn<T>): Tree {
  const source = host.read(path);
  if (source) {
    const sourceText = source.toString('utf-8');
    const json = parseJson(sourceText, JsonParseMode.Loose);
    callback(json as {} as T);
    host.overwrite(path, JSON.stringify(json, null, 2));
  }

  return host;
}

function updateTsConfig(packageName: string, ...paths: string[]) {
  return (host: Tree) => {
    if (!host.exists('tsconfig.base.json')) { return host; }

    return updateJsonFile(host, 'tsconfig.base.json', (tsconfig: TsConfigPartialType) => {
      if (!tsconfig.compilerOptions.paths) {
        tsconfig.compilerOptions.paths = {};
      }

      if (!tsconfig.compilerOptions.paths[packageName]) {
        tsconfig.compilerOptions.paths[packageName] = [];
      }

      tsconfig.compilerOptions.paths[packageName].push(...paths);
    });
  };
}

function updatePackageJson(options: Schema) {
  return (host: Tree, context: SchematicContext) => {
    addPackageJsonScript(host, `build:core`, `ng build core`);

    if (!options.skipInstall) {
      context.addTask(new NodePackageInstallTask({ packageManager: 'yarn' }));
    }

    return host;
  }
}

function addLibToWorkspaceFile(
  projectRoot: string
): Rule {
  return updateWorkspace(workspace => {
    if (workspace.projects.size === 0) {
      workspace.extensions.defaultProject = 'core';
    }

    workspace.projects.add({
      projectType: ProjectType.Library,
      name: 'core',
      root: projectRoot,
      sourceRoot: `${projectRoot}/src`,
      prefix: 'lib',
      targets: {
        build: {
          builder: Builders.NgPackagr,
          options: {
            tsConfig: `${projectRoot}/tsconfig.lib.json`,
            project: `${projectRoot}/ng-package.json`
          },
          configurations: {
            production: {
              tsConfig: `${projectRoot}/tsconfig.lib.prod.json`
            },
          },
        },
        lint: {
          builder: Builders.TsLint,
          options: {
            tsConfig: [
              `${projectRoot}/tsconfig.lib.json`
            ],
            exclude: [
              '**/node_modules/**'
            ],
          },
        },
      },
    });
  });
}

export default function (options: Schema): Rule {
  return async (host: Tree) => {
    verifyBaseTsConfigExists(host);

    const workspace = await getWorkspace(host);
    const newProjectRoot = workspace.extensions.newProjectRoot as (string | undefined) || '';

    const projectName = 'core';
    const folderName = `${projectName}/`;
    const projectRoot = join(normalize(newProjectRoot), folderName);
    const distRoot = `dist/${folderName}`;

    const templateSource = apply(url('./files'), [
      template({
        ...strings,
        ...options,
        relativePathToWorkspaceRoot: relativePathToWorkspaceRoot(projectRoot)
      }),
      move(projectRoot)
    ]);

    return chain([
      mergeWith(templateSource),
      addLibToWorkspaceFile(projectRoot),
      addTsConfigProjectReferences([
        `${projectRoot}/tsconfig.lib.json`
      ]),
      updateTsConfig(projectName, distRoot),
      updatePackageJson(options)
    ])
  }
}
