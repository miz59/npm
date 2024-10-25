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


































function reactFramework() {
    const assetsSourceDir = path.join(__dirname, 'assets');
    const sassSourceDir = path.join(__dirname, 'sass');
    const htmlComponentSourceDir = path.join(__dirname, 'html');
    const mizMinFile = path.join(__dirname, 'miz-min.cjs');

    const assetsFolder = 'src';
    const sassFolder = 'src';
    const framework = 'react';
    const assetsDestinationDir = path.join(__dirname, '..', '..', `${assetsFolder}`, 'assets');
    const sassDestinationDir = path.join(__dirname, '..', '..', `${sassFolder}`, 'sass');
    const mizMinDestinationFile = path.join(__dirname, '..', '..', 'miz-min.cjs');
    
    const backupMizDir = path.join(sassDestinationDir , 'backup-miz');
    const mizDir = path.join(sassDestinationDir , 'miz');

    fs.mkdirSync(assetsDestinationDir, { recursive: true });
    fs.mkdirSync(path.dirname(mizMinDestinationFile), { recursive: true });

    

    ncp(assetsSourceDir, assetsDestinationDir, function (err) {
        if (err) {
            return console.error('Error copying assets:', err);
        }
        console.log(`Assets copied to ${assetsFolder}/assets folder successfully!`);
    });

    if (!fs.existsSync(mizDir)) {
        fs.mkdirSync(mizDir, { recursive: true });
    }
    
    ncp(sassSourceDir, mizDir, function (err) {
        if (err) {
            return console.error('Error copying sass:', err);
        }
        console.log(`Sass copied to ${sassFolder}/sass/miz folder successfully!`);
    });

    ncp(htmlComponentSourceDir, mizDir, function (err) {
        if (err) {
            return console.error('Error copying html:', err);
        }
        console.log(`Html copied to ${sassFolder}/html/miz folder successfully!`);
    });

    fs.copyFile(mizMinFile, mizMinDestinationFile, (err) => {
        if (err) {
            return console.error('Error copying miz-min.cjs:', err);
        }
        console.log('miz-min.cjs copied to project root successfully!');
    });

    const filesToCopy = ['style.scss', '_layout.scss', '_components.scss'];
    const sassDestinationRootDir = path.join(__dirname, '..', '..', `${sassFolder}`, 'sass');

    filesToCopy.forEach(file => {
        const sourceFile = path.join(__dirname, file);
        const destinationFile = path.join(sassDestinationRootDir, file);

        fs.copyFile(sourceFile, destinationFile, (err) => {
            if (err) {
                return console.error(`Error copying ${file}:`, err);
            }
            console.log(`${file} copied to ${sassFolder}/sass folder successfully!`);
        });
    });

    const pagesSourceDir = path.join(__dirname, 'pages');
    const pagesDestinationDir = path.join(sassDestinationRootDir, 'pages');
    fs.mkdirSync(pagesDestinationDir, { recursive: true });

    ncp(pagesSourceDir, pagesDestinationDir, function (err) {
        if (err) {
            return console.error('Error copying pages:', err);
        }
    });

    projectPackageJson.scripts = {
        ...projectPackageJson.scripts,
        "watch": "sass --watch --update --style=expanded " + sassFolder + "/sass/style.scss:" + assetsFolder + "/assets/css/style.css",
        "build": "sass --no-source-map --style=compressed " + sassFolder + "/sass/style.scss:" + assetsFolder + "/assets/css/style.min.css",
        "watch-miz": "sass --watch --update --style=expanded " + sassFolder + "/sass/miz/_index.scss:" + assetsFolder + "/assets/css/miz.min.css",
        "build-miz": "sass --no-source-map --style=compressed " + sassFolder + "/sass/miz/_index.scss:" + assetsFolder + "/assets/css/miz.min.css",
        "build-miz-clean": "sass --no-source-map --style=expanded " + sassFolder + "/sass/miz/_index.scss:" + assetsFolder + "/assets/css/miz-clean.css && node miz-min.cjs " + framework,
    };

    fs.writeFileSync(projectPackageJsonPath, JSON.stringify(projectPackageJson, null, 2));

    if (fs.existsSync(mizDir)) {
        if(fs.existsSync(backupMizDir)){
            
            fs.rm(backupMizDir ,{recursive:true , force:true}, (err)=>{
                console.log(err)
            });
        }
        fs.mkdirSync(backupMizDir, { recursive: true });        
       
        moveFiles(mizDir, backupMizDir);
            
    }else{
        
    }
}

