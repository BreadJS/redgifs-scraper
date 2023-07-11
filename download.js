const { spawn } = require('child_process');

let instances = (isNaN(parseInt(process.argv[2])) ? 1 : parseInt(process.argv[2]));

for(let i = 0; i < instances; i++) {
  const childProcess = spawn('node', ['download_instance.js', instances, i], { stdio: 'inherit', shell: true });

  childProcess.on('data', data => {
    console.log(data.toString().replace('\n', ''));
  });
}