// start with: npx nyc mocha test
import { Logger, log } from '../src/log'


const assert = require('assert');
describe('Logger tests', function () {
    describe('default instance tests', defaultInstanceTests);
    describe('ignored logging levels', ignoredLoggingLevels);
    describe('when using plugins', pluginTests)
});


function defaultInstanceTests(): void {
    it('Initial logging level should be 0', function () {
        assert.equal(log.level, 0);
    });
}

function ignoredLoggingLevels(): void {
    for (let max = 0; max <= 5; max++) {
        const logger = new Logger(`lvl-${max}`, max);
        describe(`If logging level is set to ${max} (${logger.levels[max] || 'silent'})`, function () {

            let level: string;
            for (let index = 0; index < 5; index++) {
                level = logger.levels[index]

                let fnname = (<any>logger)[level].name
                // console.log({ index, level, fnname }, (<any>logger)[level])

                if (index < max) {
                    it(`should use noop for level ${level}`, function () {
                        assert.equal(fnname, 'noop')
                    })
                } else {
                    it(`should not use noop for level ${level}`, function () {
                        assert.notEqual(fnname, 'noop')
                    })
                }

            }
        })
    }
}

function pluginTests(): void {
    describe('use plugins', function () {
        it('should not use a plugin if the method is below the threshold', function () {
            const log = new Logger(Date.now().toString(), 5)
            log.use(() => assert.fail('Should not execute this'))
            log.info('')
        })

        it('should use multiple plugins', function () {
            const log = new Logger(Date.now().toString(), 0)
            let sum = 0
            function fn1() { sum++ }
            log.use(fn1)
            log.use(() => sum++)
            assertPluginLogger(log, true)
            log.info('')
            assert.equal(sum, 2)
            log.error('')
            assert.equal(sum, 4)
        })
    })

    describe('unuse plugins', function () {
        it('should not execute the plugin after unuse', function () {
            const name = Date.now().toString()
            const log = new Logger(name, 0)
            let sum = 0
            function fn1() { sum++ }
            log.use(fn1)
            log.use(() => sum++)

            assertPluginLogger(log, true)
            log.info('')
            assert.equal(sum, 2)
            log.unuse(fn1)
            log.error('')
            assert.equal(sum, 3)
        })

        it('should use the native logger if no plugins are used', function () {
            const name = Date.now().toString()
            const log = new Logger(name, 0)
            let sum = 0
            function fn1() { sum++ }
            log.use(fn1)
            assertPluginLogger(log, true)
            log.info('')
            assert.equal(sum, 1)
            log.unuse(fn1)
            assertPluginLogger(log, false)
            log.error('')
            assert.equal(sum, 1)
        })
    })

    describe('inherit plugins', function () {
        describe('when cloning the logger', clonedLogger)
        describe('when forking the logger', forkedLogger)
    })
}

function clonedLogger() {
    it('parent and child should use the same plugins list', function () {
        const parent = new Logger('parent', 0)
        let sum = 0
        parent.use(() => sum++)
        const child = parent.clone('child')
        parent.info()
        assert.equal(sum, 1, 'Parent should have a plugin')

        // child should use the parent's plugin
        child.info()
        assert.equal(sum, 2, 'Child should use parent\'s plugin')

        sum = 0
        parent.use(() => sum++)
        child.use(() => sum++)
        // adding a plugin to parent should also add it to child
        child.info()
        assert.equal(sum, 3, 'Child should use both new plugins')
        // and adding a plugin to child should also add it to parent
        parent.info()
        assert.equal(sum, 6, 'Parent should use both new plugins')
    })
}

function forkedLogger() {
    it('child should be initialized with the same plugins', function () {
        const parent = new Logger('parent', 0)
        function plus1() { sum++ }

        let sum = 0
        parent.use(plus1)
        const child = parent.fork('child')
        parent.info()
        assert.equal(sum, 1, 'Parent should have a plugin')

        // child should use the parent's plugin
        child.info()
        assert.equal(sum, 2, 'Child should use parent\'s plugin')

        sum = 0
        parent.use(function add1() { sum++ })
        child.use(() => { sum += 3 })
        // adding a plugin to parent should not add it to child
        child.info()
        assert.equal(sum, 4, 'Child should not use the new parent plugin')

        sum = 0
        // and adding a plugin to child should not add it to parent
        parent.info()
        assert.equal(sum, 2, 'Parent should not use the new child plugin')

        sum = 0
        // removing the initial plugin from the parent should not affect the child
        parent.unuse(plus1)
        child.info()
        assert.equal(sum, 4, 'Child should still use `plus1` after removing it from parent')
    })
}


/**
 * Helpers
 */

function assertPluginLogger(logger: Logger, is: boolean = true): void {
    if (is) {
        assert.equal((<any>logger.error).name, 'pluginLogger')
    } else {
        assert.notEqual((<any>logger.error).name, 'pluginLogger')
    }
}