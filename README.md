# okok

A bare-metal library that allows for Result objects in JavaScript/Typescript.

## Usage

```ts
import {ok, err, Result} from "okok";

function fetchSomething(): Promise<Result> {
  return await fetch('/api/something').then(response => {
    return response.json();
  }).then(response => {
    if (response.data && response.data.id) {
      return ok(response.data);
    }
    return err("Invalid data returned from server");
  }).catch(e => {
    return err(e);
  });
}

// and it can be used as so
const result = await fetchSomething();
if (result.ok) {
  const id = result.data.id;
} else {
  console.log(`There was an error: ${result.error});
}
```

### ok() 

When called, a `Result` object with `ok=true` will be returned.

```ts
// with no data
let okResult = ok();
console.log(okResult.ok); // true

// with data
okResult = ok({ id: "123", name: "foo" });
console.log(okResult.ok); // true
console.log(okResult.data.id); // "123"
console.log(okResult.data.name); // "foo"
```

### err()

When called, a `Result` object with `ok=false` will be returned.

```ts
// with no data
let result = err();
console.log(result.ok); // false

// with data
result = err({ errCode: 123, errMessage: "something broke", context: { customDataRelatedToError: "cool" } });
console.log(result.ok); // false
console.log(result.errCode); // 123
console.log(result.errMessage); // "something broke"
console.log(result.errContext); // { customDataRelatedToError: "cool" }

// with an exception/error
try {
  //...
} catch (e) {
  result = err(e, { errCode: 10 });
  console.log(result.ok); // false
  console.log(result.errCode); // 10 (default is 0)
  console.log(result.errMessage); // (will be inferred from the `e` param)
  console.log(result.errContext); // null 
  console.log(result.errException); // the provided `e` value
}

// other call methods
result = err(10); // result.errCode is 10
result = err("something broke"); // result.errMessage is "something broke"
result = err("something broke", 10); // result.errMessage/result.errCode set
result = err("something broke", 10, { extraData: true }); // result.errMessage/result.errCode/result.errContext set
```

## Helper Functions

```ts
import { isResult, allOk, merge } from "okok";

allOk(results) // true/false if all have ok:true
someOk(results) // true/false if some have ok:true
from(results) // { ok: true/false }

if (isResult(someResult)) {
  console.log(someResult.ok); // true/false
}
```