function vueFramework() {
    const assetsSourceDir = path.join(__dirname, 'assets');
    const sassSourceDir = path.join(__dirname, 'sass');
    const htmlComponentSourceDir = path.join(__dirname, 'html');
    const mizMinFile = path.join(__dirname, 'miz-min.cjs');

    const assetsFolder = 'src';
    const sassFolder = 'src';
    const framework = 'vue';
    const assetsDestinationDir = path.join(__dirname, '..', '..', `${assetsFolder}`, 'assets');
    const sassDestinationDir = path.join(__dirname, '..', '..', `${sassFolder}`, 'sass');
    const htmlComponentDestinationDir = path.join(__dirname, '..', '..', `${sassFolder}`, 'html');
    const mizMinDestinationFile = path.join(__dirname, '..', '..', 'miz-min.cjs');
    
    const backupMizDir = path.join(sassDestinationDir , 'backup-miz');
    const mizDir = path.join(sassDestinationDir , 'miz');

    fs.mkdirSync(assetsDestinationDir, { recursive: true });
    fs.mkdirSync(path.dirname(mizMinDestinationFile), { recursive: true });

    

    ncp(assetsSourceDir, assetsDestinationDir, function (err) {
        if (err) {
            return console.error('Error copying assets:', err);
        }
        console.log(`Assets copied to ${assetsFolder}/assets folder successfully!`);
    });

    if (!fs.existsSync(mizDir)) {
        fs.mkdirSync(mizDir, { recursive: true });
    }
    
    ncp(sassSourceDir, mizDir, function (err) {
        if (err) {
            return console.error('Error copying sass:', err);
        }
        console.log(`Sass copied to ${sassFolder}/sass/miz folder successfully!`);
    });

    ncp(htmlComponentSourceDir, mizDir, function (err) {
        if (err) {
            return console.error('Error copying html:', err);
        }
        console.log(`Html copied to ${sassFolder}/html/miz folder successfully!`);
    });

    fs.copyFile(mizMinFile, mizMinDestinationFile, (err) => {
        if (err) {
            return console.error('Error copying miz-min.cjs:', err);
        }
        console.log('miz-min.cjs copied to project root successfully!');
    });

    const filesToCopy = ['style.scss', '_layout.scss', '_components.scss'];
    const sassDestinationRootDir = path.join(__dirname, '..', '..', `${sassFolder}`, 'sass');

    filesToCopy.forEach(file => {
        const sourceFile = path.join(__dirname, file);
        const destinationFile = path.join(sassDestinationRootDir, file);

        fs.copyFile(sourceFile, destinationFile, (err) => {
            if (err) {
                return console.error(`Error copying ${file}:`, err);
            }
            console.log(`${file} copied to ${sassFolder}/sass folder successfully!`);
        });
    });

    const pagesSourceDir = path.join(__dirname, 'pages');
    const pagesDestinationDir = path.join(sassDestinationRootDir, 'pages');
    fs.mkdirSync(pagesDestinationDir, { recursive: true });

    ncp(pagesSourceDir, pagesDestinationDir, function (err) {
        if (err) {
            return console.error('Error copying pages:', err);
        }
    });

    projectPackageJson.scripts = {
        ...projectPackageJson.scripts,
        "watch": "sass --watch --update --style=expanded " + sassFolder + "/sass/style.scss:" + assetsFolder + "/assets/css/style.css",
        "build": "sass --no-source-map --style=compressed " + sassFolder + "/sass/style.scss:" + assetsFolder + "/assets/css/style.min.css",
        "watch-miz": "sass --watch --update --style=expanded " + sassFolder + "/sass/miz/_index.scss:" + assetsFolder + "/assets/css/miz.min.css",
        "build-miz": "sass --no-source-map --style=compressed " + sassFolder + "/sass/miz/_index.scss:" + assetsFolder + "/assets/css/miz.min.css",
        "build-miz-clean": "sass --no-source-map --style=expanded " + sassFolder + "/sass/miz/_index.scss:" + assetsFolder + "/assets/css/miz-clean.css && node miz-min.cjs " + framework,
    };

    fs.writeFileSync(projectPackageJsonPath, JSON.stringify(projectPackageJson, null, 2));

    if (fs.existsSync(mizDir)) {
        if(fs.existsSync(backupMizDir)){
            
            fs.rm(backupMizDir ,{recursive:true , force:true}, (err)=>{
                console.log(err)
            });
        }
        fs.mkdirSync(backupMizDir, { recursive: true });        
       
        moveFiles(mizDir, backupMizDir);
            
    }else{
        
    }


}

































