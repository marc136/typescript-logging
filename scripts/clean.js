const fs = require('fs').promises
const path = require('path')

async function clean (folder) {
  return (await fs.readdir(folder)).map(file => {
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
}

Promise.all(['src', 'test', 'dist'].map(clean)).then(() =>
  console.log('cleaned build artifacts')
)
