#ignores blockquotes and headings

## Simple arithmetic: 2 plus 2 is 4

#horizontal lines
***

* * *

*****

- - -

---

===

= = =

> This is to test that blockquotes are

> Simple arithmetic: 2 plus 2 is 4

Simple arithmetic: 2 plus 2 is 4
> This is to test that blockquotes are ignored without a new line
> Simple arithmetic: 2 plus 2 is 4

### Simple arithmetic: 2 plus 2 is 4

#code blocks
	Inline code is ignored too
    Inline code with spaces is ignored also
    Simple arithmetic: 2 plus 2 is 4
	Simple arithmetic: 2 plus 2 is 4

#links are ok in block quotes
> This is [an example] [id] reference-style link.

> This is [an example](http://example.com/ "Title") inline link.

[id]: http://example.com/  "Optional Title Here"

#images are ignored

![Alt text](/path/to/img.jpg)

![Alt text](/path/to/img.jpg "Optional title")


<!--OUTPUT
> **In da spec:** executed: 1, passed: 1

#ignores blockquotes and headings

## Simple arithmetic: 2 plus 2 is 4

#horizontal lines
***

* * *

*****

- - -

---

===

= = =

> This is to test that blockquotes are

> Simple arithmetic: 2 plus 2 is 4

Simple arithmetic: 2 plus 2 is **4**
> This is to test that blockquotes are ignored without a new line
> Simple arithmetic: 2 plus 2 is 4

### Simple arithmetic: 2 plus 2 is 4

#code blocks
	Inline code is ignored too
    Inline code with spaces is ignored also
    Simple arithmetic: 2 plus 2 is 4
	Simple arithmetic: 2 plus 2 is 4

#links are ok in block quotes
> This is [an example] [id] reference-style link.

> This is [an example](http://example.com/ "Title") inline link.

[id]: http://example.com/  "Optional Title Here"

#images are ignored

![Alt text](/path/to/img.jpg)

![Alt text](/path/to/img.jpg "Optional title")
-->
