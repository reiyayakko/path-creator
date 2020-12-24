
import { Vector, Vector2DWithD } from "./vector";

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
    private _last(): Vector<string> {
        const path = this._path;
        const lastIdx = path.length - 1;
        return path[lastIdx] || Vector.origin;
    }
    private _analyze(
        input: Pos,
        relative: boolean,
        base=this._last() || Vector.origin
    ): Vector2DWithD {
        if(input.x === D.any) {
            const [y, dy] = getLocation(base.y, input.y, relative);
            const dx = dy * base.getConnectAngle();
            return { x: base.x + dx, dx, y, dy };
        }
        if(input.y === D.any) {
            const [x, dx] = getLocation(base.x, input.x, relative);
            const dy = dx * base.getConnectAngle();
            return { x, dx, y: base.y + dy, dy };
        }
        const [x, dx] = getLocation(base.x, input.x || 0, relative);
        const [y, dy] = getLocation(base.y, input.y || 0, relative);
        return { x, dx, y, dy };
    }
    /**
     * L,V,H
     * lineToコマンドに相当します
     * @param pos 
     * @param rel 
     */
    line(pos: Pos, rel=false): this {
        const vector = this._analyze(pos, rel);

        return this;
    }
    /**
     * moveTo|closePath
     * @param pos 
     * @param rel 
     */
    move(pos: Pos & { close?: boolean }, rel=false): this {
        const vector = this._analyze(pos, rel);

        return this;
    }
    curve2(p1: Pos | typeof D.any, cmd: Pos, rel=false): this {
        const vec2d = this._analyze(cmd, rel);
        const vecP1 = this._analyze(p1, rel);
        
        return this;
    }
    curve3(p1: Pos | typeof D.any, p2: Pos, cmd: Pos, rel=false): this {
        const vec2d = this._analyze(cmd, rel);
        const vecP1 = this._analyze(p1, rel);
        const vecP2 = this._analyze(p2, rel);

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