async function reactFramework() {
    const assetsSourceDir = path.join(__dirname, 'assets');
    const sassSourceDir = path.join(__dirname, 'sass');
    const htmlComponentSourceDir = path.join(__dirname, 'html');
    const mizMinFile = path.join(__dirname, 'miz-min.cjs');

    const assetsFolder = 'src';
    const sassFolder = 'src';
    const framework = 'react';
    const assetsDestinationDir = path.join(__dirname, '..', '..', `${assetsFolder}`, 'assets');
    const sassDestinationDir = path.join(__dirname, '..', '..', `${sassFolder}`, 'sass');
    const mizMinDestinationFile = path.join(__dirname, '..', '..', 'miz-min.cjs');
    
    const backupMizDir = path.join(sassDestinationDir, 'backup-miz');
    const mizDir = path.join(sassDestinationDir, 'miz');

    fs.mkdirSync(assetsDestinationDir, { recursive: true });
    fs.mkdirSync(path.dirname(mizMinDestinationFile), { recursive: true });

    await new Promise((resolve, reject) => {
        ncp(assetsSourceDir, assetsDestinationDir, (err) => {
            if (err) {
                return reject('Error copying assets: ' + err);
            }
            console.log(`Assets copied to ${assetsFolder}/assets folder successfully!`);
            resolve();
        });
    });

    if (!fs.existsSync(mizDir)) {
        fs.mkdirSync(mizDir, { recursive: true });
    }

    await new Promise((resolve, reject) => {
        ncp(sassSourceDir, mizDir, (err) => {
            if (err) {
                return reject('Error copying sass: ' + err);
            }
            console.log(`Sass copied to ${sassFolder}/sass/miz folder successfully!`);
            resolve();
        });
    });

    await new Promise((resolve, reject) => {
        ncp(htmlComponentSourceDir, mizDir, (err) => {
            if (err) {
                return reject('Error copying html: ' + err);
            }
            console.log(`Html copied to ${sassFolder}/html/miz folder successfully!`);
            resolve();
        });
    });

    await new Promise((resolve, reject) => {
        fs.copyFile(mizMinFile, mizMinDestinationFile, (err) => {
            if (err) {
                return reject('Error copying miz-min.cjs: ' + err);
            }
            console.log('miz-min.cjs copied to project root successfully!');
            resolve();
        });
    });

    const filesToCopy = ['style.scss', '_layout.scss', '_components.scss'];
    const sassDestinationRootDir = path.join(__dirname, '..', '..', `${sassFolder}`, 'sass');

    for (const file of filesToCopy) {
        const sourceFile = path.join(__dirname, file);
        const destinationFile = path.join(sassDestinationRootDir, file);

        await new Promise((resolve, reject) => {
            fs.copyFile(sourceFile, destinationFile, (err) => {
                if (err) {
                    return reject(`Error copying ${file}: ` + err);
                }
                console.log(`${file} copied to ${sassFolder}/sass folder successfully!`);
                resolve();
            });
        });
    }

    const pagesSourceDir = path.join(__dirname, 'pages');
    const pagesDestinationDir = path.join(sassDestinationRootDir, 'pages');
    fs.mkdirSync(pagesDestinationDir, { recursive: true });

    await new Promise((resolve, reject) => {
        ncp(pagesSourceDir, pagesDestinationDir, (err) => {
            if (err) {
                return reject('Error copying pages: ' + err);
            }
            resolve();
        });
    });

    projectPackageJson.scripts = {
        ...projectPackageJson.scripts,
        "watch": "sass --watch --update --style=expanded " + sassFolder + "/sass/style.scss:" + assetsFolder + "/assets/css/style.css",
        "build": "sass --no-source-map --style=compressed " + sassFolder + "/sass/style.scss:" + assetsFolder + "/assets/css/style.min.css",
        "watch-miz": "sass --watch --update --style=expanded " + sassFolder + "/sass/miz/_index.scss:" + assetsFolder + "/assets/css/miz.min.css",
        "build-miz": "sass --no-source-map --style=compressed " + sassFolder + "/sass/miz/_index.scss:" + assetsFolder + "/assets/css/miz.min.css",
        "build-miz-clean": "sass --no-source-map --style=expanded " + sassFolder + "/sass/miz/_index.scss:" + assetsFolder + "/assets/css/miz-clean.css && node miz-min.cjs " + framework,
    };

    fs.writeFileSync(projectPackageJsonPath, JSON.stringify(projectPackageJson, null, 2));

    if (fs.existsSync(mizDir)) {
        if (fs.existsSync(backupMizDir)) {
            fs.rm(backupMizDir, { recursive: true, force: true }, (err) => {
                console.log(err);
            });
        }
        fs.mkdirSync(backupMizDir, { recursive: true });
        await moveFiles(mizDir, backupMizDir);
    }

    await mizban(assetsDestinationDir);
}



