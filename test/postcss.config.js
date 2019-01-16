const postcss = require('postcss');
const test = postcss.plugin('test', () => {
    return () => {

    }
})

module.exports = {
    plugins: [
        require('autoprefixer')
    ]
};
