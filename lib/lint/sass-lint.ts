import * as path from 'path'
import CONFIG from '../config/config'
import { forkPromise } from '../__util/process'

const { LINT_EXCLUDE } = CONFIG

const sassLint = (...paths: string[]) => {
    const usePaths = paths.length
            ? paths
            : [ '**/*.scss' ]

    const executable = path.resolve(process.cwd(),
        'node_modules', 'sass-lint', 'bin', 'sass-lint.js')

    const ignore = [
        '**/node_modules/**',
        ...LINT_EXCLUDE,
    ]

    const args = [
        ...usePaths,
        '--verbose',
        '--no-exit',
        '--ignore',
        `'${ignore.join(' ')}'`,
    ]

    return forkPromise(executable, args)
}

export default sassLint