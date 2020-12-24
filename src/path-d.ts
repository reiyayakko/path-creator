
import { Vector } from "./vector";

/**
 * 入力から絶対座標/相対座標を取得。
 *
 * @param pl prev location
 * @param input input location
 * @param rel is input location relative
 */
const getLocation = (pl: number, input: number, rel: boolean):
    readonly [abs: number, rel: number] => (
    [
        rel ? pl + input : input,
        rel ? input : input - pl,
    ]
);

type Pos = (
    | { x?: number, y?: number }
    | { x: number, y: typeof D.any }
    | { x: typeof D.any, y: number }
);

export class D {
    private readonly _path: Vector<string>[] = [];
    private _last(): Vector<string> | null {
        const path = this._path;
        const lastIdx = path.length - 1;
        return path[lastIdx] || null;
    }
    /**
     * L,V,H
     * lineToコマンドに相当します
     * @param pos 
     * @param rel 
     */
    line(pos: Pos, rel=false): this {
        return this;
    }
    /**
     * moveTo|closePath
     * @param pos 
     * @param rel 
     */
    move(pos: Pos & { close?: boolean }, rel=false): this {
        return this;
    }
    curve2(p1: Pos | typeof D.any, cmd: Pos, relative=false): this {
        return this;
    }
    curve3(p1: Pos | typeof D.any, p2: Pos, cmd: Pos, relative=false): this {
        return this;
    }
    generate(): string[] {
        return this._path.map(vector => {
            //
            return "";
        });
    }
    toString(): string {
        return this.generate().join(" ");
    }
    static readonly any = Symbol("D.any");
}
