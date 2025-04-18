import type { ImageWidget } from "apps/admin/widgets.ts";
import Image from "apps/website/components/Image.tsx";

import process from 'node:process'

function currentPlatform(): string {
  let os = null;

  switch (process.platform) {
    case 'android':
      switch (process.arch) {
        case 'arm':
          return 'android-arm-eabi';
        case 'arm64':
          return 'android-arm64';
      }
      os = 'Android';
      break;

    case 'win32':
      switch (process.arch) {
        case 'x64':
          return 'win32-x64-msvc'
        case 'arm64':
          return 'win32-arm64-msvc';
        case 'ia32':
          return 'win32-ia32-msvc';
      }
      os = 'Windows';
      break;

    case 'darwin':
      switch (process.arch) {
        case 'x64':
          return 'darwin-x64';
        case 'arm64':
          return 'darwin-arm64';
      }
      os = 'macOS';
      break;

    case 'linux':
      switch (process.arch) {
        case 'x64':
        case 'arm64':
          return isGlibc()
            ? `linux-${process.arch}-gnu`
            : `linux-${process.arch}-musl`;
        case 'arm':
          return 'linux-arm-gnueabihf';
      }
      os = 'Linux';
      break;

    case 'freebsd':
      if (process.arch === 'x64') {
        return 'freebsd-x64';
      }
      os = 'FreeBSD';
      break;
  }

  return `unsupported: os=${os} process.platform=${process.platform} process.arch=${process.arch}`
}

function isGlibc(): boolean {
  // Cast to unknown to work around a bug in the type definition:
  // https://github.com/DefinitelyTyped/DefinitelyTyped/issues/40140
  const report: unknown = process.report?.getReport();

  if ((typeof report !== 'object') || !report || (!('header' in report))) {
    return false;
  }

  const header = report.header;

  return (typeof header === 'object') &&
    !!header &&
    ('glibcVersionRuntime' in header);
}

export interface CTA {
  id?: string;
  href: string;
  text: string;
  outline?: boolean;
}

export interface Props {
  /**
   * @format rich-text
   * @default Click here to tweak this text however you want.
   */
  title?: string;
  description?: string;
  image?: ImageWidget;
  placement?: "left" | "right";
  cta?: CTA[];
}

const PLACEMENT = {
  left: "flex-col text-left lg:flex-row-reverse",
  right: "flex-col text-left lg:flex-row",
};

export default function HeroFlats({
  title = "Click here to tweak this text however you want.",
  description = "This text is entirely editable, tailor it freely.",
  image,
  placement = "left",
  cta,
}: Props) {
  return (
    <div>
      <div class="flex flex-col gap-8 items-center mx-auto">
        <div
          class={`flex w-full xl:container xl:mx-auto py-20 mx-5 md:mx-10 z-10 ${
            image
              ? PLACEMENT[placement]
              : "flex-col items-center justify-center text-center"
          } lg:pt-36 lg:pb-20 gap-12 md:gap-20 items-center`}
        >
          {image && (
            <Image
              width={640}
              class="lg:w-1/2 object-fit w-full"
              sizes="(max-width: 640px) 100vw, 30vw"
              src={image}
              alt={image}
                 decoding="async"
              loading="lazy"
            />
          )}
          <div
            class={`mx-6 lg:mx-auto lg:w-full space-y-4 gap-4 ${
              image
                ? "lg:w-1/2 lg:max-w-xl"
                : "flex flex-col items-center justify-center lg:max-w-3xl"
            }`}
          >
            <div
              class="font-medium inline-block leading-[100%] lg:text-[90px] text-4xl tracking-[-2.4px]"
              dangerouslySetInnerHTML={{
                __html: title,
              }}
            >
            </div>
            <p class="leading-[150%] md:text-md text-lg">
              {description}<br/>
              Deno:{Deno.version.deno}<br/>
              DenoUA: {navigator.userAgent}<br/>
              Platform: {currentPlatform()}
            </p>
            {cta && cta.length > 0 &&
              (
                <div class="flex gap-3 items-center lg:pt-20">
                  {cta?.map((item) => (
                    <a
                      key={item?.id}
                      id={item?.id}
                      href={item?.href}
                      target={item?.href.includes("http") ? "_blank" : "_self"}
                      class={`font-normal btn btn-primary ${
                        item.outline && "btn-outline"
                      }`}
                    >
                      {item?.text}
                    </a>
                  ))}
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}
