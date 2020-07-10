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

import { strings } from '@angular-devkit/core';

import { Schema } from './schema';

function updatePackageJson(options: Schema) {
  return (host: Tree, context: SchematicContext) => {
    if (!options.skipInstall) {
      context.addTask(new NodePackageInstallTask({ packageManager: options.packageManager }));
    }
    return host;
  }
}

export default function (options: Schema): Rule {
  const templateSource = apply(url('./files'), [
    template({
      ...strings,
      ...options
    }),
    move(options.name)
  ]);

  return chain([
    mergeWith(templateSource),
    updatePackageJson(options)
  ]);
}

