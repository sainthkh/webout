const util = require('loader-utils');

const fs = require('fs-extra');
const path = require('path');

let upper = str => str.charAt(0).toUpperCase() + str.substr(1);

exports.default = function loader(source) { 
  if (!query.noOutput) {
    let query = util.getOptions(this);

    let p = path.parse(this.resourcePath);
    let name = p.name;
    let ext = p.ext;
    let destName = query.name.replace("[name]", name);
    if (query.className) {
      destName = upper(destName)
    }
    let destDir = path.join(
      process.cwd(), 
      'src/.webout', 
      query.dir ? query.dir : ext
    );

    fs.ensureDirSync(destDir);
    fs.writeFileSync(path.join(destDir, destName), source);
    console.log(`created file: ${destName}`);
  } else {
    console.log(`processed ${this.resourcePath}`);
  }
  return source;
}