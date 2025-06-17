export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-center mb-8">
          Case Study Builder
        </h1>
        <div className="text-center">
          <a
            href="/wizard"
            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Crea il tuo Case Study
          </a>
        </div>
      </div>
    </main>
  );
}