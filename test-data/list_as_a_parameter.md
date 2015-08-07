# Lists can be a parameter for a step

Star Wars has the following episodes:
* A New Hope
* The Empire Strikes Back
* Return of the Jedi

> Example of failure

Star Wars has the following episodes:
* A New Hope
* Return of the Jedi
* Revenge of the Sith

> items are trimmed to avoid blank space problems (note the Return of the Jedi has a space at the end here)

Star Wars has the following episodes:
* A New Hope
*   The Empire Strikes Back
* Return of the Jedi  

<!--OUTPUT
> **In da spec:** executed: 3, passed: 2, failed: 1

# Lists can be a parameter for a step

**Star Wars has the following episodes:**
* [✓] A New Hope
* [✓] The Empire Strikes Back
* [✓] Return of the Jedi

> Example of failure

**~~Star Wars has the following episodes:~~**
* [✓] A New Hope
* [✓] Return of the Jedi
* **[–] ~~Revenge of the Sith~~**
* **[+] The Empire Strikes Back**

> items are trimmed to avoid blank space problems (note the Return of the Jedi has a space at the end here)

**Star Wars has the following episodes:**
* [✓] A New Hope
* [✓] The Empire Strikes Back
* [✓] Return of the Jedi
-->
