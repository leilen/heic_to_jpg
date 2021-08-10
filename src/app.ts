import * as fs from 'fs';
import * as convert from 'heic-convert';
import {path as rootPath} from 'app-root-path';
import {promisify} from 'util';
import * as FileType from 'file-type';

const inputDir = `${rootPath}/input`;
const outputDir = `${rootPath}/output`;

function loadInputFileNameArr(): string[] {
  try {
    const inputDirLstat = fs.lstatSync(`${inputDir}`);
    if (inputDirLstat.isDirectory()) {
      const fileArr = fs.readdirSync(`${inputDir}`);
      return fileArr.map(v => `${inputDir}/${v}`);
    } else {
      return [];
    }
  } catch (e) {
    throw e;
  }
}

async function recursiveFunction(fileArr: string[]) {
  for (const file of fileArr) {
    const inputDirLstat = fs.lstatSync(file);
    if (inputDirLstat.isDirectory()) {
      const tempFileArr = fs.readdirSync(file).map(v => `${file}/${v}`);
      await recursiveFunction(tempFileArr);
    } else {
      await convertToJpg(file);
    }
  }
}
function createParentDir(fileName: string) {
  const dirArr = fileName.replace(outputDir, '').split('/').slice(1, -1);
  let dirString = outputDir;
  for (const dir of dirArr) {
    dirString += `/${dir}`;
    try {
      const dirStat = fs.lstatSync(dirString);
      if (dirStat.isFile()) {
        fs.mkdirSync(dirString);
      }
    } catch (e) {
      fs.mkdirSync(dirString);
    }
  }
}
//async function convertToJpg(fileName: string) {
//const outputFileName = fileName.replace(`${inputDir}`, `${outputDir}`);
//createParentDir(outputFileName);
//console.log(outputFileName);
//try {
//const inputBuffer = fs.readFileSync(fileName);
//const outputBuffer = await convert({
//buffer: inputBuffer,
//format: 'JPEG',
//quality: 1,
//});
//await promisify(fs.writeFile)(outputFileName, outputBuffer);

//console.log('ok');
//} catch (e) {
//fs.copyFileSync(fileName, outputFileName);
//console.log('error');
//}
//}

async function convertToJpg(fileName: string) {
  const realFileName = fileName.split('/')[fileName.split('/').length - 1];
  if (realFileName === '.DS_Store') {
    return;
  }
  const outputFileName = `${outputDir}/${realFileName.replace(/\.((HEIC)|(heic))$/g, '.jpg')}`;
  try {
    const fileType = await FileType.fromFile(fileName);
    if (!fileType) {
      return;
    }
    if (fileType.ext === 'heic') {
      const inputBuffer = fs.readFileSync(fileName);
      const outputBuffer = await convert({
        buffer: inputBuffer,
        format: 'JPEG',
        quality: 1,
      });
      await promisify(fs.writeFile)(outputFileName, outputBuffer);
      console.log(outputFileName);
    }
  } catch (e) {
    console.log(e);
    fs.copyFileSync(fileName, outputFileName);
    //console.log('error');
  }
}
async function main() {
  const fileArr = loadInputFileNameArr();
  await recursiveFunction(fileArr);
}

main();
