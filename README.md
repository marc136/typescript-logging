
Minimal leightweight logging for TypeScript and JavaScript.  

Log levels *trace*, *debug*, *info*, *warn*, *error*, *silent*.


## Features

* Displays the correct line numbers in the browser.

* Supports different log levels, if the level is set to `warn`, only `log.warn` and `log.error` are executed. Other messages like `log.info` stay silent.

* Log methods gracefully fall back to simpler console logging methods if they are not supported in the environment. E.g. calls to log.debug() go to console.debug() if possible, otherwise to console.log().

* Plugins may be used to transform the logging output, e.g. to prefix all messages with a timestamp.


## Installation
Install [node.js](nodejs.org) and then run `npm install --save typed-logging` or `yarn add typed-logging` to add typed-logging as a dependency.


## Usage

And then use it
```javascript
// when using TypeScript or ES6 modules
import log rom 'typed-logging';

// when using CommonJS
const { log } = require('typed-logging');

log.info('info')
```

In the browser, you can also directly use it as an [UMD package](https://github.com/umdjs/umd) from [unpkg](https://unpkg.com):

```html
<script src="https://unpkg.com/typed-logging/dist/typed-logging.umd.js"></script>
```

*This exposes the class `window.Logger` and the default instance `window.log`.*
