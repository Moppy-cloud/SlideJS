const fs = require('fs');
const colors = require('colors');

const mkdir = path => new Promise(resolve => { if(!fs.existsSync(path)) return fs.mkdir(path, resolve) });
const file = (path, content) => new Promise(resolve => { if(!fs.existsSync(path)) return fs.writeFile(path, content || '', resolve) });


const folders = 'private public public/css public/media app app/pages app/components app/pages/css'.split(' ').filter(i => i);
const files = ''.split(' ').filter(i => i);

const fileInit = async () => {
    fs.writeFileSync('./app/pages/example_page.html', `I'm an example! You can use components or dynamic variables using brackets and also HTML!`);
    // .brightCyan.bold
    console.log('Creating folders...'.yellow.bold);
    folders.forEach(async folder => {
        console.log(` - ${folder}`.brightCyan.bold);
        await mkdir(folder);
    });

    console.log('\nCreating files...'.yellow.bold);
    files.forEach(async newFile => {
        console.log(` - ${newFile}`.brightCyan.bold);
        await file(newFile);
    });
    fs.writeFileSync('./app/main.ssjs', `@html example_page from 'example_page.html';
import Slide from './slide.class.js';
const slide = new Slide();
  
const app = () => {;
  slide.setGlobal('hello_world', 'variable setted properly!');
    slide.render(home);
  }`);
}

const createCSSFiles = async () => {
    const pages = fs.readdirSync('./app/pages').filter(i => i.endsWith('.html'));
    pages.forEach(async page => {
        console.log(` - ${page.substring(0, page.length - 5)}.css`.brightCyan.bold);
        await file(`./app/pages/css/${page.substring(0, page.length - 5)}.css`);
    });
    return pages;
}

const compileSSJS = file => {
    const content = fs.readFileSync(file).toString();
    let compiled = content.split('\n').map(i => i.split(';').filter(i => i).map(i => i + ';')).flat(Infinity).filter(i => i);
    const toImport = [];
    const isImport = i => i.startsWith('@html') && i.split(' ').length >= 4 && i.split(' ')[2] === 'from';
    compiled.filter(isImport).forEach(i => toImport.push([i.split("'")[0].split(' '), i.split("'")[1].split("'")[0]].flat(Infinity).filter(i => i)))
    compiled = compiled.filter(i => !isImport(i));
    toImport.forEach(i => {
        const content = fs.readFileSync('./app/pages/' + i[3]).toString().replaceAll('`', '\`').split('{').map(i => {
            const variableName = i.split('}')[0];
            return '<span data-listener-var="' + variableName + '">' + i.split('}').join('</span>');
        }).join('');
        compiled.unshift(`const ${i[1]} = \`<link rel="stylesheet" href="/css/${i[1]}.css">${content}\``)
    });
    return compiled.join('\n') + ';app();';
}

const process = async () => {
    console.log('\n\nCreating station...'.brightBlue.bold);
    await fileInit();
    console.log('\nCreating CSS Files...'.yellow.bold);
    await createCSSFiles();
    console.log('\n%s%s%s%s%s', 'Switching process file ('.green.bold, 'init.js'.gray, ' => '.white, 'index.js'.gray, ')'.green.bold);
    console.log('\nCopying files...'.gray.bold);
    await new Promise(resolve => fs.writeFile('./public/main.js', compileSSJS('./app/main.ssjs'), resolve));
    fs.readdirSync('./app/pages/css').forEach(file => fs.copyFileSync('./app/pages/css/' + file, './public/css/' + file));
}
process();
