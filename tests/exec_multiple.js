var exec = require('../src/exec');
for (var i = 1; i <= 10; i++) {
    exec({
        command: 'node test_process.js Process ' + i,
        tag: 'proc_' + i
    });
}
