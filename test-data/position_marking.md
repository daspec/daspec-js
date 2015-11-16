# Match group order

> the correct match groups should be highlighted if a position override is specified 
> even when the values are the same

## Passing

> The first match group should be highlighted 

Order ORD001 has status COMPLETED if service SVC001 has status COMPLETED.

## Failing

> The first match group should be highlighted

Order ORD001 has status COMPLETED if service SVC001 has status FAILED.

<!--OUTPUT
> **In da spec:** executed: 2, passed: 1, failed: 1

# Match group order

> the correct match groups should be highlighted if a position override is specified 
> even when the values are the same

## Passing

> The first match group should be highlighted 

Order ORD001 has status **COMPLETED** if service SVC001 has status COMPLETED.

## Failing

> The first match group should be highlighted

Order ORD001 has status **~~COMPLETED~~ [FAILED]** if service SVC001 has status FAILED.
-->
