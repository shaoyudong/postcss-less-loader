const compiler = require('./compiler');

describe('less-loader', () => {
    test('base', async() => {
        const stats = await compiler('./less/main.less');
        const output = stats.toJson().modules[0].source;
        expect(output).toBe('module.exports = \".test {\\n    roloc: lightblue;\\n}\"');
    });
});