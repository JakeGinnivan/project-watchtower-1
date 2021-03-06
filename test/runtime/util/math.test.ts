import { average, getSequenceAverage } from '../../../lib/util/math'
import { createConsoleLogger } from '../../../lib/runtime/universal'

const log = createConsoleLogger()

describe('util/math', () => {
    it('average', () => {
        expect(average([1])).toBe(1)
        expect(average([1, 2])).toBe(1.5)
    })

    it('getSequenceAverage', async () => {
        let i = 1
        const iteration = async () => i++
        const avg = await getSequenceAverage(log, iteration, 2)
        expect(avg).toBe(1.5)
    })
})
