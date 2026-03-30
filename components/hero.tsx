export function Hero() {
  return (
    <div className="flex flex-col items-center gap-16">
      {/* TODO: replace with your app's title and description */}
      <h1 className="text-center text-4xl leading-tight! font-bold lg:text-5xl">My App</h1>
      <p className="text-muted-foreground mx-auto max-w-xl text-center text-lg">
        A production-ready full-stack boilerplate with auth, database, testing, and PWA support built on Next.js, Supabase, and Drizzle ORM. Replace this with your app description.
      </p>
      <div className="via-foreground/10 my-8 w-full bg-linear-to-r from-transparent to-transparent p-px" />
    </div>
  );
}
