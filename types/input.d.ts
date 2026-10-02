// Ambient declaration for the untyped `input` package (v1).
// It exposes a set of promise-based terminal prompt helpers; each one accepts
// either a plain message string or an options object.
declare module "input" {
  export interface PromptOptions {
    message?: string;
    [key: string]: unknown;
  }

  export type PromptArgument = string | PromptOptions | undefined;

  const input: {
    confirm(message?: PromptArgument): Promise<boolean>;
    text(message?: PromptArgument): Promise<string>;
    password(message?: PromptArgument): Promise<string>;
    select(...args: unknown[]): Promise<unknown>;
    checkboxes(...args: unknown[]): Promise<unknown[]>;
  };

  export default input;
}
