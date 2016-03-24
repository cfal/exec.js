var child_process = require('child_process');
var colors = require('colors/safe');

var colorList = ['red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'gray'];
var nextColor = (function() {
    var i = 0;
    return function() {
        if (i >= colorList.length) {
            // User changed colorList
            i = 0;
        }
        var c = colorList[i];
        i = (i + 1) % colorList.length;
        return c;
    };
})();

var basename = function(s) {
    var tmp = s.split('/')
    tmp = tmp[tmp.length - 1];
    tmp = tmp.split('\\')
    tmp = tmp[tmp.length - 1]
    return tmp;
};

var exec = function(opts) {
    if (typeof opts === 'string') {
        opts = {
            command: opts
        };
    }
    if (typeof opts.command !== 'string') throw 'Invalid command';

    var command = opts.command;
    var args = opts.args || opts.arguments || [];
    var tokens = command.split(/\s+/);;
    command = tokens[0];
    args = tokens.slice(1).concat(args);

    var tag = opts.tag || basename(command);
    var print = (function() {
        if (opts.print) {
            // User defined print function
            return function(s, type) {
                opts.print(s, tag, type);
            };
        } else {
            while (tag.length < 20) tag += ' ';
            tag = (colors[opts.color] || colors[nextColor()])(tag);
            return function(s, type) {
                if (type === 'stderr') s = colors.red(s);
                else if (type == 'info') s = colors.green(s);
                console.log(tag + ' ' + s);
            };
        }
    })();

    var spawnOptions = {};
    for (var key in opts) {
        if (key in ['command', 'args', 'tag', 'print']) {
            continue;
        }
        spawnOptions[key] = opts[key];
    }
    
    var proc = child_process.spawn(command, args, spawnOptions);

    var stdout = '';
    proc.stdout.on('data', function(data) {
        stdout += data.toString();
        var i, line;
        while ((i = stdout.indexOf('\n')) != -1) {
            line = stdout.substring(0, i);
            stdout = stdout.substring(i + 1);
            print(line, 'stdout');
        }
    });

    var stderr = '';
    proc.stderr.on('data', function(data) {
        stderr += data.toString();
        var i, line;
        while ((i = stderr.indexOf('\n')) != -1) {
            line = stderr.substring(0, i);
            stderr = stderr.substring(i + 1);
            print(line, 'stderr');
        }
    });

    proc.on('close', function(code) {
        print('* Process exit (code: ' + code + ')', 'info');
    });

    return proc;
};

exec.colorList = colorList;
module.exports = exec;
