export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="text-center space-y-6">
        <h1 className="text-5xl font-bold tracking-tight text-text-primary">
          EPUB Audiobook Reader
        </h1>
        <p className="text-xl text-text-secondary max-w-md">
          Upload your EPUB files and listen to them as audiobooks with
          text-to-speech.
        </p>
        <div className="pt-4">
          <button className="px-6 py-3 bg-accent text-background font-semibold rounded-lg hover:opacity-90 transition-opacity">
            Get Started
          </button>
        </div>
      </div>
    </main>
  );
}
