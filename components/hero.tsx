import { siteConfig } from "@/lib/config";

export function Hero() {
  return (
    <div className="flex flex-col items-center gap-16">
      <h1 className="text-center text-4xl leading-tight! font-bold lg:text-5xl">{siteConfig.name}</h1>
      <p className="text-muted-foreground mx-auto max-w-xl text-center text-lg">{siteConfig.description}</p>
      <div className="via-foreground/10 my-8 w-full bg-linear-to-r from-transparent to-transparent p-px" />
    </div>
  );
}
