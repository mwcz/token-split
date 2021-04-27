# token-slice

[![Build and test status](https://github.com/redhataccess/token-slice/workflows/Lint%20and%20test/badge.svg)](https://github.com/redhataccess/token-slice/actions?query=workflow%3A%22Build+and+test%22)

token-slice is a small library for extracting text wrapped with arbitrary tokens.  Please do not use it for parsing HTML.

```js
import { createTokenSlicer } from "token-slice";

const tok = createTokenSlicer({
  tokens: [
    {
      name: "token1",
      start: "a",
      end: "c",
    }
  ]
});

const output = tok.tokenize("abc");

// output equals:
{
  input: "abc",
  config: /* copy of the config object passed into createTokenSlicer */,
  result: [
    {
      definition: { name: "test_token", start: "a", end: "c" },
      content: "b",
      startIndex: 1,
      endIndex: 2,
      wrappedContent: "abc",
      wrappedStartIndex: 0,
      wrappedEndIndex: 3,
    }
  ]
}
```
## References

This repo was set up based on the template outlined in [Starting a TypeScript Project in 2021](https://www.metachris.com/2021/03/bootstrapping-a-typescript-node.js-project/), recommend checking out the post!
