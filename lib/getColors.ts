export const getButtonColor = (hex1: string, hex2: string) => {
    const parseHex = (hex: string) => {
        const match = hex.match(/^#?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/);

        if (match) {
            const value = match[1];
            if (value.length === 3) {
                return [
                    parseInt(value[0] + value[0], 16),
                    parseInt(value[1] + value[1], 16),
                    parseInt(value[2] + value[2], 16),
                ];
            } else if (value.length === 6) {
                return [
                    parseInt(value.slice(0, 2), 16),
                    parseInt(value.slice(2, 4), 16),
                    parseInt(value.slice(4, 6), 16),
                ];
            }
        }

        return null;
    };

    const rgbToHSLA = (rgb: number[], alpha: number) => {
        const r = rgb[0] / 255;
        const g = rgb[1] / 255;
        const b = rgb[2] / 255;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l;

        l = (max + min) / 2;

        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

            switch (max) {
                case r:
                    h = (g - b) / d + (g < b ? 6 : 0);
                    break;
                case g:
                    h = (b - r) / d + 2;
                    break;
                case b:
                    h = (r - g) / d + 4;
                    break;
                default:
                    h = (g - b) / d + (g < b ? 6 : 0);
                    break;
            }

            h /= 6;
        }

        return `hsla(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(
            l * 100
        )}%, ${alpha})`;
    };

    const rgb1 = parseHex(hex1);
    const rgb2 = parseHex(hex2);

    if (!rgb1 || !rgb2) {
        console.error('Invalid input colors');
        return null;
    }

    const calculatedColor = [
        Math.round((rgb1[0] + rgb2[0]) / 2),
        Math.round((rgb1[1] + rgb2[1]) / 2),
        Math.round((rgb1[2] + rgb2[2]) / 2),
    ];

    return rgbToHSLA(calculatedColor, 1);
};
