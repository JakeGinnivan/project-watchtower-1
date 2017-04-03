import * as path from 'path'
import { forkPromise } from '../__util/process'
import CONFIG from '../config/config'

const { LINT_EXCLUDE } = CONFIG

const tslint = (...paths: string[]) => {
    const usePaths = paths.length
            ? paths
            : [ '**/*.ts?(x)' ]

    const executable = path.resolve(process.cwd(), 'node_modules', 'tslint', 'bin', 'tslint')

    const exclude = [
        '**/*.d.ts',
        '**/node_modules/**',
        ...LINT_EXCLUDE,
    ]

    const args = [
        ...usePaths,
        '--type-check',
        '--project',
        './tsconfig.json',
    ]

    exclude.forEach((x) => {
        args.push('-e')
        args.push(x)
    })

    return forkPromise(executable, args)
}

export default tslint