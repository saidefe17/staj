import Image, { type ImageProps } from "next/image";
import styles from "./logo.module.css";

type LogoProps = Omit<ImageProps, "src" | "preload" | "loading">;

export function Logo({ className = "", ...rest }: LogoProps) {
  return (
    <>
      {/* eslint-disable-next-line jsx-a11y/alt-text -- alt is required by LogoProps and spread via {...rest} */}
      <Image {...rest} src="/logo.png" className={`${styles.logoDefault} ${className}`.trim()} />
      {/* eslint-disable-next-line jsx-a11y/alt-text -- alt is required by LogoProps and spread via {...rest} */}
      <Image {...rest} src="/logow.png" className={`${styles.logoLight} ${className}`.trim()} />
    </>
  );
}
