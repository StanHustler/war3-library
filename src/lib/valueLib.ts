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

    static colorFA2Rgb = (arr: number[]) => {
        let ar =  this.colorFA2IA(arr);
        return `rgb(${ar[0]},${ar[1]},${ar[2]})`;
    }

    static colorRgb2FA = (rgb: string) => {
        let arr = rgb.slice(4, -1).split(",");
        return this.colorIA2FA(arr.map((n) => {
            return parseInt(n);
        }));
    }

}

