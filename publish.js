const version = require('./package.json').version;
const exec = require('child_process').spawnSync;
exec('git', ['add', '.']);
exec('git', ['commit', '-m', `feat: v${version}`]);