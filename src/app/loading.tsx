"use client"

import { motion, Variants } from "motion/react"

function LoadingJumpingDots() {
    const dotVariants: Variants = {
        jump: {
            transform: "translateY(-30px)",
            transition: {
                duration: 0.5,
                repeat: Infinity,
                repeatType: "mirror",
                ease: "easeInOut",
            },
        },
    }

    return (
        <motion.div
            animate="jump"
            transition={{ staggerChildren: -0.1, staggerDirection: -1 }}
            className="flex items-center justify-center gap-2"
        >
            <motion.div className="w-4 h-4 bg-indigo-600 dark:bg-indigo-400 block will-change-transform rounded-full" variants={dotVariants} />
            <motion.div className="w-4 h-4 bg-indigo-600 dark:bg-indigo-400 block will-change-transform rounded-full" variants={dotVariants} />
            <motion.div className="w-4 h-4 bg-indigo-600 dark:bg-indigo-400 block will-change-transform rounded-full" variants={dotVariants} />
        </motion.div>
    )
}

export default LoadingJumpingDots