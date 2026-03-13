import React from "react";
import { Phone, Mail, MapPin, Clock } from "lucide-react";

export default function Contact() {
  return (
    <div className="bg-gray-50 min-h-screen text-gray-800">

      {/* HERO SECTION */}
      <section className="bg-secondary py-20 px-6 text-center">
        <h1 className="text-4xl md:text-5xl font-bold">
          Contact & Customer Support
        </h1>
        <p className="mt-6 max-w-2xl mx-auto text-gray-600">
          Have questions about fractional land investment? 
          Our team is ready to assist you.
        </p>
      </section>

      {/* CONTACT CONTENT */}
      <section className="max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-12">

        {/* CONTACT FORM */}
        <div className="bg-white p-10 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold mb-6">
            Send Us a Message
          </h2>

          <form className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Full Name
              </label>
              <input
                type="text"
                placeholder="Enter your full name"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-700"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Email Address
              </label>
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-700"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Subject
              </label>
              <input
                type="text"
                placeholder="What is this about?"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-700"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Message
              </label>
              <textarea
                rows="5"
                placeholder="Write your message..."
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-700"
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-800 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition"
            >
              Send Message
            </button>
          </form>
        </div>

        {/* CONTACT INFO */}
        <div className="space-y-8">

          <div className="bg-white p-8 rounded-2xl shadow-md">
            <h3 className="text-xl font-semibold mb-6">
              Contact Information
            </h3>

            <div className="space-y-4 text-sm text-gray-600">

              <div className="flex items-center gap-4">
                <Phone className="text-blue-800" />
                <span>+237 6XX XXX XXX</span>
              </div>

              <div className="flex items-center gap-4">
                <Mail className="text-blue-800" />
                <span>info@landinvest.cm</span>
              </div>

              <div className="flex items-center gap-4">
                <MapPin className="text-blue-800" />
                <span>Douala, Cameroon</span>
              </div>

              <div className="flex items-center gap-4">
                <Clock className="text-blue-800" />
                <span>Mon - Fri | 8:00 AM - 5:00 PM</span>
              </div>

            </div>
          </div>

          {/* CUSTOMER SERVICE NOTE */}
          <div className="bg-blue-50 p-8 rounded-2xl">
            <h3 className="text-lg font-semibold mb-4 text-blue-800">
              Investor Support
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              For investment-related inquiries, documentation verification,
              or payment confirmation, please include your registered email
              and project name for faster assistance.
            </p>
          </div>

        </div>
      </section>

      {/* FAQ PREVIEW */}
      <section className="bg-white py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-12">
            Frequently Asked Questions
          </h2>

          <div className="space-y-8 text-left">

            <div>
              <h4 className="font-semibold mb-2">
                How secure are LandInvest projects?
              </h4>
              <p className="text-gray-600 text-sm">
                All listed projects undergo verification and documentation
                review before being made available to investors.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">
                What is fractional land ownership?
              </h4>
              <p className="text-gray-600 text-sm">
                It allows multiple investors to collectively own shares of a
                land property, lowering individual investment costs.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">
                How do I track my investment?
              </h4>
              <p className="text-gray-600 text-sm">
                Once registered, you can view your fractions and project
                updates inside your investor dashboard.
              </p>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}