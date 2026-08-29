"use client";

import React from "react";
import { CraftLoader } from "./craft-loader";
import { motion } from "framer-motion";

interface FullPageLoaderProps {
  text?: string;
  minHeight?: string;
}

export function FullPageLoader({
  text = "Loading Layerat directory...",
  minHeight = "min-h-[calc(100vh-12rem)]",
}: FullPageLoaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`flex w-full items-center justify-center p-8 ${minHeight}`}
    >
      <CraftLoader size="lg" text={text} />
    </motion.div>
  );
}
