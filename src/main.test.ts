import {test, expect, describe} from "@jest/globals";
import {createTokenizer} from "./main"

describe("the createTokenizer function", () => {

  test("exists", () => {
    expect(createTokenizer).toBeInstanceOf(Function);
  });

  describe("tokenize function", () => {
    test("returns expected values", () => {

      const tokConfig = {
        tokens: [
          {name: "test_token", start: "a", end: "c"}
        ]
      };

      const tok = createTokenizer(tokConfig);
      const output = tok.tokenize("abc");

      expect(output).toStrictEqual({
        input: "abc",
        config: tokConfig,
        result: [
          {
            name: "test_token",
            content: "b",
            startIndex: 1,
            endIndex: 2,
            wrappedContent: "abc",
            wrappedStartIndex: 0,
            wrappedEndIndex: 3,
          }
        ]
      });

    });

    test("handles multiline strings", () => {

      const tokConfig = {
        tokens: [
          {name: "one", start: "<!-- ONE -->", end: "<!-- /ONE -->"},
          {name: "two", start: "<!-- TWO -->", end: "<!-- /TWO -->"},
          {name: "three", start: "<!-- THREE -->", end: "<!-- /THREE -->"},
        ]
      };

      const tok = createTokenizer(tokConfig);
      const input = `
        <!DOCTYPE html>
        <html>
          <head>
            <!-- ONE -->
            one
            <!-- /ONE -->
          </head>
          <body>
            <!-- TWO -->
            two
            <!-- /TWO -->
            <!-- THREE -->
            three
            <!-- /THREE -->
          </body>
        </html>
      `;

      const output = tok.tokenize(input);

      expect(output).toStrictEqual({
        input,
        config: tokConfig,
        result: [
          {
            name: "one",
            content: "\n            one\n            ",
            startIndex: 81,
            endIndex: 110,
            wrappedContent: "<!-- ONE -->\n            one\n            <!-- /ONE -->",
            wrappedStartIndex: 69,
            wrappedEndIndex: 123,
          }, {
            name: "two",
            content: "\n            two\n            ",
            startIndex: 183,
            endIndex: 212,
            wrappedContent: "<!-- TWO -->\n            two\n            <!-- /TWO -->",
            wrappedStartIndex: 171,
            wrappedEndIndex: 225,
          }, {
            name: "three",
            content: "\n            three\n            ",
            startIndex: 252,
            endIndex: 283,
            wrappedContent: "<!-- THREE -->\n            three\n            <!-- /THREE -->",
            wrappedStartIndex: 238,
            wrappedEndIndex: 298,
          }
        ]
      });

    });

    test("accepts regex characters", () => {

      const tokConfig = {
        tokens: [
          {name: "regex_tokens", start: /a.b/, end: /d.e/}
        ]
      };

      const tok = createTokenizer(tokConfig);
      const output = tok.tokenize("axbcdxe");

      expect(output).toStrictEqual({
        input: "axbcdxe",
        config: tokConfig,
        result: [
          {
            name: "regex_tokens",
            content: "c",
            startIndex: 3,
            endIndex: 4,
            wrappedContent: "axbcdxe",
            wrappedStartIndex: 0,
            wrappedEndIndex: 7,
          }
        ]
      });

    });

  });

});
