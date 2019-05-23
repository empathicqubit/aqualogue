const shell = require('shelljs');
const fs = require('fs');
const path = require('path');

const scripts = {
    build: () => {
        shell.config.fatal = true;
        fs.copyFileSync(__dirname +'/header.html', __dirname + '/index.html');
        const jsFiles = shell.ls('-R').filter(file => file.match(/\.js$/) && !file.match(/(^node_modules\/|scripts\.js$)/));
        jsFiles.reverse();
        for(const jsFile of jsFiles) {
            fs.appendFileSync(__dirname + '/index.html', `<script type="text/javascript" src="${jsFile}"></script>`);
        }

        fs.appendFileSync(__dirname + '/index.html', `</body></html>`);

        shell.exec(`TexturePacker ${__dirname}/assets/sprites.tps`)
    },
};

const args = [...process.argv];

args.shift();
args.shift();

console.log(args);

let current = scripts;
for(const arg of args[0].split(':')) {
    current = current[arg];
}

current();
