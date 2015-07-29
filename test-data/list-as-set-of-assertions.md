#Lists can be a set of assertions

##These prove I know arithmetic
* Simple arithmetic: 2 plus 2 is 4
* Simple arithmetic: 2 plus 3 is 5
* Simple arithmetic: 3 plus 3 is 5
* List can contain sub lists
  - Simple arithmetic: 2 plus 2 is 4

> These prove I know arithmetic too

- Simple arithmetic: 2 plus 2 is 4
- Simple arithmetic: 2 plus 3 is 5
- Simple arithmetic: 3 plus 3 is 5

###These prove I know arithmetic in order
1. Simple arithmetic: 2 plus 2 is 4
11. Simple arithmetic: 2 plus 3 is 5
101. Simple arithmetic: 3 plus 3 is 5


##Whole line failures/passes bold the list items, not the list symbol 

* Multiple Assertions 1 is 1 and fails
* Multiple Assertions 1 is 3 and fails
* Multiple Assertions 1 is 1 and passes
  - Multiple Assertions 1 is 1 and passes

<!--OUTPUT
> **In da spec:** executed: 18, passed: 12, failed: 6, skipped: 1

#Lists can be a set of assertions

##These prove I know arithmetic
* Simple arithmetic: 2 plus 2 is **4**
* Simple arithmetic: 2 plus 3 is **5**
* Simple arithmetic: 3 plus 3 is **~~5~~ [6]**
* List can contain sub lists
  - Simple arithmetic: 2 plus 2 is **4**

> These prove I know arithmetic too

- Simple arithmetic: 2 plus 2 is **4**
- Simple arithmetic: 2 plus 3 is **5**
- Simple arithmetic: 3 plus 3 is **~~5~~ [6]**

###These prove I know arithmetic in order
1. Simple arithmetic: 2 plus 2 is **4**
11. Simple arithmetic: 2 plus 3 is **5**
101. Simple arithmetic: 3 plus 3 is **~~5~~ [6]**


##Whole line failures/passes bold the list items, not the list symbol 

* **~~Multiple Assertions 1 is 1 and fails~~**
* **~~Multiple Assertions 1 is 3 and fails~~**
* **Multiple Assertions 1 is 1 and passes**
  - **Multiple Assertions 1 is 1 and passes**
-->
