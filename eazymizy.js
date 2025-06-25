const { exec } = require('child_process');
const { log } = require('console');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { exitCode } = require('process');
const ncp = require('ncp').ncp;
const util = require('util');

const projectPackageJsonPath = path.join(process.cwd(), 'package.json');
const projectPackageJson = require(projectPackageJsonPath);

// const variable = process.argv[2];

// if (variable === 'publish:laravel') {
//     laravelFramework();
//     console.log('Executing publish code for Laravel...');
// }

// else if (variable === 'publish:react') {
//     reactFramework();
//     console.log('Executing publish code for React...');
// }

// else if (variable === 'publish:vue') {
//     vueFramework();
//     console.log('Executing publish code for Vue...');
// }

// else {
//     console.log('Unknown command');
// }

const readline = require('readline');

const options = [
  { name: 'publish:laravel', action: laravelFramework },
  { name: 'publish:vue', action: vueFramework },
  { name: 'publish:react', action: reactFramework },
];

async function main() {
  const arg = process.argv[2];

  if (arg) {
    const option = options.find(o => o.name === arg);
    if (option) {
        option.action();
        console.log(`Executing ${option.name}...`);
    } else {
        console.log(`Unknown option: ${arg}`);
    }
    process.exit();
    } else {
    console.log('Please select an option:');
    options.forEach((opt, i) => {
      console.log(`${i + 1}) ${opt.name}`);
    });

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    rl.question('Enter your choice number: ', (answer) => {
        const choice = parseInt(answer, 10);
        if (choice >= 1 && choice <= options.length) {
            options[choice - 1].action();
            console.log(`Executing ${options[choice - 1].name}...`);
        } else {
            console.log('Invalid choice.');
        }
        rl.close();
        process.exit();
    });
  }
}

main();


