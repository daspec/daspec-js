#Numeric Lists can be a parameter for a step

Star Wars has the following episodes:
1. A New Hope
2. The Empire Strikes Back
3. Return of the Jedi

> Example of failure

Star Wars has the following episodes:
1. A New Hope
2. Return of the Jedi
3. Revenge of the Sith

<!--OUTPUT
> **In da spec:** executed: 2, passed: 1, failed: 1

#Numeric Lists can be a parameter for a step

**Star Wars has the following episodes:**
1. [✓] A New Hope
1. [✓] The Empire Strikes Back
1. [✓] Return of the Jedi

> Example of failure

**~~Star Wars has the following episodes:~~**
1. [✓] A New Hope
1. [✓] Return of the Jedi
1. **[–] ~~Revenge of the Sith~~**
1. **[+] The Empire Strikes Back**

-->
