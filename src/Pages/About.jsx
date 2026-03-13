import React from "react";
import { Users, ShieldCheck, TrendingUp, Globe } from "lucide-react";

export default function About() {
  return (
    <div className="bg-gray-50 text-gray-800 min-h-screen">

      {/* HERO SECTION */}
      <section className="bg-secondary px-6 py-20 text-center">
        <h1 className="text-4xl md:text-5xl font-bold">
          About LandInvest
        </h1>
        <p className="mt-6 max-w-2xl mx-auto text-gray-600">
          We are redefining land ownership by making it accessible,
          transparent, and collaborative for everyone.
        </p>
      </section>

      {/* OUR STORY */}
      <section className="max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className="text-3xl font-bold mb-6">Our Story</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            In many parts of Cameroon, land ownership remains one of the most
            powerful ways to build long-term wealth. Yet, high costs and limited
            access prevent many individuals from participating.
          </p>
          <p className="text-gray-600 leading-relaxed">
            LandInvest was created to solve this problem — by allowing people to
            invest together through fractional ownership. Instead of one person
            buying land alone, many investors can collectively own verified
            land projects.
          </p>
        </div>

        <div className="bg-white p-10 rounded-2xl shadow-lg">
          <h3 className="text-xl font-semibold mb-4 text-primary">
            Our Mission
          </h3>
          <p className="text-gray-600 leading-relaxed">
            To democratize land investment by lowering entry barriers and
            creating opportunities for collective ownership.
          </p>

          <h3 className="text-xl font-semibold mt-8 mb-4 text-primary">
            Our Vision
          </h3>
          <p className="text-gray-600 leading-relaxed">
            To become Africa’s leading platform for fractional real estate
            investment, empowering individuals to grow wealth together.
          </p>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-white py-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-16">
            How LandInvest Works
          </h2>

          <div className="grid md:grid-cols-4 gap-10">
            {[
              {
                icon: <Globe className="w-8 h-8 text-blue-800" />,
                title: "Verified Projects",
                desc: "Land projects are carefully reviewed and verified before listing."
              },
              {
                icon: <Users className="w-8 h-8 text-blue-800" />,
                title: "Fractional Shares",
                desc: "Each land project is divided into affordable fractions."
              },
              {
                icon: <ShieldCheck className="w-8 h-8 text-blue-800" />,
                title: "Secure Coordination",
                desc: "Investors commit to fractions transparently and securely."
              },
              {
                icon: <TrendingUp className="w-8 h-8 text-blue-800" />,
                title: "Collective Growth",
                desc: "Participants benefit from appreciation or resale opportunities."
              },
            ].map((item, index) => (
              <div key={index} className="bg-gray-50 p-8 rounded-xl shadow-sm hover:shadow-md transition">
                <div className="flex justify-center mb-4">{item.icon}</div>
                <h4 className="font-semibold text-lg mb-3">{item.title}</h4>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CORE VALUES */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-12">
            Our Core Values
          </h2>

          <div className="grid md:grid-cols-3 gap-10">
            <div>
              <h4 className="font-semibold text-lg mb-3">Transparency</h4>
              <p className="text-gray-600">
                Clear documentation, visible funding progress, and open
                communication with investors.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Accessibility</h4>
              <p className="text-gray-600">
                Lowering financial barriers so more individuals can participate
                in land investment.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Community</h4>
              <p className="text-gray-600">
                Building a network of investors who grow wealth together.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section className="bg-secondary py-20 text-center px-6">
        <h2 className="text-3xl font-bold mb-6">
          Ready to Invest Together?
        </h2>
        <p className="text-gray-600 mb-8 max-w-xl mx-auto">
          Join LandInvest today and become part of a smarter way to own land.
        </p>

        <a
          href="/investments"
          className="bg-blue-800 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition"
        >
          Explore Investment Opportunities
        </a>
      </section>
    </div>
  );
}