async function vueFramework() {
    const assetsSourceDir = path.join(__dirname, 'assets');
    const sassSourceDir = path.join(__dirname, 'sass');
    const mizSourceDir = path.join(__dirname, 'miz');
    const pkgSourceDir = path.join(__dirname, 'pkg');
    const pagesSourceDir = path.join(__dirname, 'pages');
    const mizignoreFile = path.join(__dirname, '.mizignore');
    
    const staticDir = 'src';
    const stylesSourceDir = 'src';
    const framework = 'vue';
    const assetsDestinationDir = path.join(__dirname, '..', '..', `${staticDir}`, 'assets');
    const sassDestinationDir = path.join(__dirname, '..', '..', `${stylesSourceDir}`, 'sass');
    const mizDestinationDir = path.join(__dirname, '..', '..', `${stylesSourceDir}`, 'miz');
    const pkgDestinationDir = path.join(__dirname, '..', '..', `${stylesSourceDir}`, 'miz' ,'pkg');
    const pagesDestinationDir = path.join(sassDestinationDir, 'pages');
    const mizignoreDestinationFile = path.join(__dirname, '..', '..', '.mizignore');
    const contentMizignoreFile = [
        `./node_modules`,
        `./${stylesSourceDir}/miz`,
        `./${stylesSourceDir}/backup-miz`,
    ];
    console.log(`${framework} framework code runs here.`);

    const backupMizDir = path.join(__dirname, '..', '..', `${stylesSourceDir}`, 'backup-miz');

    fs.mkdirSync(assetsDestinationDir, { recursive: true });
    fs.mkdirSync(sassDestinationDir, { recursive: true });
    fs.mkdirSync(pkgDestinationDir, { recursive: true });
    fs.mkdirSync(backupMizDir, { recursive: true });
    fs.mkdirSync(mizDestinationDir, { recursive: true });

    await new Promise((resolve, reject) => {
        ncp(assetsSourceDir, assetsDestinationDir, (err) => {
            if (err) {
                return reject('Error copying assets: ' + err);
            }
            console.log(`Assets copied to ${staticDir}/assets folder successfully!`);
            resolve();
        });
    });

    if (fs.existsSync(backupMizDir)) {
        fs.rmSync(backupMizDir, { recursive: true, force: true });
        console.log('backup-miz folder removed successfully!');
    }

    console.log('backup-miz folder created successfully!');

    if (fs.existsSync(mizDestinationDir)) {
        await new Promise((resolve, reject) => {
            ncp(mizDestinationDir, backupMizDir, (err) => {
                if (err) return reject('Error copying miz to backup-miz: ' + err);
                console.log('Files copied from miz to backup-miz folder successfully!');
                resolve();
            });
        });
    }

    await new Promise((resolve, reject) => {
        ncp(pkgSourceDir, pkgDestinationDir, (err) => {
            if (err) return reject('Error copying pkg directory: ' + err);
            console.log('Pkg directory copied successfully!');
            resolve();
        });
    });

    await new Promise((resolve, reject) => {
        ncp(mizSourceDir, mizDestinationDir, (err) => {
            if (err) return reject('Error copying miz directory: ' + err);
            console.log('Miz directory copied successfully!');
            resolve();
        });
    });

    await new Promise((resolve, reject) => {
        fs.copyFile(mizignoreFile, mizignoreDestinationFile, (err) => {
            if (err) return reject('Error copying .mizignore: ' + err);
            console.log('.mizignore copied to project root successfully!');
            resolve();
        });
    });

    if (Array.isArray(contentMizignoreFile) && contentMizignoreFile.length > 0) {
        const contentToAppend = contentMizignoreFile.join('\n') + '\n';
        await new Promise((resolve, reject) => {
            fs.appendFile(mizignoreDestinationFile, contentToAppend, (err) => {
                if (err) {
                    reject('An error occurred while adding text to the file: ' + err);
                    return;
                }
                console.log('New text has been successfully added to the file!');
                resolve();
            });
        });
    } else {
        throw new TypeError('contentMizignoreFile must be a non-empty array.');
    }

    await new Promise((resolve, reject) => {
        ncp(sassSourceDir, sassDestinationDir, (err) => {
            if (err) return reject('Error copying pkg directory: ' + err);
            console.log('Sass directory copied successfully!');
            resolve();
        });
    });

    projectPackageJson.scripts = {
        ...projectPackageJson.scripts,
        "watch-sass": "sass --watch --update --style=expanded " + stylesSourceDir + "/sass/style.scss:" + staticDir + "/assets/css/style.css",
        "build-sass": "sass --no-source-map --style=compressed " + stylesSourceDir + "/sass/style.scss:" + staticDir + "/assets/css/style.min.css",
        "build-miz": "concurrently \"sass --no-source-map --style=compressed " + stylesSourceDir +"/miz/_index.scss:" + staticDir + "/assets/css/miz.min.css\" \"node " + stylesSourceDir + "/miz/pkg/merge-components.js ^&^& terser" + staticDir + "/assets/js/mizchin.js -o " + staticDir + "/assets/js/mizchin.min.js\"",
        "watch-miz": "concurrently \"sass --watch --update --style=expanded " + stylesSourceDir +"/miz/_index.scss:" + staticDir + "/assets/css/miz.min.css\" \"node " + stylesSourceDir + "/miz/pkg/merge-components.js --watch\"",
        "build-miz-clean": "sass --no-source-map --style=expanded " + stylesSourceDir +"/miz/_index.scss:" + staticDir + "/assets/css/miz-clean.css && node " + stylesSourceDir + "/miz/pkg/miz-min.cjs " + framework
    };

    fs.writeFileSync(projectPackageJsonPath, JSON.stringify(projectPackageJson, null, 2));

    // await mizban(assetsDestinationDir);
}

