# daspec-js

"It's in da spec!"


##Running development tests

Summary results

    npm test

Detailed results

    npm test -- full

(note the blank between -- and full)


##Compiling a browser verion of DasSpec to main.js

> npm run compile


##Design guidelines

* report errors as narrowly and as precisely as possible
  - eg if only one word in a sentence represents failure, cross that out rather than a whole word
* alert spec authors and developers about anything that could cause non-deterministic results
  - eg if a table has two columns with same names, or if two step definitions match the same line
* don't impose any markdown syntax restrictions that aren't absolutely necessary
* support platform-native libraries and idioms so people can get started easily
  - eg matchers people are already used to
