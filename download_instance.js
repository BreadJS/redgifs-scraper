const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const { exec, spawn } = require('child_process');
const ProgressBar = require('progress');
const chalk = require('chalk');

const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const readFileAsync = promisify(fs.readFile);

function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function getFilesInFolder(folderPath) {
  try {
    const files = await readdir(folderPath);
    const filesArray = [];

    for (const file of files) {
      const filePath = path.join(folderPath, file);
      const fileStat = await stat(filePath);

      if (fileStat.isFile()) {
        filesArray.push(filePath);
      }
    }

    return filesArray;
  } catch (err) {
    console.error('Error reading folder:', err);
    return [];
  }
}

async function downloadFile(videoUrl, catNo, catTotalNo, no, totalNo, folderName) {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(`downloads/${folderName}`)) {
      fs.mkdirSync(`downloads/${folderName}`, { recursive: true });
    }

    const downloadCommand = `ytdlp\\yt-dlp.exe -o downloads/${folderName}/${no}-%(title)s.%(ext)s --newline --no-check-certificate --ignore-config --no-playlist ${videoUrl}`;
    
    const youtubeDlProcess = spawn(downloadCommand, [], { shell: true });

    /* Output data */
    let getName = false;
    let alreadyDownloaded = false;

    youtubeDlProcess.stdout.on('data', data => {
      const output = data.toString();

      /* Get the name */
      if (!getName) {
        if (output.includes('[download] ')) {
          getName = true;
          console.log(`${chalk.gray(`[${catNo}/${catTotalNo}] [${no}/${totalNo}]`)} ${chalk.cyan(`[${folderName}]`)}`, output.replace('[download] ', '').replace(' has already been downloaded', '').replace('\n', ''));
          
          /* If already has been downloaded */
          if(output.includes('has already been downloaded')) {
            alreadyDownloaded = true;
          }
        }
      }
    });

    youtubeDlProcess.stderr.on('data', data => {
      console.error(`Download command stderr: ${data}`);
    });

    youtubeDlProcess.on('error', error => {
      console.error(`Error executing download command: ${error.message}`);
      reject(error);
    });

    youtubeDlProcess.on('close', code => {
      if (code === 0) {
        if(alreadyDownloaded) {
          console.log(`${chalk.gray(`[${catNo}/${catTotalNo}] [${no}/${totalNo}]`)} ${chalk.cyan(`[${folderName}]`)} ${chalk.yellow('Video already downloaded!')}`);
        } else {
          console.log(`${chalk.gray(`[${catNo}/${catTotalNo}] [${no}/${totalNo}]`)} ${chalk.cyan(`[${folderName}]`)} ${chalk.green('Video downloaded successfully!')}`);
        }
        resolve();
      } else {
        console.error(`Download command exited with code ${code}`);
        reject(new Error(`Download command exited with code ${code}`));
      }
    });
  });
}

async function getFileData(url) {
  try {
    const data = await readFileAsync(url, 'utf8');
    const lines = data.split('\n');
    const array = [];

    lines.forEach((line, index) => {
      array.push(line);
    });

    return array;
  } catch (err) {
    console.error('Error reading file:', err);
    return [];
  }
}

(async() => {
  const filesArray = await getFilesInFolder('text_outputs');
  
  for(let h = 0; h < filesArray.length; h++) {
    const fileLinks = await getFileData(filesArray[h]);
    for(let i = parseInt(process.argv[3]); i < fileLinks.length;) {
      await downloadFile(fileLinks[i], h+1, filesArray.length, i+1, fileLinks.length, filesArray[h].split('\\')[1].replace('.txt', ''));

      /* Multiple instances calculations */
      for(let j = 0; j < parseInt(process.argv[2]); j++) {
        i++;
      }
    }
  }
})();