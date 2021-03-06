const sh = require('child_process').spawnSync;
const args = process.argv.slice(2);

const interval = 1000;
let lastRead = [];
const filterExpression = args[0] || '';
const filterMatcher = filterExpression ? new RegExp(filterExpression) : { test() { return false }};
const filterFn = (s) => !filterMatcher.test(s);

function read() {
    const next = String(sh('dmesg', { encoding: 'utf-8' }).output.join('\n')).trim();
    const lines = next.split('\n').slice(-100).filter(Boolean).filter(filterFn);
    let cursor = lines.length;

    while (cursor) {
        const line = lines[cursor];
        const index = lastRead.lastIndexOf(line);
        
        if (index === -1) {
            cursor--;
            continue;
        }
        
        const lineIsRepeated = lines[cursor - 1] === lastRead[cursor - 1]
        if (lineIsRepeated) {
            break;
        }

        cursor--;
    }

    lastRead = lines;
    const newLines = cursor ? lines.slice(cursor + 1) : [];
    if (newLines.length) {
        const now = Date.now();
        process.stdout.write(newLines.map(line => `[${now}] ${line}`).join('\n') + '\n');
    }
}

setInterval(read, interval);