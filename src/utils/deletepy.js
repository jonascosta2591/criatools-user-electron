const {PythonShell}  = require('python-shell')

async function deleteTempPy(){
  PythonShell.run('./src/utils/deletetemp.py', null, function (err) {
    if (err) throw err;
    console.log('finished');
  });
}

module.exports = {deleteTempPy}