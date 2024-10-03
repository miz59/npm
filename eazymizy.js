const { log } = require('console');
const fs = require('fs');
const path = require('path');
const ncp = require('ncp').ncp;

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

function laravelFramework() {
    const assetsSourceDir = path.join(__dirname, 'assets');
    const sassSourceDir = path.join(__dirname, 'sass');
    const htmlComponentSourceDir = path.join(__dirname, 'html');
    const mizMinFile = path.join(__dirname, 'miz-min.cjs');

    const assetsFolder = 'public';
    const sassFolder = 'resources';
    const framework = 'laravel';
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
        "watch-miz": "sass --watch --update --style=expanded " + sassFolder + "/sass/miz/style.scss:" + assetsFolder + "/assets/css/miz.min.css",
        "build-miz": "sass --no-source-map --style=compressed " + sassFolder + "/sass/miz/style.scss:" + assetsFolder + "/assets/css/miz.min.css",
        "build-miz-clean": "sass --no-source-map --style=expanded " + sassFolder + "/sass/miz/style.scss:" + assetsFolder + "/assets/css/miz-clean.css && node miz-min.cjs " + framework,
    };

    fs.writeFileSync(projectPackageJsonPath, JSON.stringify(projectPackageJson, null, 2));

    if (fs.existsSync(mizDir)) {
        if(fs.existsSync(backupMizDir)){
            
            fs.rmdirSync(backupMizDir ,{recursive:true , force:true}, (err)=>{
                console.log(err)
            });
        }
        fs.mkdirSync(backupMizDir, { recursive: true });        
       
        moveFiles(mizDir, backupMizDir);
            
    }else{}
}

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
        "watch-miz": "sass --watch --update --style=expanded " + sassFolder + "/sass/miz/style.scss:" + assetsFolder + "/assets/css/miz.min.css",
        "build-miz": "sass --no-source-map --style=compressed " + sassFolder + "/sass/miz/style.scss:" + assetsFolder + "/assets/css/miz.min.css",
        "build-miz-clean": "sass --no-source-map --style=expanded " + sassFolder + "/sass/miz/style.scss:" + assetsFolder + "/assets/css/miz-clean.css && node miz-min.cjs " + framework,
    };

    fs.writeFileSync(projectPackageJsonPath, JSON.stringify(projectPackageJson, null, 2));

    if (fs.existsSync(mizDir)) {
        if(fs.existsSync(backupMizDir)){
            
            fs.rmdirSync(backupMizDir ,{recursive:true , force:true}, (err)=>{
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
        "watch-miz": "sass --watch --update --style=expanded " + sassFolder + "/sass/miz/style.scss:" + assetsFolder + "/assets/css/miz.min.css",
        "build-miz": "sass --no-source-map --style=compressed " + sassFolder + "/sass/miz/style.scss:" + assetsFolder + "/assets/css/miz.min.css",
        "build-miz-clean": "sass --no-source-map --style=expanded " + sassFolder + "/sass/miz/style.scss:" + assetsFolder + "/assets/css/miz-clean.css && node miz-min.cjs " + framework,
    };

    fs.writeFileSync(projectPackageJsonPath, JSON.stringify(projectPackageJson, null, 2));

    if (fs.existsSync(mizDir)) {
        if(fs.existsSync(backupMizDir)){
            
            fs.rmdirSync(backupMizDir ,{recursive:true , force:true}, (err)=>{
                console.log(err)
            });
        }
        fs.mkdirSync(backupMizDir, { recursive: true });        
       
        moveFiles(mizDir, backupMizDir);
            
    }else{
        
    }


}

const sourceDir = path.join(__dirname, 'miz');
const backupDir = path.join(__dirname, 'backup-miz');

function moveFiles(srcDir, destDir) {
    if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir);
    }

    fs.readdir(srcDir, (err, files) => {
        if (err) {
            console.error('Error reading source directory:', err);
            return;
        }

        files.forEach(file => {
            const srcPath = path.join(srcDir, file);
            const destPath = path.join(destDir, file);

            fs.rename(srcPath, destPath, err => {
                if (err) {
                    console.error('Error moving file:', err);
                } else {
                    console.log(`Moved ${file} to ${destDir}`);
                }
            });
        });
    });
}