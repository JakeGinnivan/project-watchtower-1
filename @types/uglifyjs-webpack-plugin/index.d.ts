declare module 'uglifyjs-webpack-plugin' {
    import { Plugin } from 'webpack'

    export = UglifyJsPlugin

    declare class UglifyJsPlugin extends Plugin {
        constructor(options?: UglifyJsPlugin.UglifyJsPluginOptions)
    }

    declare namespace UglifyJsPlugin {
        interface UglifyJsPluginOptions {
            test?: RegExp | RegExp[]
            include?: RegExp | RegExp[]
            exclude?: RegExp | RegExp[]
            cache?: boolean | string
            parallel?: boolean | number
            sourceMap?: boolean
            uglifyOptions?: UglifyJsOptions
            extractComments?:
                | boolean
                | RegExp
                | ((node: object, comment: string) => boolean)
                | ExtractCommentsOptions
            warningsFilter?: (source: string) => boolean
        }

        interface UglifyJsOptions {
            ie8?: boolean
            ecma?: number
            parse?: object
            mangle?: boolean | object
            output?: object
            compress?: boolean | object
            warnings?: boolean
            toplevel?: boolean
            nameCache?: object
            keep_classnames?: boolean
            keep_fnames?: boolean
            safari10?: boolean
        }

        interface ExtractCommentsOptions {
            condition?: RegExp | ((node: object, comment: string) => boolean)
            filename?: string | ((originalFileName: string) => string)
            banner?: boolean | string | ((fileName: string) => string)
        }
    }
}
