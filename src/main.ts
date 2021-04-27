/**
 * Configuration options for a single token.  Note that [[start]] and [[end]] are combined into a new RegExp, and their flags are combined.  For example, using `/i` on either [[start]] or [[end]] is the same as using `/i` on both.
 */
export interface TokenDefinition {
  /** The starting token, either a string or regex that is expected to occur in the input string. */
  start: string | RegExp,

  /** The ending token, either a string or regex that is expected to occur in the input string. */
  end: string | RegExp,

  /** A name to identify this token in the [[TokenizationOutput.result]] array. */
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
 * The output of a tokenization.
 */
export interface TokenizationOutput {
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
  /** The token definition used to create this result.  Use this to identify results in the [[TokenizationOutput.result]] array. */
  definition: TokenDefinition,
  /** The token value found _between_ the [[TokenDefinition.start]] and [[TokenDefinition.end]] values that were passed to [[createTokenizer]]. */
  inner: TokenValue,
  outer: TokenValue,
}

/**
 * The resulting match a single token definition.
 */
export interface TokenValue {
  /** The index into the original source string where this token begins. */
  startIndex: number,
  /** The index into the original source string where this token ends. */
  endIndex: number,
  /** The slice of text from the original source string that matched this token. */
  content: string,
}

/**
 * The tokenizer class, pass it a [[TokenizerConfig]] with your token definitions, then run [[tokenize]] on input.  Recommend instantiating it with [[createTokenizer]] but may also be instantiated with `new Tokenizer`.
 */
export class Tokenizer {
  readonly config: TokenizerConfig;

  constructor(config: TokenizerConfig) {
    this.config = config;
  }

  /**
   * Apply the tokenization definitions to an input string.
   */
  tokenize(input: string): TokenizationOutput {

    const result: TokenResult[] = [];

    // TODO move this setup code (everything up to but excluding `exec`) into the constructor
    for (const token of this.config.tokens) {
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
            definition: token,
            inner: {
              startIndex: wrap.index + wrap[1].length,
              endIndex: wrap.index + wrap[1].length + wrap[2].length,
              content: wrap[2],
            },
            outer: {
              content: wrap[0],
              startIndex: wrap.index,
              endIndex: wrap.index + wrap[0].length,
            },
          }
        );
      }
    }

    return {
      input,
      result,
      config: this.config,
    };
  }
}

/**
 * Create a reusable tokenizer.  Once created, you can pass input strings into it through its `tokenize` function.
 */
export function createTokenizer(config: TokenizerConfig): Tokenizer {
  return new Tokenizer(config);
}
