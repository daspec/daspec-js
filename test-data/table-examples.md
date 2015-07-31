# Table with no column titles as a parameter

These are the Star Wars Films:
| A new Hope              | 1976 |
| The Empire Strikes Back | 1979 |
| The Return of the Jedi  | 1983 |

In total there a 4 Star Wars Films

# Table as a parameter

These are the Star Wars Films:
| Title                  | Year |
|------------------------|------|
| A new Hope             | 1976 |
|The Empire Strikes Back | 1979 |
| The Return of the Jedi | 1983 |

In total there a 3 Star Wars Films

> comparing items as lists

Good Star Wars Films are:
| Title                   | Year |
|-------------------------|------|
| Phantom Menace          | 1999 |
| A new Hope              | 1976 |
| The Return of the Jedi  | 1983 |

> comparing whole tables takes titles into consideration - in this example reversed order

Check Star Wars Films are:
| Year | Title                   |
|------|-------------------------|
| 1999 | Phantom Menace          |
| 1976 | A new Hope              |
| 1983 | The Return of the Jedi  |

<!--OUTPUT
> **In da spec:** executed: 4, passed: 1, failed: 3

# Table with no column titles as a parameter

These are the Star Wars Films:
| A new Hope              | 1976 |
| The Empire Strikes Back | 1979 |
| The Return of the Jedi  | 1983 |

In total there a **~~4~~ [3]** Star Wars Films

# Table as a parameter

These are the Star Wars Films:
| Title                   | Year |
|-------------------------|------|
| A new Hope              | 1976 |
| The Empire Strikes Back | 1979 |
| The Return of the Jedi  | 1983 |

In total there a **3** Star Wars Films

> comparing items as lists

**~~Good Star Wars Films are:~~**
|   | Title                       | Year         |
|---|-----------------------------|--------------|
| ✓ | A new Hope                  | 1976         |
| ✓ | The Return of the Jedi      | 1983         |
| – | **~~Phantom Menace~~**      | **~~1999~~** |
| + | **The Empire Strikes Back** | **1979**     |

> comparing whole tables takes titles into consideration - in this example reversed order

**~~Check Star Wars Films are:~~**
|   | Year         | Title                       |
|---|--------------|-----------------------------|
| ✓ | 1976         | A new Hope                  |
| ✓ | 1983         | The Return of the Jedi      |
| – | **~~1999~~** | **~~Phantom Menace~~**      |
| + | **1979**     | **The Empire Strikes Back** |

-->
