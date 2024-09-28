/**
  A Node application that generates a folder structure for a new react component

  1.1) Searches the src folder for the component name
  1.2) If the folder exists, asks for a different name
  2) Creates a folder with the component name
  2.1) Creates a Component.js file in the folder
  2.2) Creates an index.js file in the folder
  2.3) Creates a reducer.js file in the folder
 */

const fs = require('fs');
const path = require('path');

// 2
function make(name) {
  fs.mkdirSync(path.join('/Users/tannerbrobers/dev/tannerbroberts.github.io/src/Components', `./${name}`));
  writeComponentFile(name);
  writeIndexFile(name);
  writeReducerFile(name);
  writeProviderFile(name);
}

// 2.1
function writeComponentFile(name) {
  const componentFile = path.join('/Users/tannerbrobers/dev/tannerbroberts.github.io/src/Components', `./${name}/Component_${name}.js`);
  const componentContent =
    `import React from 'react';
import ${name}Provider from './Provider_${name}';
import ${name}Reducer, { ${name}InitialState } from './Reducer_${name}';
import { css } from '@emotion/css';

const ${name}Css = css\`
  background-color: yellow;
\`;

export default function ${name}() {
  const [state, dispatch] = React.useReducer(${name}Reducer, ${name}InitialState);

  return (
  <${name}Provider {...{ state, dispatch }}>
    <div className={${name}Css}>
      <h1>${name}</h1>
    </div>
  </${name}Provider>
  );
}
`;
  fs.writeFileSync(componentFile, componentContent);
}

function writeIndexFile(name) {
  const indexFile = path.join('/Users/tannerbrobers/dev/tannerbroberts.github.io/src/Components', `./${name}/index.js`);
  const indexContent =
    `export { default } from './Component_${name}';
export { default as ${name}Provider, use${name}Context } from './Provider_${name}';
export { ${name}ReducerActions } from './Reducer_${name}';;
`;
  fs.writeFileSync(indexFile, indexContent);
}

function writeReducerFile(name) {
  const reducerFile = path.join('/Users/tannerbrobers/dev/tannerbroberts.github.io/src/Components', `./${name}/Reducer_${name}.js`);
  const reducerContent =
    `
export const ${name}InitialState = {

};

const actionsMap = {
  BATCH: (state, action) => {
    return action.value.reduce(${name}Reducer, state);
  }
};

export const ${name}ReducerActions = Object.keys(actionsMap);

export default function ${name}Reducer(state, action) {
  if (!action.type) throw new Error('Action must have a type');
  if (actionsMap[action.type]) {
    return actionsMap[action.type](state, action);
  } else {
    throw new Error(\`Action type not found in ${name}Reducer\`);
  }
}
`;
  fs.writeFileSync(reducerFile, reducerContent);
}

function writeProviderFile(name) {
  const providerFile = path.join('/Users/tannerbrobers/dev/tannerbroberts.github.io/src/Components', `./${name}/Provider_${name}.js`);
  const providerContent =
    `import React, { createContext } from 'react';

const ${name}Context = createContext();
export default function ${name}Provider({ children, state, dispatch, extras }) {
  return (
    <${name}Context.Provider value={{ ${name}State: state, ${name}Dispatch: dispatch, extras }}>
      {children}
    </${name}Context.Provider>
  );
}

export function use${name}Context() {
  const context = React.useContext(${name}Context);
  if (!context) {
    throw new Error('use${name} must be used within a ${name}Provider');
  }
  return context;
}
`;
  fs.writeFileSync(providerFile, providerContent);
}

const name = process.argv[2];
// Validation
if (!name) {
  console.log('Please provide a component name');
  process.exit(1);
}
if (fs.existsSync(path.join('/Users/tannerbrobers/dev/tannerbroberts.github.io/src/Components', `./${name}`))) {
  console.log('Component already exists');
  process.exit(1);
}
const upperCaseName = name.charAt(0).toUpperCase() + name.slice(1);

make(upperCaseName);
