import { ParticleField } from "./particle-field";

const ASSETS = "/brand/hero";

/**
 * The divineskins.gg hero backdrop (its HeroBackground and ParticleField): the
 * art in black and white, a darkening gradient, a purple glow behind the
 * heading, light rays and drifting particles. Drawn on the art's 1920 x 933
 * canvas: the viewport width from md up, a fixed 1920px on mobile with the
 * sides cropped. The mask fades its foot, since the blended layers don't all
 * reach the page color there. Starts under the transparent header. Minimal has
 * no brand decoration, so it draws none of this; `.divine-hero-shade` and the
 * particles follow the other modes.
 */
export function HeroBackground() {
  return (
    <div aria-hidden className="[.minimal_&]:hidden">
      <div className="pointer-events-none absolute top-[-96px] left-1/2 -z-10 aspect-[1920/933] w-[1920px] max-w-none -translate-x-1/2 overflow-hidden [mask-image:linear-gradient(to_bottom,#000_72%,transparent_100%)] md:w-screen">
        {/* eslint-disable-next-line @next/next/no-img-element -- full-bleed art at its display size; next/image adds nothing here */}
        <img
          src={`${ASSETS}/image-bg.webp`}
          alt=""
          width={1920}
          height={933}
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 size-full max-w-none object-cover grayscale"
        />
        <div className="divine-hero-shade absolute inset-0" />
        <div className="light:mix-blend-normal absolute top-[20.69%] left-[32.66%] h-[24.65%] w-[34.69%] rounded-[50%] bg-[linear-gradient(180deg,#783CB5_0%,rgba(120,60,181,0)_100%)] opacity-10 mix-blend-plus-lighter blur-[29.05px]" />
        {/* eslint-disable-next-line @next/next/no-img-element -- full-bleed art at its display size; next/image adds nothing here */}
        <img
          src={`${ASSETS}/rays.webp`}
          alt=""
          width={1920}
          height={933}
          decoding="async"
          className="absolute inset-0 size-full max-w-none opacity-50 mix-blend-soft-light"
        />
      </div>
      <div className="light:hidden pointer-events-none absolute inset-x-0 top-[-96px] -z-10 h-[700px] overflow-hidden md:h-[48.59vw]">
        <ParticleField />
      </div>
    </div>
  );
}
