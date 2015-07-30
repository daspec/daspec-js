#Tables as a set of assertions

These are the Star Wars Films:
| Title | Year |
|-------|------|
| A New Hope | 1976 |
| The Empire Strikes Back | 1979 |
| The Return of the Jedi | 1983 |

> When a positional assertion is made, the column is marked as passed or failed

| Star Wars episode | Year of release |
|-------|------|
| A New Hope             | 1976 |
| The Empire Strikes Back | 1979 |
| The Return of the Jedi | 1990 |

> When a non positional failure happens, the whole row fails
> In this example, a non positional assertion is made that The phantom menace exists

| Star Wars episode | Year of release |
|-------|------|
| A New Hope | 1976 |
| The Phantom Menace | 1983 |

> When the heading contains an assertion that fails, all rows will fail non positionally
> In this example, an asserion will check that there is a series called Star Trek

| Star Tek Episode | Year of release |
|-------|------|
| A New Hope | 1976 |
| The Empire Strikes Back | 1979 |

| Star Wars episode | Year of release |
|-------|------|
| A New Hope | 1976 |
| The Phantom Menace | 1983 |

> The example above is a separate block from the previous table

<!--OUTPUT
These are the Star Wars Films:
| Title | Year |
|-------|------|
| A New Hope | 1976 |
| The Empire Strikes Back | 1979 |
| The Return of the Jedi | 1983 |

> When a positional assertion is made, the column is marked as passed or failed

| Star Wars episode | Year of release |
|-------------------|-----------------|
| A New Hope | **1976** |
| The Empire Strikes Back | **1979** |
| The Return of the Jedi | **~~1990~~ [1979]** |


> When a non positional failure happens, the whole row fails
> In this example, a non positional assertion is made that The phantom menace exists

| Star Wars episode | Year of release |
|-------------------|-----------------|
| A New Hope | **1976** |
| **~~The Phantom Menace~~** | **~~1983~~** |


> When the heading contains an assertion that fails, all rows will fail non positionally
> In this example, an asserion will check that there is a series called Star Trek

| Star Trek Episode | Year of release |
|-------------------|-----------------|
| **~~A New Hope~~** | **~~1976~~** |
| **~~The Empire Strikes Back~~** | **~~1979~~** |

| Star Wars episode | Year of release |
|-------------------|-----------------|
| A New Hope | **1976** |
| **~~The Phantom Menace~~** | **~~1983~~** |

> The example above is a separate block from the previous table

-->