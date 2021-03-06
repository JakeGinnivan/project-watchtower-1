import {
    validateCache,
    writeDummyFile,
    writeDummyConfigFile,
    deletePath,
    setup,
    setupWithBuildInfo,
    getConfigContents,
} from '../../lib/bin/cache-validator'
import { createConsoleLogger } from '../../lib/runtime/universal'
import mkdirp from 'mkdirp'
import path from 'path'
import { BuildEnvironment, BuildTarget } from 'lib'

const log = createConsoleLogger()

describe('cache-validator tests', () => {
    const TEST_CACHE_DIR = path.join(__dirname, '/cache/')
    const TS_CONFIG_PATH = path.join(TEST_CACHE_DIR, 'tsconfig.json')
    const TEST_VALIDATION_CONFIG_PATH = path.join(TEST_CACHE_DIR, 'config.json')
    const TS_CONFIG_HASH_KEY = 'tsconfigblahkey'

    beforeEach(async () => {
        mkdirp.sync(path.resolve(TEST_CACHE_DIR))
        await deletePath(log, TEST_VALIDATION_CONFIG_PATH)
        await deletePath(log, TS_CONFIG_PATH)

        setup(log, {
            cacheDirectory: TEST_CACHE_DIR,
            validationItems: [
                { isFile: true, filePath: TS_CONFIG_PATH, hashKey: TS_CONFIG_HASH_KEY },
            ],
            valiationConfigPath: TEST_VALIDATION_CONFIG_PATH,
        })
    })

    afterEach(async () => {
        await deletePath(log, TEST_CACHE_DIR)
        await deletePath(log, TEST_VALIDATION_CONFIG_PATH)
        await deletePath(log, TS_CONFIG_PATH)
    })

    it('remove cache dir when tsconfig not present', async () => {
        await validateCache(log)
        const config = await getConfigContents(log, TEST_VALIDATION_CONFIG_PATH)
        expect(config).toBeDefined()
        if (config) {
            expect(config.cacheCleared).toEqual(true)
        }
    })

    it('craete validation config when no validation config present', async () => {
        await writeDummyFile(log, path.resolve(TS_CONFIG_PATH), 'aaaaaaaa')
        await validateCache(log)
        const config = await getConfigContents(log, TEST_VALIDATION_CONFIG_PATH)
        expect(config).toBeDefined()
        if (config) {
            expect(config.cacheCleared).toEqual(true)
        }
    })

    it('dont remove cache dir as the tsconfig matches the validation config', async () => {
        await writeDummyFile(log, path.resolve(TS_CONFIG_PATH), 'aaaaaaaa')
        await writeDummyConfigFile(log, path.resolve(TEST_VALIDATION_CONFIG_PATH), {
            [TS_CONFIG_HASH_KEY]: '3dbe00a167653a1aaee01d93e77e730e',
            cacheCleared: false,
        }) // the hash for aaa

        await validateCache(log)
        const config = await getConfigContents(log, TEST_VALIDATION_CONFIG_PATH)
        expect(config).toBeDefined()
        if (config) {
            expect(config.cacheCleared).toEqual(false)
        }
    })
})

describe('cache-validator tests - with build info', () => {
    const TEST_CACHE_DIR = path.join(__dirname, '/cache/')
    const TS_CONFIG_PATH = path.join(TEST_CACHE_DIR, 'tsconfig.json')

    const buildInfo = {
        project: 'some/project',
        environment: 'prod' as BuildEnvironment,
        target: 'client' as BuildTarget,
    }

    let cacheDirectory = ''
    let cacheValidationConfigPath = ''

    beforeEach(async () => {
        const config = setupWithBuildInfo(log, {
            cacheDirectory: TEST_CACHE_DIR,
            validationItems: [{ isFile: true, filePath: TS_CONFIG_PATH, hashKey: 'tsConfig' }],
            buildInfo,
        })

        cacheDirectory = config.cacheDirectory
        cacheValidationConfigPath = config.cacheValidationConfigPath

        mkdirp.sync(path.resolve(cacheDirectory))
        await deletePath(log, cacheValidationConfigPath)
        await deletePath(log, TS_CONFIG_PATH)
    })

    afterEach(async () => {
        await deletePath(log, cacheDirectory)
        await deletePath(log, cacheValidationConfigPath)
        await deletePath(log, TS_CONFIG_PATH)
    })

    it('remove cache dir when tsconfig not present - with build info', async () => {
        await validateCache(log)
        const config = await getConfigContents(log, cacheValidationConfigPath)
        expect(config).toBeDefined()
        if (config) {
            expect(config.cacheCleared).toEqual(true)
        }
    })

    it('create validation config when no validation config present - with build info', async () => {
        await writeDummyFile(log, path.resolve(TS_CONFIG_PATH), 'aaaaaaaa')
        await validateCache(log)
        const config = await getConfigContents(log, cacheValidationConfigPath)
        expect(config).toBeDefined()
        if (config) {
            expect(config.cacheCleared).toEqual(true)
        }
    })

    it('dont remove cache dir as the tsconfig matches the validation config - with build info', async () => {
        await writeDummyFile(log, path.resolve(TS_CONFIG_PATH), 'aaaaaaaa')
        await writeDummyConfigFile(log, cacheValidationConfigPath, {
            tsConfig: '3dbe00a167653a1aaee01d93e77e730e',
            cacheCleared: false,
        }) // the hash for aaa

        await validateCache(log)
        const config = await getConfigContents(log, cacheValidationConfigPath)
        expect(config).toBeDefined()
        if (config) {
            expect(config.cacheCleared).toEqual(false)
        }
    })
})
