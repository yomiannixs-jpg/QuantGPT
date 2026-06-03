export default function Home() {
  const subjects = [
    { title: "Mathematics", mode: "Mathematics" },
    { title: "Statistics", mode: "Statistics" },
    { title: "Finance", mode: "Finance" },
    { title: "Economics", mode: "Economics" },
    { title: "Accounting", mode: "Accounting" },
    { title: "CFA Exam", mode: "CFA Exam" },
    { title: "ICAN Exam", mode: "ICAN Exam" },
    { title: "Actuarial Science", mode: "Actuarial Science" },
    { title: "Physics", mode: "Physics" },
    { title: "Chemistry", mode: "Chemistry" },
    { title: "Engineering", mode: "Engineering" },
    { title: "Computer Science", mode: "Computer Science" },
    { title: "Data Science", mode: "Data Science" },
    { title: "Research Assistant", mode: "Research Assistant" },
    { title: "Research Paper Analysis", mode: "Research Paper Analysis" },
    { title: "Finance Paper Review", mode: "Finance Paper Review" },
    { title: "Economics Paper Review", mode: "Economics Paper Review" },
    { title: "Academic Writing", mode: "Academic Writing" },
    { title: "AI & Machine Learning", mode: "AI & Machine Learning" },
    { title: "Practice Questions", mode: "Practice Questions" },
    { title: "File Analysis", mode: "File Analysis" },
  ];

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="max-w-7xl mx-auto px-5 md:px-8 py-14 md:py-20">
        <div className="mb-12 md:mb-16">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">Quant GPT</h1>

          <p className="text-xl md:text-2xl text-gray-300 max-w-4xl">
            Advanced AI for mathematics, science, engineering, finance,
            economics, accounting, actuarial science, CFA, ICAN, data analysis,
            research, coding and exam preparation.
          </p>

          <div className="mt-8">
            <a
              href="/dashboard"
              className="inline-block bg-blue-600 hover:bg-blue-700 px-7 py-4 rounded-xl text-lg font-semibold"
            >
              Start Using Quant GPT
            </a>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {subjects.map((item) => (
            <a
              key={item.title}
              href={`/dashboard?mode=${encodeURIComponent(item.mode)}`}
              className="bg-gray-900 border border-gray-800 p-6 rounded-2xl hover:border-blue-500 transition block"
            >
              <h2 className="text-xl font-bold mb-3">{item.title}</h2>

              <p className="text-gray-300">
                Open Quant GPT directly in {item.title} mode for learning,
                solving, analysis, review, practice questions, and structured
                explanations.
              </p>
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}
