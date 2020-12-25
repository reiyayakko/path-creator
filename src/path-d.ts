
import { Vector, Vector2DWithD, Command } from "./vector";

type StrictVector<T=string> = Extract<
    | Vector<"origin">
    | Vector<"line">
    | Vector<"move">
    | Vector<"close">
    | Vector<"curve2", { p1: Vector2DWithD }>
    | Vector<"curve3", { p1: Vector2DWithD, p2: Vector2DWithD }>
    , { type: T }
>;

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
    private readonly _path: StrictVector[] = [];
    private _last(): StrictVector {
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
    private _stack<T extends StrictVector["type"]>(item: {
        type: T;
        vector: Vector2DWithD;
        meta?: StrictVector<T>["meta"];
        is: boolean | ((last: Vector<string, unknown>) => boolean);
        getConnectAngle(this: StrictVector<T>): number;
        toCommand(this: StrictVector<T>, prev: StrictVector): Command;
    }): void {
        const { vector, type } = item;
        if(vector.dx === 0 && vector.dy === 0) return;

        const last = this._last();

        if(last
            && last.type === type
            && (typeof item.is === "function" ? item.is(last) : item.is)
        ) last.setVector(vector); else {
            const vec = new Vector(vector, type, item.toCommand, item.getConnectAngle, item.meta || null);
            this._path.push(vec as unknown as StrictVector);
        }
    }
    /**
     * L,V,H
     * lineToコマンドに相当します
     * @param pos 
     * @param rel 
     */
    line(pos: Pos, rel=false): this {
        const vector = this._analyze(pos, rel);

        this._stack({
            type: "line",
            vector,
            is(last) {
                return last.getConnectAngle() === Vector.getAngle(Vector.origin, this.vector);
            },
            getConnectAngle() {
                return Vector.getAngle(Vector.origin, this);
            },
            toCommand() {
                switch(this.getConnectAngle()) {
                case Infinity:
                    return { cmd: "H", 0: [this.x] };
                case 0:
                    return { cmd: "V", 0: [this.y] };
                default:
                    return { cmd: "L", 0: [this.x, this.y] };
                }
            }
        });

        return this;
    }
    /**
     * moveTo|closePath
     * @param pos 
     * @param rel 
     */
    move(pos: Pos & { close?: boolean }, rel=false): this {
        const vector = this._analyze(pos, rel);

        if(pos.close) {
            this._stack({
                type: "close",
                vector: Vector.origin,
                is: true,
                getConnectAngle: () => 0,
                toCommand: () => ({ cmd: "Z" }),
            });
        }

        this._stack({
            type: "move",
            vector,
            is: true,
            getConnectAngle() {
                return Vector.getAngle(Vector.origin, this);
            },
            toCommand() {
                // cmd.meta.z ? "Z" : ""
                return { cmd: "M", 0: [this.x, this.y] };
            }
        });

        return this;
    }
    curve2(p1: Pos | typeof D.any, cmd: Pos, rel=false): this {
        const vec2d = this._analyze(cmd, rel);
        if(p1 === D.any) {
            const last = this._last();
            if(last.type === "curve2") {
                const $p1 = last.meta.p1;
                p1 = {
                    x: last.x + $p1.dx,
                    y: last.y + $p1.dy,
                };
            } else p1 = last;
        }
        const vecP1 = this._analyze(p1, rel);

        this._stack({
            type: "curve2",
            vector: vec2d,
            meta: { p1: vecP1 },
            is: false,
            getConnectAngle() {
                return Vector.getAngle(this.meta.p1, this);
            },
            toCommand(prev): Command {
                if(prev.type === "curve2"
                    && prev.getConnectAngle() === Vector.getAngle(prev, this.meta.p1)
                ) {
                    return { cmd: "T", 0: [this.x, this.y] };
                } else {
                    return {
                        cmd: "Q",
                        0: [this.meta.p1.x, this.meta.p1.y],
                        1: [this.x, this.y],
                    };
                }
            }
        });

        return this;
    }
    curve3(p1: Pos | typeof D.any, p2: Pos, cmd: Pos, rel=false): this {
        const vec2d = this._analyze(cmd, rel);
        if(p1 === D.any) {
            const last = this._last();
            if(last.type === "curve3") {
                const $p2 = last.meta.p2;
                p1 = {
                    x: last.x + $p2.dx,
                    y: last.y + $p2.dy,
                };
            } else p1 = last;
        }
        const vecP1 = this._analyze(p1, rel);
        const vecP2 = this._analyze(p2, rel);

        this._stack({
            type: "curve3",
            vector: vec2d,
            meta: { p1: vecP1, p2: vecP2 },
            is: false,
            getConnectAngle() {
                return Vector.getAngle(this.meta.p2, this);
            },
            toCommand(prev): Command {
                if(prev.type === "curve3"
                    && prev.getConnectAngle() === Vector.getAngle(prev, this.meta.p1)
                ) return {
                    cmd: "S",
                    0: [this.meta.p2.x, this.meta.p2.y],
                    1: [this.x, this.y]
                };
                else return {
                    cmd: "C",
                    0: [this.meta.p1.x, this.meta.p1.y],
                    1: [this.meta.p2.x, this.meta.p2.y],
                    2: [this.x, this.y],
                };
            }
        });

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
