import { Variants } from "framer-motion";

export const MODULES_MOTIONS: Variants = {
    initial: {
        opacity: 0,
        y: -40,
        scale: 0.95,
    },
    animate: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            duration: 0.35,
            ease: [0.25, 0.1, 0.25, 1],
        },
    },
    exit: {
        opacity: 0,
        y: 20,
        scale: 0.98,
        transition: {
            duration: 0.15,
            ease: [0.25, 0.1, 0.25, 1],
        },
    },
};