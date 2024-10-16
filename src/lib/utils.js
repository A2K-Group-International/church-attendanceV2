import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function getInitial(name) {
  return name?.split(" ").map((word) => word[0])[0];
}