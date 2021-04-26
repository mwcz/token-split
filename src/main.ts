/**
 * Configuration options for a single token.
 */
export interface TokenConfig {
  start: string | RegExp,
  end: string | RegExp,
  name: string,
}

/**
 * Configuration options for tokenizers.
 */
export interface TokenizerConfig {
  // configuration for the tokens to find
  tokens: TokenConfig[],
}

/**
 * The result of a tokenization.
 */
export interface TokenizerResult {
  input: string, // the original input string
  config: TokenizerConfig, // the configuration that was used for this tokenization
  result: TokenResult[],
}

export interface TokenResult {
  startIndex: number,
  endIndex: number,
  name: string,
  config?: TokenizerConfig,
  content: string,
  wrappedContent: string,
  wrappedStartIndex: number,
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
  tokenize(input: string): TokenizerResult {

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

      const reWrap = new RegExp(`(${token.start})(.*?)(${token.end})`, reFlags.join(""));

      const wrap = reWrap.exec(input);

      if (wrap && wrap[0]) {
        result.push(
          {
            startIndex: wrap.index + wrap[1].length,
            endIndex: wrap.index + wrap[1].length + wrap[2].length,
            name: token.name,
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

export function createTokenizer(config: TokenizerConfig): Tokenizer {
  return new Tokenizer(config);
}
