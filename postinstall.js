const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const yellow = '\x1b[33m';
const reset = '\x1b[0m';

const projectPackageJsonPath = path.join(process.cwd(), '..', '..', 'package.json');

if (!fs.existsSync(projectPackageJsonPath)) {
  console.error('Error: package.json not found.');
  console.error(`Please run \`${yellow}npm init${reset}\` in your project root before proceeding.`);
  process.exit(1);
}

const projectPackageJson = require(projectPackageJsonPath);

projectPackageJson.dependencies = projectPackageJson.dependencies || {};

projectPackageJson.scripts = {
  ...projectPackageJson.scripts,
  "miz": "cd node_modules/miz-59 && node postinstall.js && cd ../.. && npm update && node node_modules/miz-59/eazymizy.js",
};

projectPackageJson.dependencies = {
  ...projectPackageJson.dependencies,
  "sass": "^1.77.8",
  "ncp": "^2.0.0",
  "fs": "^0.0.1-security",
  "path": "^0.12.7"
};

fs.writeFileSync(projectPackageJsonPath, JSON.stringify(projectPackageJson, null, 2));

const packages = ['ncp', 'fa', 'path'];

const installPackage = (pkg, callback) => {
  exec(`npm install ${pkg}`, (err, stdout, stderr) => {
    if (err) {
      console.error(`Failed to install ${pkg}: ${stderr}`);
      process.exit(1);
    } else {
      console.log(`Installed ${pkg} successfully.`);
      callback();
    }
  });
};

const installPackages = (packages, index = 0) => {
  if (index < packages.length) {
    installPackage(packages[index], () => {
      installPackages(packages, index + 1);
    });
  } else {
    console.log('All packages installed.');
  }
};

installPackages(packages);