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
  SchematicsException,
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
import { validateProjectName } from '../utility/validation';

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
    addPackageJsonScript(host, `build:${options.name}`, `ng build ${options.name}`);

    if (!options.skipInstall) {
      context.addTask(new NodePackageInstallTask({ packageManager: 'yarn' }));
    }

    return host;
  }
}

function addLibToWorkspaceFile(
  projectRoot: string,
  projectName: string
): Rule {
  return updateWorkspace(workspace => {
    if (workspace.projects.size === 0) {
      workspace.extensions.defaultProject = projectName;
    }

    workspace.projects.add({
      projectType: ProjectType.Library,
      name: projectName,
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
    if (!options.name) {
      throw new SchematicsException(`Invalid options, "name" is required.`);
    }

    validateProjectName(options.name);
    verifyBaseTsConfigExists(host);

    const projectName = options.name;
    const packageName = strings.dasherize(projectName);
    let scopeName = null;

    if (/^@.*\/.*/.test(options.name)) {
      const [scope, name] = options.name.split('/');
      scopeName = scope.replace(/^@/, '');
      options.name = name;
    }

    const workspace = await getWorkspace(host);
    const newProjectRoot = workspace.extensions.newProjectRoot as (string | undefined) || '';

    const scopeFolder = scopeName ? strings.dasherize(scopeName) + '/' : '';
    const folderName = `${scopeFolder}${strings.dasherize(options.name)}`;
    const projectRoot = join(normalize(newProjectRoot), folderName);
    const distRoot = `dist/${folderName}`;

    const templateSource = apply(url('./files'), [
      template({
        ...strings,
        ...options,
        packageName,
        projectRoot,
        distRoot,
        relativePathToWorkspaceRoot: relativePathToWorkspaceRoot(projectRoot),
        folderName
      }),
      move(projectRoot)
    ]);

    return chain([
      mergeWith(templateSource),
      addLibToWorkspaceFile(projectRoot, projectName),
      addTsConfigProjectReferences([
        `${projectRoot}/tsconfig.lib.json`
      ]),
      updateTsConfig(packageName, distRoot),
      updatePackageJson(options)
    ])
  }
}
