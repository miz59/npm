const { exec } = require('child_process');
const { log } = require('console');
const fs = require('fs');
const path = require('path');
const { exitCode } = require('process');
const ncp = require('ncp').ncp;
const util = require('util');

const projectPackageJsonPath = path.join(process.cwd(), 'package.json');
const projectPackageJson = require(projectPackageJsonPath);

const variable = process.argv[2];

if (variable === 'publish:laravel') {
    laravelFramework();
    console.log('Executing publish code for Laravel...');
}

else if (variable === 'publish:react') {
    reactFramework();
    console.log('Executing publish code for React...');
}

else if (variable === 'publish:vue') {
    vueFramework();
    console.log('Executing publish code for Vue...');
}

else {
    console.log('Unknown command');
}

const copy = util.promisify(ncp);
const copyFile = util.promisify(fs.copyFile);

async function vueFramework() {
    const assetsSourceDir = path.join(__dirname, 'assets');
    const sassSourceDir = path.join(__dirname, 'sass');
    const themesSourceDir = path.join(__dirname, 'themes');
    const mizMinFile = path.join(__dirname, 'miz-min.cjs');
    const mizignoreFile = path.join(__dirname, '.mizignore');

    const staticDir = 'src';
    const stylesSourceDir = 'src';
    const framework = 'vue';
    const assetsDestinationDir = path.join(__dirname, '..', '..', `${staticDir}`, 'assets');
    const sassDestinationDir = path.join(__dirname, '..', '..', `${stylesSourceDir}`, 'sass');
    const themesDestinationDir = path.join(__dirname, '..', '..', `${stylesSourceDir}`, 'miz' , 'themes');
    const mizMinDestinationFile = path.join(__dirname, '..', '..', 'miz-min.cjs');
    const mizignoreDestinationFile = path.join(__dirname, '..', '..', '.mizignore');
	const contentMizignoreFile = [`./node_modules`, `./${stylesSourceDir}/miz`, `./${stylesSourceDir}/backup-miz`];

    const backupMizDir = path.join(__dirname, '..', '..', `${stylesSourceDir}`, 'backup-miz');
    const mizDir = path.join(__dirname, '..', '..', `${stylesSourceDir}`, 'miz');
    const themesMizDir = path.join(__dirname, '..', '..', `${stylesSourceDir}`, 'miz' , 'themes');
    const sassMizDir = path.join(__dirname, '..', '..', `${stylesSourceDir}`, 'miz' , 'sass');

    fs.mkdirSync(assetsDestinationDir, { recursive: true });
    fs.mkdirSync(sassDestinationDir, { recursive: true });
    fs.mkdirSync(themesMizDir, { recursive: true });
    fs.mkdirSync(sassMizDir, { recursive: true });
    fs.mkdirSync(path.dirname(mizMinDestinationFile), { recursive: true });

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

    fs.mkdirSync(backupMizDir, { recursive: true });
    console.log('backup-miz folder created successfully!');

    if (fs.existsSync(mizDir)) {
        await new Promise((resolve, reject) => {
            ncp(mizDir, backupMizDir, (err) => {
                if (err) return reject('Error copying miz to backup-miz: ' + err);
                console.log('Files copied from miz to backup-miz folder successfully!');
                resolve();
            });
        });
    }

    if (!fs.existsSync(mizDir)) {
        fs.mkdirSync(mizDir, { recursive: true });
        console.log('miz directory created successfully!');
    }

    if (!fs.existsSync(themesDestinationDir)) {
        fs.mkdirSync(themesDestinationDir, { recursive: true });
        console.log('themes directory created successfully!');
    }

    await new Promise((resolve, reject) => {
        ncp(sassSourceDir, sassMizDir, (err) => {
            if (err) return reject('Error copying sass: ' + err);
            console.log('Sass files copied to miz directory successfully!');
            resolve();
        });
    });
    
    await new Promise((resolve, reject) => {
        ncp(themesSourceDir, themesMizDir, (err) => {
            if (err) return reject('Error copying sass: ' + err);
            console.log('Themes files copied to miz directory successfully!');
            resolve();
        });
    });

    await new Promise((resolve, reject) => {
        fs.copyFile(mizMinFile, mizMinDestinationFile, (err) => {
            if (err) return reject('Error copying miz-min.cjs: ' + err);
            console.log('miz-min.cjs copied to project root successfully!');
            resolve();
        });
    });

    await new Promise((resolve, reject) => {
        fs.copyFile(mizignoreFile, mizignoreDestinationFile, (err) => {
            if (err) return reject('Error copying miz-min.cjs: ' + err);
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

    const filesSass = ['style.scss', '_layout.scss', '_components.scss'];
    for (const file of filesSass) {
        const sourceFile = path.join(__dirname, file);
        const destinationFile = path.join(sassDestinationDir, file);

        await new Promise((resolve, reject) => {
            fs.copyFile(sourceFile, destinationFile, (err) => {
                if (err) return reject(`Error copying ${file}: ` + err);
                console.log(`${file} copied to ${stylesSourceDir}/sass folder successfully!`);
                resolve();
            });
        });
    }

    const pagesSourceDir = path.join(__dirname, 'pages');
    const pagesDestinationDir = path.join(sassDestinationDir, 'pages');
    fs.mkdirSync(pagesDestinationDir, { recursive: true });

    await new Promise((resolve, reject) => {
        ncp(pagesSourceDir, pagesDestinationDir, (err) => {
            if (err) return reject('Error copying pages: ' + err);
            resolve();
        });
    });

    projectPackageJson.scripts = {
        ...projectPackageJson.scripts,
        "watch-sass": "sass --watch --update --style=expanded " + stylesSourceDir + "/sass/style.scss:" + staticDir + "/assets/css/style.css",
        "build-sass": "sass --no-source-map --style=compressed " + stylesSourceDir + "/sass/style.scss:" + staticDir + "/assets/css/style.min.css",
        "watch-miz": "sass --watch --update --style=expanded " + stylesSourceDir + "/miz/_index.scss:" + staticDir + "/assets/css/miz.min.css",
        "build-miz": "sass --no-source-map --style=compressed " + stylesSourceDir + "/miz/_index.scss:" + staticDir + "/assets/css/miz.min.css",
        "build-miz-clean": "sass --no-source-map --style=expanded " + stylesSourceDir + "/miz/_index.scss:" + staticDir + "/assets/css/miz-clean.css && node miz-min.cjs " + framework,
    };

    fs.writeFileSync(projectPackageJsonPath, JSON.stringify(projectPackageJson, null, 2));

    await mizban(assetsDestinationDir);
}

async function reactFramework() {
    const assetsSourceDir = path.join(__dirname, 'assets');
    const sassSourceDir = path.join(__dirname, 'sass');
    const themesSourceDir = path.join(__dirname, 'themes');
    const htmlComponentSourceDir = path.join(__dirname, 'html');
    const mizMinFile = path.join(__dirname, 'miz-min.cjs');
    const mizignoreFile = path.join(__dirname, '.mizignore');

    const staticDir = 'src';
    const stylesSourceDir = 'src';
    const framework = 'react';
    const assetsDestinationDir = path.join(__dirname, '..', '..', `${staticDir}`, 'assets');
    const sassDestinationDir = path.join(__dirname, '..', '..', `${stylesSourceDir}`, 'sass');
    const themesDestinationDir = path.join(__dirname, '..', '..', `${stylesSourceDir}`, 'miz' , 'themes');
    const mizMinDestinationFile = path.join(__dirname, '..', '..', 'miz-min.cjs');
    const mizignoreDestinationFile = path.join(__dirname, '..', '..', '.mizignore');
	const contentMizignoreFile = [`./node_modules`, `./${stylesSourceDir}/miz`, `./${stylesSourceDir}/backup-miz`];

    const backupMizDir = path.join(__dirname, '..', '..', `${stylesSourceDir}`, 'backup-miz');
    const mizDir = path.join(__dirname, '..', '..', `${stylesSourceDir}`, 'miz');

    fs.mkdirSync(assetsDestinationDir, { recursive: true });
    fs.mkdirSync(sassDestinationDir, { recursive: true });
    fs.mkdirSync(path.dirname(mizMinDestinationFile), { recursive: true });

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

    fs.mkdirSync(backupMizDir, { recursive: true });
    console.log('backup-miz folder created successfully!');

    if (fs.existsSync(mizDir)) {
        await new Promise((resolve, reject) => {
            ncp(mizDir, backupMizDir, (err) => {
                if (err) return reject('Error copying miz to backup-miz: ' + err);
                console.log('Files copied from miz to backup-miz folder successfully!');
                resolve();
            });
        });
    }

    if (!fs.existsSync(mizDir)) {
        fs.mkdirSync(mizDir, { recursive: true });
        console.log('miz directory created successfully!');
    }

    if (!fs.existsSync(themesDestinationDir)) {
        fs.mkdirSync(themesDestinationDir, { recursive: true });
        console.log('themes directory created successfully!');
    }

    await new Promise((resolve, reject) => {
        ncp(sassSourceDir, mizDir, (err) => {
            if (err) return reject('Error copying sass: ' + err);
            console.log('Sass files copied to miz directory successfully!');
            resolve();
        });
    });
    
    await new Promise((resolve, reject) => {
        ncp(themesSourceDir, mizDir, (err) => {
            if (err) return reject('Error copying sass: ' + err);
            console.log('Themes files copied to miz directory successfully!');
            resolve();
        });
    });

    await new Promise((resolve, reject) => {
        ncp(htmlComponentSourceDir, mizDir, (err) => {
            if (err) return reject('Error copying HTML: ' + err);
            console.log('HTML components copied to miz directory successfully!');
            resolve();
        });
    });

    await new Promise((resolve, reject) => {
        fs.copyFile(mizMinFile, mizMinDestinationFile, (err) => {
            if (err) return reject('Error copying miz-min.cjs: ' + err);
            console.log('miz-min.cjs copied to project root successfully!');
            resolve();
        });
    });

    await new Promise((resolve, reject) => {
        fs.copyFile(mizignoreFile, mizignoreDestinationFile, (err) => {
            if (err) return reject('Error copying miz-min.cjs: ' + err);
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

    const filesSass = ['style.scss', '_layout.scss', '_components.scss'];
    for (const file of filesSass) {
        const sourceFile = path.join(__dirname, file);
        const destinationFile = path.join(sassDestinationDir, file);

        await new Promise((resolve, reject) => {
            fs.copyFile(sourceFile, destinationFile, (err) => {
                if (err) return reject(`Error copying ${file}: ` + err);
                console.log(`${file} copied to ${stylesSourceDir}/sass folder successfully!`);
                resolve();
            });
        });
    }

    const pagesSourceDir = path.join(__dirname, 'pages');
    const pagesDestinationDir = path.join(sassDestinationDir, 'pages');
    fs.mkdirSync(pagesDestinationDir, { recursive: true });

    await new Promise((resolve, reject) => {
        ncp(pagesSourceDir, pagesDestinationDir, (err) => {
            if (err) return reject('Error copying pages: ' + err);
            resolve();
        });
    });

    projectPackageJson.scripts = {
        ...projectPackageJson.scripts,
        "watch-sass": "sass --watch --update --style=expanded " + stylesSourceDir + "/sass/style.scss:" + staticDir + "/assets/css/style.css",
        "build-sass": "sass --no-source-map --style=compressed " + stylesSourceDir + "/sass/style.scss:" + staticDir + "/assets/css/style.min.css",
        "watch-miz": "sass --watch --update --style=expanded " + stylesSourceDir + "/miz/_index.scss:" + staticDir + "/assets/css/miz.min.css",
        "build-miz": "sass --no-source-map --style=compressed " + stylesSourceDir + "/miz/_index.scss:" + staticDir + "/assets/css/miz.min.css",
        "build-miz-clean": "sass --no-source-map --style=expanded " + stylesSourceDir + "/miz/_index.scss:" + staticDir + "/assets/css/miz-clean.css && node miz-min.cjs " + framework,
    };

    fs.writeFileSync(projectPackageJsonPath, JSON.stringify(projectPackageJson, null, 2));

    await mizban(assetsDestinationDir);
}

async function laravelFramework() {
    const assetsSourceDir = path.join(__dirname, 'assets');
    const sassSourceDir = path.join(__dirname, 'sass');
    const themesSourceDir = path.join(__dirname, 'themes');
    const htmlComponentSourceDir = path.join(__dirname, 'html');
    const mizMinFile = path.join(__dirname, 'miz-min.cjs');
    const mizignoreFile = path.join(__dirname, '.mizignore');

    const staticDir = 'public';
    const stylesSourceDir = 'resources';
    const framework = 'laravel';
    const assetsDestinationDir = path.join(__dirname, '..', '..', `${staticDir}`, 'assets');
    const sassDestinationDir = path.join(__dirname, '..', '..', `${stylesSourceDir}`, 'sass');
    const themesDestinationDir = path.join(__dirname, '..', '..', `${stylesSourceDir}`, 'miz' , 'themes');
    const mizMinDestinationFile = path.join(__dirname, '..', '..', 'miz-min.cjs');
    const mizignoreDestinationFile = path.join(__dirname, '..', '..', '.mizignore');
	const contentMizignoreFile = [`./node_modules`, `./${stylesSourceDir}/miz`, `./${stylesSourceDir}/backup-miz`];

    const backupMizDir = path.join(__dirname, '..', '..', `${stylesSourceDir}`, 'backup-miz');
    const mizDir = path.join(__dirname, '..', '..', `${stylesSourceDir}`, 'miz');

    fs.mkdirSync(assetsDestinationDir, { recursive: true });
    fs.mkdirSync(sassDestinationDir, { recursive: true });
    fs.mkdirSync(path.dirname(mizMinDestinationFile), { recursive: true });

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

    fs.mkdirSync(backupMizDir, { recursive: true });
    console.log('backup-miz folder created successfully!');

    if (fs.existsSync(mizDir)) {
        await new Promise((resolve, reject) => {
            ncp(mizDir, backupMizDir, (err) => {
                if (err) return reject('Error copying miz to backup-miz: ' + err);
                console.log('Files copied from miz to backup-miz folder successfully!');
                resolve();
            });
        });
    }

    if (!fs.existsSync(mizDir)) {
        fs.mkdirSync(mizDir, { recursive: true });
        console.log('miz directory created successfully!');
    }

    if (!fs.existsSync(themesDestinationDir)) {
        fs.mkdirSync(themesDestinationDir, { recursive: true });
        console.log('themes directory created successfully!');
    }

    await new Promise((resolve, reject) => {
        ncp(sassSourceDir, mizDir, (err) => {
            if (err) return reject('Error copying sass: ' + err);
            console.log('Sass files copied to miz directory successfully!');
            resolve();
        });
    });
    
    await new Promise((resolve, reject) => {
        ncp(themesSourceDir, mizDir, (err) => {
            if (err) return reject('Error copying sass: ' + err);
            console.log('Themes files copied to miz directory successfully!');
            resolve();
        });
    });

    await new Promise((resolve, reject) => {
        ncp(htmlComponentSourceDir, mizDir, (err) => {
            if (err) return reject('Error copying HTML: ' + err);
            console.log('HTML components copied to miz directory successfully!');
            resolve();
        });
    });

    await new Promise((resolve, reject) => {
        fs.copyFile(mizMinFile, mizMinDestinationFile, (err) => {
            if (err) return reject('Error copying miz-min.cjs: ' + err);
            console.log('miz-min.cjs copied to project root successfully!');
            resolve();
        });
    });

    await new Promise((resolve, reject) => {
        fs.copyFile(mizignoreFile, mizignoreDestinationFile, (err) => {
            if (err) return reject('Error copying miz-min.cjs: ' + err);
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

    const filesSass = ['style.scss', '_layout.scss', '_components.scss'];
    for (const file of filesSass) {
        const sourceFile = path.join(__dirname, file);
        const destinationFile = path.join(sassDestinationDir, file);

        await new Promise((resolve, reject) => {
            fs.copyFile(sourceFile, destinationFile, (err) => {
                if (err) return reject(`Error copying ${file}: ` + err);
                console.log(`${file} copied to ${stylesSourceDir}/sass folder successfully!`);
                resolve();
            });
        });
    }

    const pagesSourceDir = path.join(__dirname, 'pages');
    const pagesDestinationDir = path.join(sassDestinationDir, 'pages');
    fs.mkdirSync(pagesDestinationDir, { recursive: true });

    await new Promise((resolve, reject) => {
        ncp(pagesSourceDir, pagesDestinationDir, (err) => {
            if (err) return reject('Error copying pages: ' + err);
            resolve();
        });
    });

    projectPackageJson.scripts = {
        ...projectPackageJson.scripts,
        "watch-sass": "sass --watch --update --style=expanded " + stylesSourceDir + "/sass/style.scss:" + staticDir + "/assets/css/style.css",
        "build-sass": "sass --no-source-map --style=compressed " + stylesSourceDir + "/sass/style.scss:" + staticDir + "/assets/css/style.min.css",
        "watch-miz": "sass --watch --update --style=expanded " + stylesSourceDir + "/miz/_index.scss:" + staticDir + "/assets/css/miz.min.css",
        "build-miz": "sass --no-source-map --style=compressed " + stylesSourceDir + "/miz/_index.scss:" + staticDir + "/assets/css/miz.min.css",
        "build-miz-clean": "sass --no-source-map --style=expanded " + stylesSourceDir + "/miz/_index.scss:" + staticDir + "/assets/css/miz-clean.css && node miz-min.cjs " + framework,
    };

    fs.writeFileSync(projectPackageJsonPath, JSON.stringify(projectPackageJson, null, 2));

    await mizban(assetsDestinationDir);
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

function mizban(staticDir) {
    return new Promise((resolve) => {
        console.log('Do you want mizban? (Y/n)');
        process.stdin.once('data', (input) => {
            const answer = input.toString().trim().toLowerCase();

            const mizbanDirPath = path.join(__dirname, '..', '..', 'mizban-installer');

            if (answer === 'y') {
                if (fs.existsSync(mizbanDirPath)) {
                    fs.rmSync(mizbanDirPath, { recursive: true, force: true });
                    console.log(`The folder '${mizbanDirPath}' has been deleted.`);
                }

                exec('git clone https://github.com/miz59/mizban-installer', (error, stdout, stderr) => {
                    if (error) {
                        console.error(`Error cloning repository: ${error.message}`);
                        resolve();
                        return;
                    }

                    console.log('Repository cloned successfully.');
                    console.log(stdout);

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
                    resolve();
                    process.exit();
                });
            } else if (answer === 'n') {
                resolve();
                process.exit();
            } else {
                console.log('Please answer with "Y" or "n".');
                resolve();
                process.exit();
            }
        });
    });
}