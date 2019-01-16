const postcss = require('postcss');
const postcssLess = require('postcss-less-engine-latest');
const { getOptions } = require('loader-utils');
const parseOptions = require('./options');
const validateOptions = require('schema-utils');
const SyntaxError = require('./Error')

module.exports = function(css, map, meta) {
    const options = Object.assign({}, getOptions(this));

    validateOptions(require('./options.json'), options, 'PostCSS Loader');

    const cb = this.async();
    const file = this.resourcePath;
    const sourceMap = options.sourceMap;

    Promise.resolve().then(() => {
        return parseOptions.call(this, options)
      }).then((config) => {
        if (!config) {
          config = {}
        }
    
        let plugins = config.plugins || []
    
        let options = Object.assign({
          from: file,
          map: sourceMap
            ? sourceMap === 'inline'
              ? { inline: true, annotation: false }
              : { inline: false, annotation: false }
            : false
        }, config.options)
    
        if (typeof options.parser === 'string') {
          options.parser = require(options.parser)
        }
    
        if (typeof options.syntax === 'string') {
          options.syntax = require(options.syntax)
        }
    
        if (typeof options.stringifier === 'string') {
          options.stringifier = require(options.stringifier)
        }
    
        if (sourceMap && typeof map === 'string') {
          map = JSON.parse(map)
        }
    
        if (sourceMap && map) {
          options.map.prev = map
        }
    
        return postcss([postcssLess()].concat(plugins))
                .process(css, {
                    from: file,
                    parser: postcssLess.parser
                })
                .then(result => {
                    let { css, map, root, processor, messages } = result
    
                    result.warnings().forEach((warning) => {
                        this.emitWarning(new Warning(warning))
                    })
            
                    messages.forEach((msg) => {
                    if (msg.type === 'dependency') {
                        this.addDependency(msg.file)
                    }
                    })
            
                    map = map ? map.toJSON() : null
            
                    if (map) {
                        map.file = path.resolve(map.file)
                        map.sources = map.sources.map((src) => path.resolve(src))
                    }
            
                    if (!meta) {
                        meta = {}
                    }
            
                    const ast = {
                        type: 'postcss',
                        version: processor.version,
                        root
                    }
            
                    meta.ast = ast
                    meta.messages = messages
            
                    if (this.loaderIndex === 0) {
                        /**
                         * @memberof loader
                         * @callback cb
                         *
                         * @param {Object} null Error
                         * @param {String} css  Result (JS Module)
                         * @param {Object} map  Source Map
                         */
                        cb(null, `module.exports = ${JSON.stringify(css)}`, map)
                
                        return null
                    }
            
                    /**
                     * @memberof loader
                     * @callback cb
                     *
                     * @param {Object} null Error
                     * @param {String} css  Result (Raw Module)
                     * @param {Object} map  Source Map
                     */
                    cb(null, css, map, meta)
            
                    return null
                });
            }).catch((err) => {
                if (err.file) {
                    this.addDependency(err.file)
                }

                return err.name === 'CssSyntaxError'
                    ? cb(new SyntaxError(err))
                    : cb(err);
            })
}
