import { Field, Bool, Struct, Provable } from 'o1js'

/**
 * A 240 bit unsigned integer with values ranging from 0 to 1,1579208923731619542357098500869e+77.
 */
export class UInt240 extends Struct ({
    value: Field,
}) {
  constructor(value: Field) {
      super({ value })
      this.value = value
  }

  static NUM_BITS = 240
  
  /**
   * Static method to create a {@link UInt240} with value `0`.
   */
  static get zero() {
    return new UInt240(Field(0));
  }
  /**
   * Static method to create a {@link UInt240} with value `1`.
   */
  static get one() {
    return new UInt240(Field(1));
  }
  /**
   * Turns the {@link UInt240} into a string.
   * @returns
   */
  toString() {
    return this.value.toString();
  }
  /**
   * Turns the {@link UInt240} into a {@link BigInt}.
   * @returns
   */
  toBigInt() {
    return this.value.toBigInt();
  }
  
  /**
   * Turns the {@link UInt240} into a {@link Field}.
   * @returns
   */
  toField() {
    return this.value
  }

  private static checkConstant(x: Field) {
    if (!x.isConstant()) return x;
    let xBig = x.toBigInt();
    if (xBig < 0n || xBig >= 1n << BigInt(this.NUM_BITS)) {
      throw Error(
        `UInt240: Expected number between 0 and 2^240 - 1, got ${xBig}`
      );
    }
    return x;
  }

  // this checks the range if the argument is a constant
  /**
   * Creates a new {@link UInt240}.
   */
  static from(x: UInt240 | Field | number | string | bigint) {
    if (x instanceof UInt240) x = x.value;
    return new this(this.checkConstant(Field(x)));
  }

  /**
   * Creates a {@link UInt240} with a value of 18,446,744,073,709,551,615.
   */
  static MAXINT() {
    return new UInt240(Field((1n << 240n) - 1n));
  }

  /**
   * Integer division with remainder.
   *
   * `x.divMod(y)` returns the quotient and the remainder.
   */
  divMod(y: UInt240 | number | string) {
    let x = this.value;
    let y_ = UInt240.from(y).value;

    if (this.value.isConstant() && y_.isConstant()) {
      let xn = x.toBigInt();
      let yn = y_.toBigInt();
      let q = xn / yn;
      let r = xn - q * yn;
      return {
        quotient: new UInt240(Field(q)),
        rest: new UInt240(Field(r)),
      };
    }

    y_ = y_.seal();

    let q = Provable.witness(
      Field,
      () => new Field(x.toBigInt() / y_.toBigInt())
    );

    q.rangeCheckHelper(UInt240.NUM_BITS).assertEquals(q);

    // TODO: Could be a bit more efficient
    let r = x.sub(q.mul(y_)).seal();
    r.rangeCheckHelper(UInt240.NUM_BITS).assertEquals(r);

    r.assertLessThan(y_);

    let r_ = new UInt240(r);
    let q_ = new UInt240(q);

    return { quotient: q_, rest: r_ };
  }

  /**
   * Integer division.
   *
   * `x.div(y)` returns the floor of `x / y`, that is, the greatest
   * `z` such that `z * y <= x`.
   *
   */
  div(y: UInt240 | number) {
    return this.divMod(y).quotient;
  }

  /**
   * Integer remainder.
   *
   * `x.mod(y)` returns the value `z` such that `0 <= z < y` and
   * `x - z` is divisble by `y`.
   */
  mod(y: UInt240 | number) {
    return this.divMod(y).rest;
  }

  /**
   * Multiplication with overflow checking.
   */
  mul(y: UInt240 | number) {
    let z = this.value.mul(UInt240.from(y).value);
    z.rangeCheckHelper(UInt240.NUM_BITS).assertEquals(z);
    return new UInt240(z);
  }

  /**
   * Addition with overflow checking.
   */
  add(y: UInt240 | number) {
    let z = this.value.add(UInt240.from(y).value);
    z.rangeCheckHelper(UInt240.NUM_BITS).assertEquals(z);
    return new UInt240(z);
  }

  /**
   * Subtraction with underflow checking.
   */
  sub(y: UInt240 | number) {
    let z = this.value.sub(UInt240.from(y).value);
    z.rangeCheckHelper(UInt240.NUM_BITS).assertEquals(z);
    return new UInt240(z);
  }
}