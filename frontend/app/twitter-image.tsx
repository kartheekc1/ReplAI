// Twitter / X uses the same image dimensions as Open Graph (1200×630).
// We just re-export so we have one source of truth.
// Served at:  https://getreplai.in/twitter-image
export { default, runtime, alt, size, contentType } from "./opengraph-image";
