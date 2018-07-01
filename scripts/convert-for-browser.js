const fs = require('fs').promises
const path = require('path')

const encoding = 'utf8'

const oldHeader = `})(function (require, exports) {`
const newHeader = `    else if (typeof window !== "undefined") {
        window.exports = {}
        factory(undefined, window.exports);
    }
})(function (require, exports) {`

async function replaceUmdHeader (src, dest) {
  const module = await fs.readFile(src, { encoding })

  const browser = module.replace(oldHeader, newHeader)

  await fs.mkdir(dest).catch(ex => {
    if (ex.code !== 'EEXIST') throw ex
  })

  const file =path.join(dest, 'typed-logging.umd.js')

  await fs.writeFile(file, browser, { encoding })
  console.log(`Refreshed ${file}`)
}

replaceUmdHeader('dist/log.js', 'dist')
