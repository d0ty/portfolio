export enum Align {
  Left = "left",
  Right = "right",
}

export function fromAlignString(value: string): Align {
  switch (value) {
    case "left":
      return Align.Left;
    case "right":
      return Align.Right;
    default:
      throw new Error(`Invalid value: ${value}`);
  }
}