async function reactFramework() {
    const assetsSourceDir = path.join(__dirname, 'assets');
    const sassSourceDir = path.join(__dirname, 'sass');
    const mizSourceDir = path.join(__dirname, 'miz');
    const pkgSourceDir = path.join(__dirname, 'pkg');
    const pagesSourceDir = path.join(__dirname, 'pages');
    const mizignoreFile = path.join(__dirname, '.mizignore');

    const staticDir = 'src';
    const stylesSourceDir = 'src';
    const framework = 'react';
    const assetsDestinationDir = path.join(__dirname, '..', '..', `${staticDir}`, 'assets');
    const sassDestinationDir = path.join(__dirname, '..', '..', `${stylesSourceDir}`, 'sass');
    const mizDestinationDir = path.join(__dirname, '..', '..', `${stylesSourceDir}`, 'miz');
    const pkgDestinationDir = path.join(__dirname, '..', '..', `${stylesSourceDir}`, 'miz' ,'pkg');
    const pagesDestinationDir = path.join(sassDestinationDir, 'pages');
    const mizignoreDestinationFile = path.join(__dirname, '..', '..', '.mizignore');
    const contentMizignoreFile = [
        `./node_modules`,
        `./${stylesSourceDir}/miz`,
        `./${stylesSourceDir}/backup-miz`,
    ];
    console.log(`${framework} framework code runs here.`);

    const backupMizDir = path.join(__dirname, '..', '..', `${stylesSourceDir}`, 'backup-miz');

    fs.mkdirSync(assetsDestinationDir, { recursive: true });
    fs.mkdirSync(sassDestinationDir, { recursive: true });
    fs.mkdirSync(pkgDestinationDir, { recursive: true });
    fs.mkdirSync(backupMizDir, { recursive: true });
    fs.mkdirSync(mizDestinationDir, { recursive: true });

    await new Promise((resolve, reject) => {
        ncp(assetsSourceDir, assetsDestinationDir, (err) => {
            if (err) {
                return reject('Error copying assets: ' + err);
            }
            console.log(`Assets copied to ${staticDir}/assets folder successfully!`);
            resolve();
        });
    });

    if (fs.existsSync(backupMizDir)) {
        fs.rmSync(backupMizDir, { recursive: true, force: true });
        console.log('backup-miz folder removed successfully!');
    }

    console.log('backup-miz folder created successfully!');

    if (fs.existsSync(mizDestinationDir)) {
        await new Promise((resolve, reject) => {
            ncp(mizDestinationDir, backupMizDir, (err) => {
                if (err) return reject('Error copying miz to backup-miz: ' + err);
                console.log('Files copied from miz to backup-miz folder successfully!');
                resolve();
            });
        });
    }

    await new Promise((resolve, reject) => {
        ncp(pkgSourceDir, pkgDestinationDir, (err) => {
            if (err) return reject('Error copying pkg directory: ' + err);
            console.log('Pkg directory copied successfully!');
            resolve();
        });
    });

    await new Promise((resolve, reject) => {
        ncp(mizSourceDir, mizDestinationDir, (err) => {
            if (err) return reject('Error copying miz directory: ' + err);
            console.log('Miz directory copied successfully!');
            resolve();
        });
    });

    await new Promise((resolve, reject) => {
        fs.copyFile(mizignoreFile, mizignoreDestinationFile, (err) => {
            if (err) return reject('Error copying .mizignore: ' + err);
            console.log('.mizignore copied to project root successfully!');
            resolve();
        });
    });

    if (Array.isArray(contentMizignoreFile) && contentMizignoreFile.length > 0) {
        const contentToAppend = contentMizignoreFile.join('\n') + '\n';
        await new Promise((resolve, reject) => {
            fs.appendFile(mizignoreDestinationFile, contentToAppend, (err) => {
                if (err) {
                    reject('An error occurred while adding text to the file: ' + err);
                    return;
                }
                console.log('New text has been successfully added to the file!');
                resolve();
            });
        });
    } else {
        throw new TypeError('contentMizignoreFile must be a non-empty array.');
    }

    await new Promise((resolve, reject) => {
        ncp(sassSourceDir, sassDestinationDir, (err) => {
            if (err) return reject('Error copying pkg directory: ' + err);
            console.log('Sass directory copied successfully!');
            resolve();
        });
    });

    projectPackageJson.scripts = {
        ...projectPackageJson.scripts,
        "watch-sass": "sass --watch --update --style=expanded " + stylesSourceDir + "/sass/style.scss:" + staticDir + "/assets/css/style.css",
        "build-sass": "sass --no-source-map --style=compressed " + stylesSourceDir + "/sass/style.scss:" + staticDir + "/assets/css/style.min.css",
        "build-miz": "concurrently \"sass --no-source-map --style=compressed " + stylesSourceDir +"/miz/_index.scss:" + staticDir + "/assets/css/miz.min.css\" \"node " + stylesSourceDir + "/miz/pkg/merge-components.js ^&^& terser" + staticDir + "/assets/js/mizchin.js -o " + staticDir + "/assets/js/mizchin.min.js\"",
        "watch-miz": "concurrently \"sass --watch --update --style=expanded " + stylesSourceDir +"/miz/_index.scss:" + staticDir + "/assets/css/miz.min.css\" \"node " + stylesSourceDir + "/miz/pkg/merge-components.js --watch\"",
        "build-miz-clean": "sass --no-source-map --style=expanded " + stylesSourceDir +"/miz/_index.scss:" + staticDir + "/assets/css/miz-clean.css && node " + stylesSourceDir + "/miz/pkg/miz-min.cjs " + framework
    };

    fs.writeFileSync(projectPackageJsonPath, JSON.stringify(projectPackageJson, null, 2));

    // await mizban(assetsDestinationDir);
}

