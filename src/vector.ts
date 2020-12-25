
type toCommand = (this: Vector<string, unknown>, prev: Vector<string, unknown>) => Command;

export interface Command {
    cmd: string;
    [n: number]: [number, number?];
}

export interface Vector2D {
    x: number;
    y: number;
}
export interface Vector2DWithD extends Vector2D {
    dx: number;
    dy: number;
}

export class Vector<T extends string, M=null> implements Vector2D {
    x!: number;
    y!: number;
    constructor(
        vector: Partial<Vector2D>,
        public readonly type: T,
        public readonly toCommand: toCommand,
        public readonly getConnectAngle: () => number,
        public readonly meta: M,
    ) { this.setVector(vector); }
    setVector(nextVec: Partial<Vector2D>) {
        this.x = Number(nextVec.x) || 0;
        this.y = Number(nextVec.y) || 0;
    }
    static origin = new Vector({ x: 0, y: 0 }, "origin", () => ({ cmd: "" }), () => NaN, null);
    static getAngle(vec1: Vector2D, vec2: Vector2D): number {
        return (vec2.x - vec1.x) / (vec2.y - vec1.y);
    }
}
