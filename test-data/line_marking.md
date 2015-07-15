#marks assertion results when there is more than one assertion on a line

Multiple Assertions 1 is 1 and fails
Multiple Assertions 1 is 1 and passes
Multiple Assertions 1 is 2 and fails
Multiple Assertions 1 is 2 and passes
Multiple Assertions line passes and fails
Multiple Assertions line passes and passes
Multiple Assertions line fails and fails
Simple arithmetic: 2 and 2 added is 5 and multiplied is 4
Simple arithmetic: 2 and 2 added is 5 and multiplied is 5

<!--
#marks assertion results when there is more than one assertion on a line

**~~Multiple Assertions 1 is 1 and fails~~**
**Multiple Assertions 1 is 1 and passes**
**~~Multiple Assertions 1 is 2 and fails~~**
Multiple Assertions 1 is **~~2~~ [1]** and passes
**~~Multiple Assertions line passes and fails~~**
**Multiple Assertions line passes and passes**
**~~Multiple Assertions line fails and fails~~**
Simple arithmetic: 2 and 2 added is **~~5~~ [4]** and multiplied is **4**
Simple arithmetic: 2 and 2 added is **~~5~~ [4]** and multiplied is **~~5~~ [4]**
-->