async function laravelFramework() {
    const assetsSourceDir = path.join(__dirname, 'assets');
    const sassSourceDir = path.join(__dirname, 'sass');
    const htmlComponentSourceDir = path.join(__dirname, 'html');
    const mizMinFile = path.join(__dirname, 'miz-min.cjs');

    const assetsFolder = 'src';
    const sassFolder = 'src';
    const framework = 'laravel';
    const assetsDestinationDir = path.join(__dirname, '..', '..', `${assetsFolder}`, 'assets');
    const sassDestinationDir = path.join(__dirname, '..', '..', `${sassFolder}`, 'sass');
    const mizMinDestinationFile = path.join(__dirname, '..', '..', 'miz-min.cjs');
    
    const backupMizDir = path.join(sassDestinationDir, 'backup-miz');
    const mizDir = path.join(sassDestinationDir, 'miz');

    fs.mkdirSync(assetsDestinationDir, { recursive: true });
    fs.mkdirSync(path.dirname(mizMinDestinationFile), { recursive: true });

    await new Promise((resolve, reject) => {
        ncp(assetsSourceDir, assetsDestinationDir, (err) => {
            if (err) {
                return reject('Error copying assets: ' + err);
            }
            console.log(`Assets copied to ${assetsFolder}/assets folder successfully!`);
            resolve();
        });
    });

    if (!fs.existsSync(mizDir)) {
        fs.mkdirSync(mizDir, { recursive: true });
    }

    await new Promise((resolve, reject) => {
        ncp(sassSourceDir, mizDir, (err) => {
            if (err) {
                return reject('Error copying sass: ' + err);
            }
            console.log(`Sass copied to ${sassFolder}/sass/miz folder successfully!`);
            resolve();
        });
    });

    await new Promise((resolve, reject) => {
        ncp(htmlComponentSourceDir, mizDir, (err) => {
            if (err) {
                return reject('Error copying html: ' + err);
            }
            console.log(`Html copied to ${sassFolder}/html/miz folder successfully!`);
            resolve();
        });
    });

    await new Promise((resolve, reject) => {
        fs.copyFile(mizMinFile, mizMinDestinationFile, (err) => {
            if (err) {
                return reject('Error copying miz-min.cjs: ' + err);
            }
            console.log('miz-min.cjs copied to project root successfully!');
            resolve();
        });
    });

    const filesToCopy = ['style.scss', '_layout.scss', '_components.scss'];
    const sassDestinationRootDir = path.join(__dirname, '..', '..', `${sassFolder}`, 'sass');

    for (const file of filesToCopy) {
        const sourceFile = path.join(__dirname, file);
        const destinationFile = path.join(sassDestinationRootDir, file);

        await new Promise((resolve, reject) => {
            fs.copyFile(sourceFile, destinationFile, (err) => {
                if (err) {
                    return reject(`Error copying ${file}: ` + err);
                }
                console.log(`${file} copied to ${sassFolder}/sass folder successfully!`);
                resolve();
            });
        });
    }

    const pagesSourceDir = path.join(__dirname, 'pages');
    const pagesDestinationDir = path.join(sassDestinationRootDir, 'pages');
    fs.mkdirSync(pagesDestinationDir, { recursive: true });

    await new Promise((resolve, reject) => {
        ncp(pagesSourceDir, pagesDestinationDir, (err) => {
            if (err) {
                return reject('Error copying pages: ' + err);
            }
            resolve();
        });
    });

    projectPackageJson.scripts = {
        ...projectPackageJson.scripts,
        "watch": "sass --watch --update --style=expanded " + sassFolder + "/sass/style.scss:" + assetsFolder + "/assets/css/style.css",
        "build": "sass --no-source-map --style=compressed " + sassFolder + "/sass/style.scss:" + assetsFolder + "/assets/css/style.min.css",
        "watch-miz": "sass --watch --update --style=expanded " + sassFolder + "/sass/miz/_index.scss:" + assetsFolder + "/assets/css/miz.min.css",
        "build-miz": "sass --no-source-map --style=compressed " + sassFolder + "/sass/miz/_index.scss:" + assetsFolder + "/assets/css/miz.min.css",
        "build-miz-clean": "sass --no-source-map --style=expanded " + sassFolder + "/sass/miz/_index.scss:" + assetsFolder + "/assets/css/miz-clean.css && node miz-min.cjs " + framework,
    };

    fs.writeFileSync(projectPackageJsonPath, JSON.stringify(projectPackageJson, null, 2));

    if (fs.existsSync(mizDir)) {
        if (fs.existsSync(backupMizDir)) {
            fs.rm(backupMizDir, { recursive: true, force: true }, (err) => {
                console.log(err);
            });
        }
        fs.mkdirSync(backupMizDir, { recursive: true });
        await moveFiles(mizDir, backupMizDir);
    }

    await mizban(assetsDestinationDir);
}

