import {
  DirEntry,
  Rule,
  SchematicContext,
  SchematicsException,
  Tree
} from '@angular-devkit/schematics';

import { TslintFixTask } from '@angular-devkit/schematics/tasks';

export function applyLintFix(path = '/'): Rule {
  return (tree: Tree, context: SchematicContext) => {
    let dir: DirEntry | null = tree.getDir(path.substr(0, path.lastIndexOf('/')));

    do {
      if ((dir.subfiles as string[]).some(f => f === 'tslint.json' || f === 'tslint.yaml')) {
        break;
      }

      dir = dir.parent;
    } while (dir !== null);

    if (dir === null) {
      throw new SchematicsException(
        'Asked to run lint fixes, but could not find a tslint config file.'
      );
    }

    const files = tree.actions.reduce((acc: Set<string>, action) => {
      const path = action.path.substr(1);
      if (path.endsWith('.ts') && dir && action.path.startsWith(dir.path)) {
        acc.add(path);
      }

      return acc;
    }, new Set<string>());

    context.addTask(new TslintFixTask({
      ignoreErrors: true,
      tsConfigPath: 'tsconfig.json',
      files: [...files]
    }));
  };
}
