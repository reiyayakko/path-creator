
import { D } from "./path-d";

const isLowerCase = (char: string) => char === char.toLowerCase();

const NumberRegEx = /\d|./;

/**
 * 
 * @param dString
 * @example
 * D.fromString("M0 0 L10 20 L10 0 Z");
 */
export const fromString = (dString: string): D => {
    const d = new D;

    let i = 0;
    while(i < dString.length) {
        const char = dString[i++];
        switch(char.toUpperCase()) {
        // line
        case "L":
            d.line({ x: readNumber(), y: readNumber() }, isLowerCase(char));
            break;
        case "V":
            d.line({ x: 0, y: readNumber() }, isLowerCase(char));
            break;
        case "H":
            d.line({ x: readNumber(), y: 0 }, isLowerCase(char));
            break;
        // curve
        case "C":
            d.curve3(
                { x: readNumber(), y: readNumber() },
                { x: readNumber(), y: readNumber() },
                { x: readNumber(), y: readNumber() },
                isLowerCase(char)
            );
            break;
        case "S":
            d.curve3(
                D.any,
                { x: readNumber(), y: readNumber() },
                { x: readNumber(), y: readNumber() },
                isLowerCase(char)
            );
            break;
        case "Q":
            d.curve2(
                { x: readNumber(), y: readNumber() },
                { x: readNumber(), y: readNumber() },
                isLowerCase(char)
            );
            break;
        case "T":
            d.curve2(
                D.any,
                { x: readNumber(), y: readNumber() },
                isLowerCase(char)
            );
            break;
        // move
        case "M":
            d.move({ x: readNumber(), y: readNumber() }, isLowerCase(char));
            break;
        case "Z":
            d.move({ close: true });
        }
    }

    return d;

    function readNumber() {
        while(!NumberRegEx.test(dString[i])) i++;

        let curChar: string, result = "";

        while(NumberRegEx.test(curChar = dString[i])) {
            i++;
            result += curChar;
        }

        return Number(result);
    }
};