Release plan
------------

# Enable JS teams and their stakeholders to write markdown executable specs

* ~~support for tables~~
* web browser runner
* ~~nodejs runner~~
* go through TODO items
* file/line number reporting on failed assertions
* file/line number reporting on exceptions in parsing
* report successful assertion on tables/lists with ticks
* ~~Format whitespace on column headings in the initial report column~~
* optimistically convert to numbers whatever possible
* increment numerical lists in output
* whitespace before step and attachment
* beforeEach/All, afterEach/All - technical steps
* beforeEach/All, afterEach/All - business steps (eg a file pattern)

# Enable JS developers to easily install and integrate daspec

* ~~npm package/install~~
* bower install
* ~~integrated into npm test~~
* junit XML output
* tap output
* grunt integration
* gulp integration
* clean syntax for ~~step definitions~~ and assertions
* simple syntax for async expectations
* color reporting in the console

# Enable JS developers to easily get started

* flexible matcher library support (js hamcrest?)
  * try to discover positions from expected values
* ~~getting started guide on the web~~
* ~~nice example project to copy/paste from~~
* generate proposal steps

# Enable JS developers to easily contribute to daspec development

* ~~publish design objectives/guidelines~~ 
* ~~clean build/test script using npm~~
* ~~clean/simple pipeline for execution so people can easily understand what's going on where~~
* extract formatter module so people can make their own reporters easily
* extract runner module so people can make their own runners easily
