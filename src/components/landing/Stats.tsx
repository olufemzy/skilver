const HIGHLIGHTS = [
  {
    label: "Verified Talent",
    value: "Trusted",
  },
  {
    label: "Service Categories",
    value: "Diverse",
  },
  {
    label: "Student & Professional Talent",
    value: "Available",
  },
  {
    label: "Built for Nigeria",
    value: "Local",
  },
];

export default function Stats() {
  return (
    <section className="bg-white border-b border-gray-100">
      <div className="container-app py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {HIGHLIGHTS.map((item) => (
            <div key={item.label} className="text-center">
              <p className="font-display text-2xl md:text-3xl text-primary-900 mb-1">
                {item.value}
              </p>

              <p className="text-sm text-gray-500">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}