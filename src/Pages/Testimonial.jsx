import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, User } from "lucide-react";

const testimonials = [
  {
    name: "Jean Pierre N.",
    role: "Investor",
    location: "Douala",
    rating: 5,
    message:
      "LandInvest made it possible for me to invest in land without needing millions upfront. The transparency gave me full confidence.",
  },
  {
    name: "Mireille F.",
    role: "Project Owner",
    location: "Buea",
    rating: 5,
    message:
      "Listing my land project here helped me secure funding faster than traditional methods. The investor network is strong.",
  },
  {
    name: "Samuel T.",
    role: "Investor",
    location: "Yaoundé",
    rating: 4,
    message:
      "I started small and now own shares in two land projects. This platform is changing real estate investment in Cameroon.",
  },
];

export default function TestimonialS() {
  const [current, setCurrent] = useState(0);

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % testimonials.length);
  };

  const prevSlide = () => {
    setCurrent((prev) =>
      prev === 0 ? testimonials.length - 1 : prev - 1
    );
  };

  // Auto slide
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen text-gray-800">


      {/* HERO */}
      <section className="text-center px-6 py-16 bg-secondary">
        <h1 className="text-4xl md:text-5xl font-bold">
          What Our Clients Say
        </h1>
        <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
          Real experiences from investors and project owners who trust LandInvest.
        </p>
      </section>

      {/* SLIDING CAROUSEL */}
      <section className="px-6 py-16 relative max-w-3xl mx-auto">
        <div className="overflow-hidden relative">

          {/* Card */}
          <div className="bg-white rounded-2xl shadow-xl p-10 transition-all duration-700 animate-fadeInUp">

            {/* Avatar */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
                <User size={40} className="text-gray-500" />
              </div>
            </div>

            <h3 className="text-center font-semibold text-lg">
              {testimonials[current].name}
            </h3>

            <p className="text-center text-sm text-gray-500 mb-4">
              {testimonials[current].role} • {testimonials[current].location}
            </p>

            <div className="text-center text-yellow-400 mb-4">
              {"★".repeat(testimonials[current].rating)}
              {"☆".repeat(5 - testimonials[current].rating)}
            </div>

            <p className="text-center text-gray-600 leading-relaxed">
              "{testimonials[current].message}"
            </p>
          </div>

          {/* Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 bg-white shadow-md p-2 rounded-full hover:scale-110 transition"
          >
            <ChevronLeft />
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 bg-white shadow-md p-2 rounded-full hover:scale-110 transition"
          >
            <ChevronRight />
          </button>
        </div>

        {/* Dots */}
        <div className="flex justify-center mt-6 gap-2">
          {testimonials.map((_, index) => (
            <div
              key={index}
              onClick={() => setCurrent(index)}
              className={`w-3 h-3 rounded-full cursor-pointer transition ${
                current === index ? "bg-primary" : "bg-gray-300"
              }`}
            ></div>
          ))}
        </div>
      </section>

      {/* SUCCESS STORY SPOTLIGHT */}
      <section className="bg-white py-20 px-6">
        <div className="max-w-5xl mx-auto bg-gray-100 rounded-3xl shadow-xl p-10 grid md:grid-cols-2 gap-10 items-center">

          <div>
            <h2 className="text-3xl font-bold mb-6">
              Success Story Spotlight
            </h2>

            <h3 className="text-xl font-semibold text-primary mb-3">
              From Teacher to Land Investor
            </h3>

            <p className="text-gray-600 leading-relaxed">
              Alice M., a school teacher from Bafoussam, started investing
              small amounts through fractional shares on LandInvest.
              Within two years, she successfully co-owned her first plot of land.
            </p>

            <blockquote className="mt-6 italic text-gray-700 border-l-4 border-primary pl-4">
              "LandInvest changed my financial future. I never thought I could
              afford land ownership this early in life."
            </blockquote>
          </div>

          {/* Faceless Illustration Block */}
          <div className="flex justify-center">
            <div className="w-64 h-64 bg-gray-200 rounded-2xl flex items-center justify-center shadow-inner">
              <User size={80} className="text-gray-400" />
            </div>
          </div>

        </div>
      </section>

      {/* TRUST STATS */}
      <section className="bg-secondary py-16 text-center">
        <h2 className="text-3xl font-semibold mb-10">
          Trusted Across Cameroon
        </h2>

        <div className="grid md:grid-cols-3 gap-10 max-w-4xl mx-auto">
          <div>
            <h3 className="text-3xl font-bold text-primary">250+</h3>
            <p className="mt-2 text-gray-600">Active Investors</p>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-primary">40+</h3>
            <p className="mt-2 text-gray-600">Land Projects Funded</p>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-primary">98%</h3>
            <p className="mt-2 text-gray-600">Client Satisfaction</p>
          </div>
        </div>
      </section>
    </div>
  );
}