async function laravelFramework() {
    const assetsSourceDir = path.join(__dirname, 'assets');
    const sassSourceDir = path.join(__dirname, 'sass');
    const mizSourceDir = path.join(__dirname, 'miz');
    const pkgSourceDir = path.join(__dirname, 'pkg');
    const pagesSourceDir = path.join(__dirname, 'pages');
    const mizignoreFile = path.join(__dirname, '.mizignore');

    const staticDir = 'public';
    const stylesSourceDir = 'resources';
    const framework = 'laravel';
    const assetsDestinationDir = path.join(__dirname, '..', '..', `${staticDir}`, 'assets');
    const sassDestinationDir = path.join(__dirname, '..', '..', `${stylesSourceDir}`, 'sass');
    const mizDestinationDir = path.join(__dirname, '..', '..', `${stylesSourceDir}`, 'miz');
    const pkgDestinationDir = path.join(__dirname, '..', '..', `${stylesSourceDir}`, 'miz' ,'pkg');
    const pagesDestinationDir = path.join(sassDestinationDir, 'pages');
    const mizignoreDestinationFile = path.join(__dirname, '..', '..', '.mizignore');
    const contentMizignoreFile = [
        `./node_modules`,
        `./${stylesSourceDir}/miz`,
        `./${stylesSourceDir}/backup-miz`,
    ];
    console.log(`${framework} framework code runs here.`);

    const backupMizDir = path.join(__dirname, '..', '..', `${stylesSourceDir}`, 'backup-miz');

    fs.mkdirSync(assetsDestinationDir, { recursive: true });
    fs.mkdirSync(sassDestinationDir, { recursive: true });
    fs.mkdirSync(pkgDestinationDir, { recursive: true });
    fs.mkdirSync(backupMizDir, { recursive: true });
    fs.mkdirSync(mizDestinationDir, { recursive: true });

    await new Promise((resolve, reject) => {
        ncp(assetsSourceDir, assetsDestinationDir, (err) => {
            if (err) {
                return reject('Error copying assets: ' + err);
            }
            console.log(`Assets copied to ${staticDir}/assets folder successfully!`);
            resolve();
        });
    });

    if (fs.existsSync(backupMizDir)) {
        fs.rmSync(backupMizDir, { recursive: true, force: true });
        console.log('backup-miz folder removed successfully!');
    }

    console.log('backup-miz folder created successfully!');

    if (fs.existsSync(mizDestinationDir)) {
        await new Promise((resolve, reject) => {
            ncp(mizDestinationDir, backupMizDir, (err) => {
                if (err) return reject('Error copying miz to backup-miz: ' + err);
                console.log('Files copied from miz to backup-miz folder successfully!');
                resolve();
            });
        });
    }

    await new Promise((resolve, reject) => {
        ncp(pkgSourceDir, pkgDestinationDir, (err) => {
            if (err) return reject('Error copying pkg directory: ' + err);
            console.log('Pkg directory copied successfully!');
            resolve();
        });
    });

    await new Promise((resolve, reject) => {
        ncp(mizSourceDir, mizDestinationDir, (err) => {
            if (err) return reject('Error copying miz directory: ' + err);
            console.log('Miz directory copied successfully!');
            resolve();
        });
    });

    await new Promise((resolve, reject) => {
        fs.copyFile(mizignoreFile, mizignoreDestinationFile, (err) => {
            if (err) return reject('Error copying .mizignore: ' + err);
            console.log('.mizignore copied to project root successfully!');
            resolve();
        });
    });

    if (Array.isArray(contentMizignoreFile) && contentMizignoreFile.length > 0) {
        const contentToAppend = contentMizignoreFile.join('\n') + '\n';
        await new Promise((resolve, reject) => {
            fs.appendFile(mizignoreDestinationFile, contentToAppend, (err) => {
                if (err) {
                    reject('An error occurred while adding text to the file: ' + err);
                    return;
                }
                console.log('New text has been successfully added to the file!');
                resolve();
            });
        });
    } else {
        throw new TypeError('contentMizignoreFile must be a non-empty array.');
    }

    await new Promise((resolve, reject) => {
        ncp(sassSourceDir, sassDestinationDir, (err) => {
            if (err) return reject('Error copying pkg directory: ' + err);
            console.log('Sass directory copied successfully!');
            resolve();
        });
    });

    projectPackageJson.scripts = {
        ...projectPackageJson.scripts,
        "watch-sass": "sass --watch --update --style=expanded " + stylesSourceDir + "/sass/style.scss:" + staticDir + "/assets/css/style.css",
        "build-sass": "sass --no-source-map --style=compressed " + stylesSourceDir + "/sass/style.scss:" + staticDir + "/assets/css/style.min.css",
        "build-miz": "concurrently \"sass --no-source-map --style=compressed " + stylesSourceDir +"/miz/_index.scss:" + staticDir + "/assets/css/miz.min.css\" \"node " + stylesSourceDir + "/miz/pkg/merge-components.js ^&^& terser" + staticDir + "/assets/js/mizchin.js -o " + staticDir + "/assets/js/mizchin.min.js\"",
        "watch-miz": "concurrently \"sass --watch --update --style=expanded " + stylesSourceDir +"/miz/_index.scss:" + staticDir + "/assets/css/miz.min.css\" \"node " + stylesSourceDir + "/miz/pkg/merge-components.js --watch\"",
        "build-miz-clean": "sass --no-source-map --style=expanded " + stylesSourceDir +"/miz/_index.scss:" + staticDir + "/assets/css/miz-clean.css && node " + stylesSourceDir + "/miz/pkg/miz-min.cjs " + framework
    };

    fs.writeFileSync(projectPackageJsonPath, JSON.stringify(projectPackageJson, null, 2));

    // await mizban(assetsDestinationDir);
}

