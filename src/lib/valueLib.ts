export class ValueLib {
    static ColorF2I = (n :number) => {
        return Math.floor(n * 255);
    }

    static ColorI2F = (n :number) => {
        return (n / 255);
    }

    static colorFA2IA = (arr: number[]) => {
        return arr.map((n) => {
            return this.ColorF2I(n);
        })
    }

    static colorIA2FA = (arr: number[]) => {
        return arr.map((n) => {
            return this.ColorI2F(n);
        })
    }

    static colorFA2Rgba = (arr: number[], a: number) => {
        let ar =  this.colorFA2IA(arr);
        return `rgba(${ar[0]},${ar[1]},${ar[2]},${this.alphaI2F(a)})`;
    }

    static alphaF2I = (n: number) => {
        return Math.floor(n * 255);
    }

    static alphaI2F = (n: number) => {
        return (n / 255).toFixed(2);
    }

    static rgba2Ar = (rgba: string) => {
        let arr = rgba.slice(5, -1).split(",");

        return {
            rgb: arr.slice(0, 3).map((i) => {
                return this.ColorI2F(parseInt(i))
            }),
            a: this.alphaF2I(parseFloat(arr[3]))
        };
    }
    static rgb2hex = (rgb: number[]) => {
        let r = rgb[0].toString(16);
        let g = rgb[1].toString(16);
        let b = rgb[2].toString(16);
        return "#" + r + g + b;
    }

    static hex2rgb = (hex: string) => {
        let r = parseInt(hex.slice(1,3), 16);
        let g = parseInt(hex.slice(3,5), 16);
        let b = parseInt(hex.slice(5,7), 16);
        return [r,g,b];
    }
}

