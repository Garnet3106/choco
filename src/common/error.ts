export class UnexhaustiveError extends Error {
  public constructor() {
    super();
    this.message = 'Unexhaustive case detected in switch statement.';
  }
}
