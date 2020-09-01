export interface Schema {
  clientRoot: string;
  directory?: string;
  name: string;
  packageManager: string;
  server: string;
  serverRoot: string;
  skipDirectory: boolean;
  skipInstall: boolean;
}
