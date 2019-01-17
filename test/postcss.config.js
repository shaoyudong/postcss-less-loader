const postcss = require('postcss');
const reverseProps = postcss.plugin('reverseProps', () => {
    return (root) => {
        root.walkDecls(decl => {
            decl.prop = decl.prop.split('').reverse().join('');
        });
    }
})

module.exports = {
    plugins: [
        reverseProps
    ],
    alias: {
        "@test": "/Users/shao/Documents/workspace/postcss-less-loader/test"
    }
};
