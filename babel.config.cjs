// Jest transforms everything to CommonJS, which has no `import.meta`. Vite's own build
// never touches this file (it uses esbuild via @vitejs/plugin-react), so it's safe to
// rewrite `import.meta` here to a plain global that src/tests/setup.ts defines.
function importMetaToGlobal({ types: t }) {
  return {
    visitor: {
      MetaProperty(path) {
        if (path.node.meta.name === 'import' && path.node.property.name === 'meta') {
          path.replaceWith(t.identifier('__IMPORT_META__'));
        }
      },
    },
  };
}

module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    ['@babel/preset-react', { runtime: 'automatic' }],
    '@babel/preset-typescript',
  ],
  plugins: [importMetaToGlobal],
};
