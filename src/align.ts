export enum Align {
  Left = "left",
  Right = "right",
  Center = "center",
}

export function fromAlignString(value: string): Align {
  switch (value) {
    case "left":
      return Align.Left;
    case "right":
      return Align.Right;
    case "center":
      return Align.Center;
    default:
      throw new Error(`Invalid value: ${value}`);
  }
}
