const webpack = require('webpack');
const loadOption = require("webpack-cli/bin/convert-argv");
const chokidar = require('chokidar');
const fs = require('fs');
const path = require('path');

let argv = require('yargs').argv

console.log("Loading options...")
let webpackOptions = loadOption(argv);
let weboutOptions = require(path.join(process.cwd(), 'webout.config.js'));

// insert save loader. 
function regexEqual(x, y) {
  return (x instanceof RegExp) && (y instanceof RegExp) && 
         (x.source === y.source) && (x.global === y.global) && 
         (x.ignoreCase === y.ignoreCase) && (x.multiline === y.multiline);
}

let rules = webpackOptions.module.rules;
rules = rules
.filter(rule => {
  for(let i = 0; i < weboutOptions.length; i++) {
    if(regexEqual(weboutOptions[i].test, rule.test)) {
      return true;
    }
  }
  return false;
})
.map(rule => {
  let loader = {
    loader: path.join(__dirname, 'save-loader.js'),
    options: weboutOptions.find(option => {
      return regexEqual(option.test, rule.test);
    })
  }

  if (Array.isArray(rule.use)) {
    rule.use.unshift(loader)
  } else {
    let use;
    use = [loader, rule.use]
    rule.use = use
  }
  return rule;
})

webpackOptions.module.rules = rules;

function compilerCallback(err, stats) {
  if (err) {
    lastHash = null;
    console.error(err.stack || err);
    if (err.details) console.error(err.details);
    process.exit(1); // eslint-disable-line
  }
}

function compile(filePath) {
  webpackOptions.entry = path.join(process.cwd(), filePath);
  let compiler = webpack(webpackOptions);
  compiler.run(compilerCallback);
}

console.log("Watching files...")
chokidar.watch('.', {ignored: /((^|[\/\\])\..)|node_modules|build\//})
.on('add', compile)
.on('change', compile)
.on('unlink', filePath => {
  console.log(`removed file: `)
  //fs.unlinkSync(path.join(process.cwd(), filePath));
})
