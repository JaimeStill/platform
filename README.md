# Platform Schematics

## Globally install schematics CLI

```bash
yarn global add @angular-devkit/schematics-cli
```

## Create a Schematic

```bash
schematics blank --name={name}
```

## Build Schematic

```bash
cd {name}
yarn install
yarn build
```

## Run a Schematic

```bash
# if located in workspace root
schematics .:{schematics-name} --{required-option}={value}

# example
schematics .:app

# if not located in workspace root
schematics {relative-path-to-collection.json}:{schematics-name}

# example
schematics G:\code\schematics\platform\src\collection.json:app
```

## Add Schematic to a Collection

```bash
cd {schematic-project-root}

schematics blank --name={new-schematic-name}
```
