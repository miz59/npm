const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');



const projectPackageJsonPath = path.join(process.cwd(), '..', '..', 'package.json');


const projectPackageJson = require(projectPackageJsonPath);


projectPackageJson.scripts = {
    ...projectPackageJson.scripts,
    "miz": "node node_modules/miz-59/eazymizy.js",
};

projectPackageJson.dependencies = {
    ...projectPackageJson.dependencies,
    "sass": "1.77.8",
    "ncp": "^2.0.0",
    "fs": "^0.0.1-security",
    "path": "^0.12.7"
};

fs.writeFileSync(projectPackageJsonPath, JSON.stringify(projectPackageJson, null, 2));


const packages = ['ncp', 'fa', 'path'];

const installPackage = (pkg, callback) => {
    exec(`npm install ${pkg}`, (err, stdout, stderr) => {
        if (err) {
            console.error(`Error installing ${pkg}: ${stderr}`);
            process.exit(1);
        } else {
            console.log(`Successfully installed ${pkg}: ${stdout}`);
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
        console.log('All packages installed successfully.');
    }
};

installPackages(packages);