function moveFiles(srcDir, destDir) {
    if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
    }

    return new Promise((resolve, reject) => {
        fs.readdir(srcDir, (err, files) => {
            if (err) {
                console.error('Error reading source directory:', err);
                return reject(err);
            }

            let movePromises = files.map(file => {
                return new Promise((resolve, reject) => {
                    const srcPath = path.join(srcDir, file);
                    const destPath = path.join(destDir, file);

                    fs.stat(srcPath, (err, stats) => {
                        if (err) {
                            console.error('Error getting file stats:', err);
                            return reject(err);
                        }

                    
                        if (stats.isDirectory()) {
                        
                            moveFiles(srcPath, destPath);
                        
                            fs.rm(srcPath, { recursive: true, force: true }, err => {
                                if (err) {
                                    console.error('Error deleting directory:', err);
                                    reject(err);
                                } else {
                                    console.log(`Moved directory ${file} to ${destDir}`);
                                    resolve();
                                }
                            });
                        } else {
                            fs.rename(srcPath, destPath, err => {
                                if (err) {
                                    console.error('Error moving file:', err);
                                    reject(err);
                                } else {
                                    console.log(`Moved file ${file} to ${destDir}`);
                                    resolve();
                                }
                            });
                        }
                    });
                });
            });

            Promise.all(movePromises)
                .then(() => {
                    console.log('All files and directories moved successfully.');
                    resolve();
                })
                .catch((error) => {
                    console.error('Error moving some files or directories:', error);
                    reject(error);
                });
        });
    });
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

function mizban(assetsFolder) {
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
                    const cssFolder = path.join(assetsFolder, 'css');
                    const jsFolder = path.join(assetsFolder, 'js');
                    const vendorsFolder = path.join(assetsFolder, 'vendors');

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