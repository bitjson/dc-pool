// this script watches the tests exported by typescript, copies them to the test directories, and modifies the require("PKG.NAME") statements to test each build
const cpx = require("cpx");
const separator = require("path").sep;
const Transform = require("stream").Transform;
const pkg = require('../../package');
const req = (path) => 'require("' + path + '")';
const pathUp = (levels) => Array.from(Array(levels), () => '../').join('');

// replace instances of pkg.name with the proper route to the build being tested
const makeTransform = (filePath, buildPath, globDepth) => {
  const buildPathParts = buildPath.split(separator);
  const pathToRoot = pathUp(filePath.split(separator).length - globDepth);
  const placeholder = req(pkg.name);
  return new Transform({
    transform(chunk, encoding, done) {
      const str = chunk.toString();
      const parts = str.split(placeholder)
      const newPath = req(pathToRoot + buildPath)
      const result = parts.join(newPath);
      this.push(result);
      done();
    }
  });
}

// copy, then watch for changes to the tests
const testsFromRoot = 'build/main/**/*.spec.js';
const watchMode = process.argv.indexOf('-w') !== -1 ? true : false;
const task = watchMode ? cpx.watch : cpx.copy;

task(testsFromRoot, 'test', {
  transform: (filePath) => makeTransform(filePath, pkg.main, 2)
});

