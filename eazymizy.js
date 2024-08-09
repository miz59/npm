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
} else if (variable === 'publish:react') {
    reactFramework();
    console.log('Executing publish code for React...');
} else {
    console.log('Unknown command');
}

function laravelFramework() {
    const assetsSourceDir = path.join(__dirname, 'assets');
    const sassSourceDir = path.join(__dirname, 'sass');
    const mizMinFile = path.join(__dirname, 'miz-min.cjs');

    const assetsDestinationDir = path.join(__dirname, '..', '..', 'public', 'assets');
    const sassDestinationDir = path.join(__dirname, '..', '..', 'resources', 'sass');
    const mizMinDestinationFile = path.join(__dirname, '..', '..', 'miz-min.cjs');
    
    const backupMizDir = path.join(sassDestinationDir , 'backup-miz');
    const mizDir = path.join(sassDestinationDir , 'miz');

    fs.mkdirSync(assetsDestinationDir, { recursive: true });
    fs.mkdirSync(path.dirname(mizMinDestinationFile), { recursive: true });

    

    ncp(assetsSourceDir, assetsDestinationDir, function (err) {
        if (err) {
            return console.error('Error copying assets:', err);
        }
        console.log('Assets copied to /assets folder successfully!');
    });

    ncp(sassSourceDir, mizDir, function (err) {
        if (err) {
            return console.error('Error copying sass:', err);
        }
        console.log('Sass copied to /sass/miz folder successfully!');
    });

    fs.copyFile(mizMinFile, mizMinDestinationFile, (err) => {
        if (err) {
            return console.error('Error copying miz-min.cjs:', err);
        }
        console.log('miz-min.cjs copied to project root successfully!');
    });

    const filesToCopy = ['style.scss', '_layout.scss', '_components.scss'];

    filesToCopy.forEach(file => {
        const sourceFile = path.join(__dirname, file);
        const destinationFile = path.join(sassDestinationDir, file);

        fs.copyFile(sourceFile, destinationFile, (err) => {
            if (err) {
                return console.error(`Error copying ${file}:`, err);
            }
            console.log(`${file} copied to /sass folder successfully!`);
        });
    });

    const pagesSourceDir = path.join(__dirname, 'pages');
    const pagesDestinationDir = path.join(sassDestinationDir, 'pages');
    fs.mkdirSync(pagesDestinationDir, { recursive: true });

    ncp(pagesSourceDir, pagesDestinationDir, function (err) {
        if (err) {
            return console.error('Error copying pages:', err);
        }
    });

    projectPackageJson.scripts = {
        ...projectPackageJson.scripts,
        "watch": "sass --watch --update --style=expanded resources/sass/style.scss:public/assets/css/style.css",
        "build": "sass --no-source-map --style=compressed resources/sass/style.scss:public/assets/css/style.min.css",
        "watch-miz": "sass --watch --update --style=expanded resources/sass/miz/style.scss:public/assets/css/miz.min.css",
        "build-miz": "sass --no-source-map --style=compressed resources/sass/miz/style.scss:public/assets/css/miz.min.css",
        "build-miz-clean": "sass --no-source-map --style=expanded resources/sass/miz/style.scss:public/assets/css/miz-clean.css && node miz-min.cjs laravel",
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

function reactFramework() {
    const assetsSourceDir = path.join(__dirname, 'assets');
    const sassSourceDir = path.join(__dirname, 'sass');
    const mizMinFile = path.join(__dirname, 'miz-min.cjs');

    const assetsDestinationDir = path.join(__dirname, '..', '..', 'src', 'assets');
    const sassDestinationDir = path.join(__dirname, '..', '..', 'src', 'sass');
    const mizMinDestinationFile = path.join(__dirname, '..', '..', 'miz-min.cjs');
    
    const backupMizDir = path.join(sassDestinationDir , 'backup-miz');
    const mizDir = path.join(sassDestinationDir , 'miz');

    fs.mkdirSync(assetsDestinationDir, { recursive: true });
    fs.mkdirSync(path.dirname(mizMinDestinationFile), { recursive: true });

    

    ncp(assetsSourceDir, assetsDestinationDir, function (err) {
        if (err) {
            return console.error('Error copying assets:', err);
        }
        console.log('Assets copied to src/assets folder successfully!');
    });

    ncp(sassSourceDir, mizDir, function (err) {
        if (err) {
            return console.error('Error copying sass:', err);
        }
        console.log('Sass copied to src/sass/miz folder successfully!');
    });

    fs.copyFile(mizMinFile, mizMinDestinationFile, (err) => {
        if (err) {
            return console.error('Error copying miz-min.cjs:', err);
        }
        console.log('miz-min.cjs copied to project root successfully!');
    });

    const filesToCopy = ['style.scss', '_layout.scss', '_components.scss'];
    const sassDestinationRootDir = path.join(__dirname, '..', '..', 'src', 'sass');

    filesToCopy.forEach(file => {
        const sourceFile = path.join(__dirname, file);
        const destinationFile = path.join(sassDestinationRootDir, file);

        fs.copyFile(sourceFile, destinationFile, (err) => {
            if (err) {
                return console.error(`Error copying ${file}:`, err);
            }
            console.log(`${file} copied to src/sass folder successfully!`);
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
        "watch": "sass --watch --update --style=expanded src/sass/style.scss:src/assets/css/style.css",
        "build": "sass --no-source-map --style=compressed src/sass/style.scss:src/assets/css/style.min.css",
        "watch-miz": "sass --watch --update --style=expanded src/sass/miz/style.scss:src/assets/css/miz.min.css",
        "build-miz": "sass --no-source-map --style=compressed src/sass/miz/style.scss:src/assets/css/miz.min.css",
        "build-miz-clean": "sass --no-source-map --style=expanded src/sass/miz/style.scss:src/assets/css/miz-clean.css && node miz-min.cjs react",
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