function copyDirectory(src, dest) {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }
    
    const entries = fs.readdirSync(src, { withFileTypes: true });
    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        
        if (entry.isDirectory()) {
            copyDirectory(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

async function mizban(staticDir) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    function question(query) {
        return new Promise(resolve => rl.question(query, resolve));
    }

    while (true) {
        const answer = (await question('Do you want mizban? (Y/n) ')).trim().toLowerCase();

        if (answer === 'y' || answer === '') {
            const mizbanDirPath = path.join(__dirname, '..', '..', 'mizban-installer');

            if (fs.existsSync(mizbanDirPath)) {
                fs.rmSync(mizbanDirPath, { recursive: true, force: true });
                console.log(`The folder '${mizbanDirPath}' has been deleted.`);
            }

            try {
                await new Promise((resolve, reject) => {
                    exec('git clone https://github.com/miz59/mizban-installer', (error, stdout, stderr) => {
                        if (error) {
                            reject(error);
                            return;
                        }
                        console.log('Repository cloned successfully.');
                        console.log(stdout);
                        resolve();
                    });
                });

                const sourceCss = path.join(mizbanDirPath, 'assets', 'css');
                const sourceJs = path.join(mizbanDirPath, 'assets', 'js');
                const sourceVendors = path.join(mizbanDirPath, 'assets', 'vendors');
                const cssFolder = path.join(staticDir, 'css');
                const jsFolder = path.join(staticDir, 'js');
                const vendorsFolder = path.join(staticDir, 'vendors');

                copyDirectory(sourceCss, cssFolder);
                copyDirectory(sourceJs, jsFolder);
                copyDirectory(sourceVendors, vendorsFolder);

                console.log("Files moved successfully.");

                fs.rmSync(mizbanDirPath, { recursive: true, force: true });
                console.log(`The folder '${mizbanDirPath}' has been deleted.`);
            } catch (err) {
                console.error(`Error: ${err.message}`);
            }

            rl.close();
            break;
        } else if (answer === 'n') {
            rl.close();
            break;
        } else {
            console.log('Please answer with "Y" or "n".');
        }
    }
}