import { Freckle_Face, Oswald } from "next/font/google";
import { AnimatedLogoIcon } from './animated-logo-icon';

const freckleFace = Freckle_Face({
    variable: "--font-freckle-face",
    subsets: ["latin"],
    weight: "400", // Freckle Face possui apenas o peso 400
});

const oswald = Oswald({
    variable: "--font-oswald",
    subsets: ["latin"],
});

type logoSize = "xs" | "sm" | "md" | "lg" | "xl";

interface LogoProps {
    readonly isSquare?: boolean;
    readonly turnOIntoIcon?: boolean;
    readonly size?: logoSize;
}

export function Logo({ isSquare = false, turnOIntoIcon = false, size = "md" }: LogoProps) {
    const sizeClass: Record<logoSize, string> = {
        xs: "scale-50",
        sm: "scale-75",
        md: "",
        lg: "scale-125",
        xl: "scale-150",
    }

    return <h1 className={`text-3xl font-semibold flex items-baseline ${sizeClass[size] || ""} ${isSquare ? "flex-col items-center leading-6" : "gap-1"}`}>
        <span className={`${oswald.className} text-slate-900 dark:text-slate-300`}>
            SOS
        </span>

        <span className={`${freckleFace.className} ${isSquare ? "text-5xl" : "text-4xl"} text-indigo-600 dark:text-indigo-400 flex items-baseline`}>
            Bix{turnOIntoIcon ? <AnimatedLogoIcon /> : "o"}s
        </span>
    </h1>;
}