const fs = require('fs').promises
const path = require('path')

async function clean (folder) {
  return fs
    .readdir(folder)
    .catch(ex => {
      if (ex.code === 'ENOENT') return []
      else throw ex
    })
    .then(files =>
      files.map(file => {
        if (
          file.endsWith('.d.ts') ||
          file.endsWith('.map') ||
          file.endsWith('.js')
        ) {
          return fs.unlink(path.join(folder, file))
        } else {
          return Promise.resolve(null)
        }
      })
    )
}

Promise.all(['src', 'test', 'dist'].map(clean))
  .then(() => console.log('cleaned build artifacts'))
  .catch(reason => {
    console.error('Could not successfully clean build artifacts', reason)
    process.exit(1)
  })
