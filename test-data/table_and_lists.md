# Table and lists in the same spec

These are the Star Wars Films:
| A New Hope              | 1976 |
| The Empire Strikes Back | 1979 |
| The Return of the Jedi  | 1983 |

* Simple arithmetic: 2 plus 2 is 4
* Simple arithmetic: 2 plus 3 is 5
* Simple arithmetic: 3 plus 3 is 5

Star Wars has the following episodes:
* A New Hope
* The Empire Strikes Back
* Return of the Jedi

| Positional Check episodes of Star Wars | Year of release |
|----------------------------------------|-----------------|
| A New Hope | 1976 |
| The Empire Strikes Back | 1979 |
| The Return of the Jedi | 1990 |

Star Wars has the following episodes:
* A New Hope
* The Empire Strikes Back
* Return of the Jedi

* Simple arithmetic: 2 plus 2 is 4
* Simple arithmetic: 2 plus 3 is 5
* Simple arithmetic: 3 plus 3 is 5

These are the Star Wars Films:
| A New Hope              | 1976 |
| The Empire Strikes Back | 1979 |
| The Return of the Jedi  | 1983 |

Check Star Wars Films are:
| Title                   | Year |
|-------------------------|------|
| A New Hope              | 1976 |
| The Return of the Jedi  | 1983 |
| Phantom Menace          | 1999 |

| Positional Check episodes of Star Wars | Year of release |
|----------------------------------------|-----------------|
| A New Hope | 1976 |
| The Empire Strikes Back | 1979 |
| The Return of the Jedi | 1990 |

<!--OUTPUT
> **In da spec:** executed: 15, passed: 10, failed: 5

# Table and lists in the same spec

These are the Star Wars Films:
| A New Hope              | 1976 |
| The Empire Strikes Back | 1979 |
| The Return of the Jedi  | 1983 |

* Simple arithmetic: 2 plus 2 is **4**
* Simple arithmetic: 2 plus 3 is **5**
* Simple arithmetic: 3 plus 3 is **~~5~~ [6]**

**Star Wars has the following episodes:**
* [✓] A New Hope
* [✓] The Empire Strikes Back
* [✓] Return of the Jedi

| Positional Check episodes of Star Wars | Year of release     |
|----------------------------------------|---------------------|
| A New Hope                             | **1976**            |
| The Empire Strikes Back                | **1979**            |
| The Return of the Jedi                 | **~~1990~~ [1983]** |

**Star Wars has the following episodes:**
* [✓] A New Hope
* [✓] The Empire Strikes Back
* [✓] Return of the Jedi

* Simple arithmetic: 2 plus 2 is **4**
* Simple arithmetic: 2 plus 3 is **5**
* Simple arithmetic: 3 plus 3 is **~~5~~ [6]**

These are the Star Wars Films:
| A New Hope              | 1976 |
| The Empire Strikes Back | 1979 |
| The Return of the Jedi  | 1983 |

**~~Check Star Wars Films are:~~**
| ? | Title                       | Year         |
|---|-----------------------------|--------------|
| ✓ | A New Hope                  | 1976         |
| ✓ | The Return of the Jedi      | 1983         |
| – | **~~Phantom Menace~~**      | **~~1999~~** |
| + | **The Empire Strikes Back** | **1979**     |

| Positional Check episodes of Star Wars | Year of release     |
|----------------------------------------|---------------------|
| A New Hope                             | **1976**            |
| The Empire Strikes Back                | **1979**            |
| The Return of the Jedi                 | **~~1990~~ [1983]** |

-->