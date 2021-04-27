/**
 * Configuration options for a single token.  Note that `start` and `end` are combined into a new RegExp, and their flags are combined.  For example, using `/i` on either `start` or `end` is the same as using `/i` on both.
 */
export interface TokenDefinition {
  /** The starting token, either a string or regex. */
  start: string | RegExp,

  /** The ending token, either a string or regex. */
  end: string | RegExp,

  /** A name to identify this token in the `result` array. */
  name?: string,
}

/**
 * Configuration values for creating a tokenizer.
 */
export interface TokenizerConfig {
  /** An array of token definitions. */
  tokens: TokenDefinition[],
}

/**
 * The result of a tokenization.
 */
export interface TokenizationResult {
  /** The original input string that was tokenized. */
  input: string,

  /** The token definition that was used for this tokenization. */
  config: TokenizerConfig,

  /** The part you actually want: the tokenization results! */
  result: TokenResult[],
}

/**
 * The resulting match a single token definition.
 */
export interface TokenResult {
  /** The index into the original source string where the inner content (between `start` and `end`) begins. */
  startIndex: number,
  /** The index into the original source string where the inner content (between `start` and `end`) ends. */
  endIndex: number,
  /** The token definition used to create this result.  Use this to identify results in the `result` array. */
  definition: TokenDefinition,
  /** The content between the `start` and `end` tokens.  For content including `start` and `end`, use `wrappedContent`. */
  content: string,
  /** The matched content including the `start` and `end` tokens.  For content without `start` and `end`, use `content`. */
  wrappedContent: string,
  /** The index into the original source string where the `start` content (between `start` and `end`) begins. */
  wrappedStartIndex: number,
  /** The index into the original source string where the inner content (between `start` and `end`) ends. */
  wrappedEndIndex: number,
}

class Tokenizer {
  #config: TokenizerConfig;

  constructor(config: TokenizerConfig) {
    this.#config = config;
  }

  /**
   * Tokenize a string.
   */
  tokenize(input: string): TokenizationResult {

    const result: TokenResult[] = [];

    for (const token of this.#config.tokens) {
      const reFlags = ["s"];

      if (token.start instanceof RegExp) {
        reFlags.push(token.start.flags);
        token.start = token.start.source;
      }
      if (token.end instanceof RegExp) {
        reFlags.push(token.end.flags);
        token.end = token.end.source;
      }

      if (token.start.length === 0 || token.end.length === 0) {
        throw new Error("token definitions cannot contain a 'start' or 'end' property with zero length");
      }

      const reWrap = new RegExp(`(${token.start})(.*?)(${token.end})`, reFlags.join(""));

      const wrap = reWrap.exec(input);

      if (wrap && wrap.length === 4) {
        result.push(
          {
            startIndex: wrap.index + wrap[1].length,
            endIndex: wrap.index + wrap[1].length + wrap[2].length,
            definition: token,
            content: wrap[2],
            wrappedContent: wrap[0],
            wrappedStartIndex: wrap.index,
            wrappedEndIndex: wrap.index + wrap[0].length,
          }
        );
      }
    }

    return {
      input,
      result,
      config: this.#config,
    };
  }
}

/**
 * Create a reusable tokenizer.  Once created, you can pass input strings into it through its `tokenize` function.
 */
export function createTokenizer(config: TokenizerConfig): Tokenizer {
  return new Tokenizer(config);
}
