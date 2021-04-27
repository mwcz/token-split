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
            definition: {name: "test_token", start: "a", end: "c"},
            inner: {
              content: "b",
              startIndex: 1,
              endIndex: 2,
            },
            outer: {
              content: "abc",
              startIndex: 0,
              endIndex: 3,
            },
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
      const input = `\n        <!DOCTYPE html>\n        <html>\n          <head>\n            <!-- ONE -->\n            one\n            <!-- /ONE -->\n          </head>\n          <body>\n            <!-- TWO -->\n            two\n            <!-- /TWO -->\n            <!-- THREE -->\n            three\n            <!-- /THREE -->\n          </body>\n        </html>\n      `;

      const output = tok.tokenize(input);

      expect(output).toStrictEqual({
        input,
        config: tokConfig,
        result: [
          {
            definition: {name: "one", start: "<!-- ONE -->", end: "<!-- /ONE -->"},
            inner: {
              content: "\n            one\n            ",
              startIndex: 81,
              endIndex: 110,
            },
            outer: {
              content: "<!-- ONE -->\n            one\n            <!-- /ONE -->",
              startIndex: 69,
              endIndex: 123,
            },
          }, {
            definition: {name: "two", start: "<!-- TWO -->", end: "<!-- /TWO -->"},
            inner: {
              content: "\n            two\n            ",
              startIndex: 183,
              endIndex: 212,
            },
            outer: {
              content: "<!-- TWO -->\n            two\n            <!-- /TWO -->",
              startIndex: 171,
              endIndex: 225,
            },
          }, {
            definition: {name: "three", start: "<!-- THREE -->", end: "<!-- /THREE -->"},
            inner: {
              content: "\n            three\n            ",
              startIndex: 252,
              endIndex: 283,
            },
            outer: {
              content: "<!-- THREE -->\n            three\n            <!-- /THREE -->",
              startIndex: 238,
              endIndex: 298,
            },
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
            definition: {name: "regex_tokens", start: "a.b", end: "d.e"},
            inner: {
              content: "c",
              startIndex: 3,
              endIndex: 4,
            },
            outer: {
              content: "axbcdxe",
              startIndex: 0,
              endIndex: 7,
            },
          }
        ]
      });

    });

    test("handles no results", () => {

      const tokConfig = {
        tokens: [
          {name: "cant", start: /a/, end: /b/},
          {name: "wont", start: /x/, end: /y/},
          {name: "never_will", start: /z/, end: /x/},
        ]
      };

      const tok = createTokenizer(tokConfig);
      const output = tok.tokenize("xz");

      expect(output).toStrictEqual({
        input: "xz",
        config: tokConfig,
        result: [
        ]
      });

    });

    test("rejects empty token definitions", () => {

      const tokConfig = {
        tokens: [
          {name: "no_empty_start_str", start: "", end: "b"},
          {name: "no_empty_end_str", start: "a", end: ""},
          {name: "no_empty_both_str", start: "", end: ""},
          {name: "no_empty_start_regex", start: new RegExp(""), end: new RegExp("b")},
          {name: "no_empty_end_regex", start: new RegExp("a"), end: new RegExp("")},
          {name: "no_empty_both_regex", start: new RegExp(""), end: new RegExp("")},
        ]
      };

      const tok = createTokenizer(tokConfig);

      expect(() => tok.tokenize("xz")).toThrowError();

    });

  });

});
