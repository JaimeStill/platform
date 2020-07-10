import {
  JsonParseMode,
  parseJsonAst
} from '@angular-devkit/core';

import {
  Rule,
  SchematicsException,
  Tree
} from '@angular-devkit/schematics';

import {
  appendValueInAstArray,
  findPropertyInAstObject
} from './json-utils';

const SOLUTION_TSCONFIG_PATH = 'tsconfig.json';

export function addTsConfigProjectReferences(paths: string[]): Rule {
  return (host, context) => {
    const logger = context.logger;

    for (const path of paths) {
      const source = host.read(SOLUTION_TSCONFIG_PATH);

      if (!source) {
        logger.warn(`Cannot add reference '${path}' in '${SOLUTION_TSCONFIG_PATH}'. File doesn't exist.`);
        return;
      }

      const jsonAst = parseJsonAst(source.toString(), JsonParseMode.Loose);

      if (jsonAst?.kind !== 'object') {
        throw new SchematicsException(`Invalid JSON AST Object '${SOLUTION_TSCONFIG_PATH}'.`);
      }

      const filesAst = findPropertyInAstObject(jsonAst, 'files');
      const referencesAst = findPropertyInAstObject(jsonAst, 'references');

      if (
        filesAst?.kind !== 'array' ||
        filesAst.elements.length !== 0 ||
        referencesAst?.kind !== 'array'
      ) {
        logger.warn(`Cannot add reference '${path}' in '${SOLUTION_TSCONFIG_PATH}'. It appears to be an invalid solution style tsconfig.`);
        return;
      }

      const recorder = host.beginUpdate(SOLUTION_TSCONFIG_PATH);
      appendValueInAstArray(recorder, referencesAst, { 'path': `./${path}` }, 4);
      host.commitUpdate(recorder);
    }
  };
}

export function verifyBaseTsConfigExists(host: Tree): void {
  if (host.exists('tsconfig.base.json')) {
    return;
  }
  throw new SchematicsException(`Cannot find base TypeScript configuration file 'tsconfig.base.json'.`);
}
