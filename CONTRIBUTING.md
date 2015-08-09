# Building DaSpec from source

All the source code is in the [src](src) folder. The main entry point is the [Runner](src/runner-js) class.

We use Jasmine for testing DaSpec, and unit tests are in the [spec](spec) folder. If you're fixing a bug, adding a core feature or pretty much doing anything that changes the source code, please change or add a relevant unit test.

Acceptance tests, demonstrating the key features, are in the [test-data](test-data) folder. The system under test for all those examples is in the [test-steps.js](test-data/test-steps.js). Each markdown file contains an example spec and the expected output - the output is in a HTML comment. If you're planning to add new parsing syntax, please add another example file there. The acceptance tests kick off automatically when the unit tests run, from [key-examples-spec.js](key-examples-spec.js)

## Debugging

The easiest way to debug things is to compile a browser version (see below) and then open [compiled/daspec-runner.html](compiled/daspec-runner.html) in a browser. This will automatically link the javascript from the acceptance test steps, and allow you to put in a markdown spec and run it, using the browser debugging tools to pause and inspect.

##Running development tests

Summary results

    npm test

Detailed results in the console

    npm test -- full

(note the blank between -- and full)

##Compiling a browser version of DasSpec

    npm run compile

this will save two bundled files to [compiled](compiled):

* [daspec-web.js](compiled/daspec-web.js): a complete bundle of all the DaSpec classes required to run tests in a browser
* [test.js](compiled/test.js): a version of the browser scripts that includes the markdown formatter and the step definitions from the [test-data](test-data) folder, useful for debugging development versions of DaSpec in a browser.

##Design guidelines

* report errors as narrowly and as precisely as possible
  - eg if only one word in a sentence represents failure, cross that out rather than a whole line
  - report exact position of error in markdown file if possible
* alert spec authors and developers about anything that could cause non-deterministic results
  - eg if a table has two columns with same names, or if two step definitions match the same line
* don't impose any markdown syntax restrictions that aren't absolutely necessary
* support platform-native libraries and idioms so people can get started easily
  - eg matchers people are already used to

