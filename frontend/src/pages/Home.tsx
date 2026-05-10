import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle, Clock, Shield } from "lucide-react";
import FlightIllustration from "../assets/illustrations/flight-illustration.svg";
import Hero from "../components/Hero";
import Card from "../components/Card";
import Button from "../components/Button";
import TestimonialCard from "../components/TestimonialCard";
import { useTheme } from "../contexts/ThemeContext";

export default function Home() {
  const { theme } = useTheme();

  return (
    <div style={{ backgroundColor: "var(--bg)", color: "var(--text)" }}>
      {/* Hero Section */}
      <section className="py-8 md:py-16 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <div
            className="rounded-2xl md:rounded-3xl p-6 md:p-12 text-white"
            style={{ backgroundColor: "var(--accent)" }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div>
                <div className="mb-4 md:mb-5">
                  <Hero />
                </div>

                <p className="text-base md:text-lg leading-relaxed opacity-95 mb-6 md:mb-8">
                  FlyEasyNG helps you request, track, and manage flight bookings
                  with speed and confidence.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                  <Link to="/book">
                    <Button
                      variant="outline"
                      className="hover:shadow-lg transition-all"
                      style={{
                        backgroundColor: "white",
                        color: "var(--accent)",
                      }}
                    >
                      <span className="flex items-center gap-2">
                        Book Flight
                        <ArrowRight size={16} />
                      </span>
                    </Button>
                  </Link>
                  <Link to="/track-request">
                    <Button
                      variant="ghost"
                      className="px-6 py-2 hover:bg-white/10 transition-all border border-white/50"
                      style={{ color: "white" }}
                    >
                      Track Request
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="hidden md:flex items-center justify-center">
                <img
                  src={FlightIllustration}
                  alt="Flight illustration"
                  loading="lazy"
                  className="w-full max-w-sm h-auto"
                  style={{
                    filter: theme === "dark" ? "brightness(0.95)" : "none",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-12 md:py-16 px-4 md:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 items-center">
            <div>
              <h2
                className="text-2xl md:text-3xl font-bold mb-3 md:mb-4 leading-tight"
                style={{ color: "var(--text)" }}
              >
                About FlyEasyNG
              </h2>
              <p
                className="text-sm md:text-base leading-relaxed mb-5 md:mb-6"
                style={{ color: "var(--muted)" }}
              >
                We simplify travel planning for individuals and businesses by
                managing booking requests, finding suitable routes, and ensuring
                updates are easy to track from start to finish. Our mission is
                to make flight booking stress-free and transparent.
              </p>
              <Link to="/book">
                <Button variant="primary" className="gap-2">
                  Get Started
                  <ArrowRight size={16} />
                </Button>
              </Link>
            </div>

            <div
              className="rounded-2xl p-8 md:p-10 h-56 md:h-60 flex items-center justify-center"
              style={{
                backgroundColor: "var(--card-bg)",
                borderColor: "var(--border)",
                border: "1px solid",
              }}
            >
              <div className="text-center">
                <div className="text-4xl md:text-5xl mb-2">✈️</div>
                <p style={{ color: "var(--muted)" }} className="text-sm">
                  Smooth Flights, Every Time
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section
        className="py-12 md:py-16 px-4 md:px-6"
        style={{
          backgroundColor: theme === "dark" ? "var(--card-bg)" : "var(--bg)",
        }}
      >
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8 md:mb-10">
            <h2
              className="text-2xl md:text-3xl font-bold mb-2 md:mb-3 leading-tight"
              style={{ color: "var(--text)" }}
            >
              Our Services
            </h2>
            <p
              className="text-sm md:text-base max-w-2xl mx-auto"
              style={{ color: "var(--muted)" }}
            >
              Everything you need to book and manage your flights efficiently.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {/* Service 1 */}
            <Card className="flex flex-col h-full hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4 mb-4">
                <div
                  className="p-3 rounded-lg flex-shrink-0"
                  style={{ backgroundColor: "var(--accent)" }}
                >
                  <Shield size={24} className="text-white" />
                </div>
                <div className="flex-1">
                  <h3
                    className="font-semibold text-base md:text-lg"
                    style={{ color: "var(--text)" }}
                  >
                    Flight Booking Assistance
                  </h3>
                </div>
              </div>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "var(--muted)" }}
              >
                Request support for local and international flights with
                practical recommendations tailored to your needs.
              </p>
            </Card>

            {/* Service 2 */}
            <Card className="flex flex-col h-full hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4 mb-4">
                <div
                  className="p-3 rounded-lg flex-shrink-0"
                  style={{ backgroundColor: "var(--accent)" }}
                >
                  <CheckCircle size={24} className="text-white" />
                </div>
                <div className="flex-1">
                  <h3
                    className="font-semibold text-base md:text-lg"
                    style={{ color: "var(--text)" }}
                  >
                    Custom Travel Requests
                  </h3>
                </div>
              </div>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "var(--muted)" }}
              >
                Submit specific dates, routes, and budget targets for a
                personalized booking experience.
              </p>
            </Card>

            {/* Service 3 */}
            <Card className="flex flex-col h-full hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4 mb-4">
                <div
                  className="p-3 rounded-lg flex-shrink-0"
                  style={{ backgroundColor: "var(--accent)" }}
                >
                  <Clock size={24} className="text-white" />
                </div>
                <div className="flex-1">
                  <h3
                    className="font-semibold text-base md:text-lg"
                    style={{ color: "var(--text)" }}
                  >
                    Admin Processing System
                  </h3>
                </div>
              </div>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "var(--muted)" }}
              >
                Admin workflows keep requests organized, updated, and resolved
                in a transparent queue.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-12 md:py-16 px-4 md:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8 md:mb-10">
            <h2
              className="text-2xl md:text-3xl font-bold mb-2 md:mb-3 leading-tight"
              style={{ color: "var(--text)" }}
            >
              What Our Users Say
            </h2>
            <p
              className="text-sm md:text-base max-w-2xl mx-auto"
              style={{ color: "var(--muted)" }}
            >
              Hear from people who have successfully booked flights using
              FlyEasyNG.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            <TestimonialCard
              name="Adaeze Okafor"
              role="Travel Manager"
              location="Lagos"
              message="Fast response and clear updates. I tracked my request and got my ticket on time. Highly professional service!"
              avatarInitials="AO"
            />
            <TestimonialCard
              name="Tunde Oluwasegun"
              role="Business Executive"
              location="Abuja"
              message="The process is simple and reliable. I used it for a multi-city trip and it was completely stress-free."
              avatarInitials="TO"
            />
            <TestimonialCard
              name="Chika Ndubisi"
              role="Freelance Consultant"
              location="Port Harcourt"
              message="Great support team and clean interface. Highly recommended for anyone booking flights frequently."
              avatarInitials="CN"
            />
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section
        className="py-12 md:py-16 px-4 md:px-6"
        style={{
          backgroundColor: theme === "dark" ? "var(--card-bg)" : "var(--bg)",
        }}
      >
        <div className="max-w-2xl mx-auto">
          <Card>
            <h2
              className="text-2xl md:text-3xl font-bold mb-2 md:mb-3 leading-tight"
              style={{ color: "var(--text)" }}
            >
              Get In Touch
            </h2>
            <p
              className="text-sm md:text-base mb-6"
              style={{ color: "var(--muted)" }}
            >
              Have questions or need support? We'd love to hear from you. Send
              us a message and we'll respond as soon as possible.
            </p>

            <form className="space-y-5">
              <div>
                <label
                  className="block text-sm font-semibold mb-2"
                  style={{ color: "var(--text)" }}
                >
                  Email
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="w-full px-4 py-2 md:py-2.5 rounded-lg border text-sm md:text-base focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: "var(--input-bg)",
                    borderColor: "var(--border)",
                    color: "var(--input-text)",
                    outlineColor: "var(--accent)",
                  }}
                />
              </div>

              <div>
                <label
                  className="block text-sm font-semibold mb-2"
                  style={{ color: "var(--text)" }}
                >
                  Message
                </label>
                <textarea
                  placeholder="Your message..."
                  rows={5}
                  className="w-full px-4 py-2 md:py-2.5 rounded-lg border text-sm md:text-base focus:outline-none focus:ring-2 resize-none"
                  style={{
                    backgroundColor: "var(--input-bg)",
                    borderColor: "var(--border)",
                    color: "var(--input-text)",
                    outlineColor: "var(--accent)",
                  }}
                />
              </div>

              <Button variant="primary" className="w-full gap-2">
                Send Message
                <ArrowRight size={16} />
              </Button>
            </form>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="py-8 px-4 md:px-6 border-t"
        style={{ borderColor: "var(--border)" }}
      >
        <div className="max-w-5xl mx-auto">
          <div
            className="text-center text-xs md:text-sm"
            style={{ color: "var(--muted)" }}
          >
            <p>&copy; 2024 FlyEasyNG. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
