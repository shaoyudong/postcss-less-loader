const postcss = require('postcss');
const postcssLess = require('postcss-less-engine-latest');

module.exports = function(css, map, meta) {
    const cb = this.async();
    postcss([postcssLess()])
        .process(css, {
            parser: postcssLess.parser
        })
        .then(res => {
            cb(null, res.css, map, meta);
        });
}
