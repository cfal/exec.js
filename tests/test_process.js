var tag = process.argv.slice(2).join(' ');
setInterval(function() {
    console.log('Ping! (' + tag + ')');
}, 1000);
