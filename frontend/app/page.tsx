export default function Home() {
  const subjects = [
    "Mathematics", "Statistics", "Finance", "Economics", "Actuarial Science", "Physics", "Chemistry",
    "Engineering", "Computer Science", "Data Science", "Research", "AI & Machine Learning", "Practice Questions"
  ];

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="max-w-7xl mx-auto px-5 md:px-8 py-14 md:py-20">
        <div className="mb-12 md:mb-16">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">Quant AI</h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-4xl">
            Advanced AI for mathematics, science, engineering, finance, economics, Actuarial Science, data analysis, research, coding and exam preparation.
          </p>
          <div className="mt-8">
            <a href="/dashboard" className="inline-block bg-blue-600 hover:bg-blue-700 px-7 py-4 rounded-xl text-lg font-semibold">
              Start Using Quant AI
            </a>
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {subjects.map((title) => (
            <div key={title} className="bg-gray-900 border border-gray-800 p-6 rounded-2xl hover:border-blue-500 transition">
              <h2 className="text-xl font-bold mb-3">{title}</h2>
              <p className="text-gray-300">Learn, solve, analyze, generate practice questions, and produce structured explanations.</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
