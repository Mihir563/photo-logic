'use client'
// pages/pricing.tsx
import React, { useState } from "react";
import {
  Camera,
  Check,
  X,
  MessageSquare,
  Calendar,
  FileText,
  Users,
  HeadphonesIcon,
  CreditCard,
} from "lucide-react";
import Head from "next/head";

interface PricingFeature {
  name: string;
  starter: boolean;
  pro: boolean;
  business: boolean;
  icon: React.ReactNode;
}

const PricingPage: React.FC = () => {
  const [isYearly, setIsYearly] = useState<boolean>(false);

  // Define pricing details
  const pricingDetails = {
    starter: {
      name: "Starter",
      monthlyPrice: 120,
      yearlyPrice: 1000,
      description: "Perfect for beginners building their portfolio",
      ctaText: "Get started for free",
      color: "bg-gradient-to-br from-blue-50 to-indigo-100",
      popular: false,
    },
    pro: {
      name: "Pro",
      monthlyPrice: 250,
      yearlyPrice: 2500,
      description: "For growing photographers ready to scale",
      ctaText: "Book your next client in minutes",
      color: "bg-gradient-to-br from-blue-100 to-indigo-200",
      popular: true,
    },
    business: {
      name: "Business",
      monthlyPrice: 500,
      yearlyPrice: 5000 ,
      description: "For professional studios and teams",
      ctaText: "Turn your passion into profit",
      color: "bg-gradient-to-br from-indigo-100 to-purple-200",
      popular: false,
    },
  };

  // Define features
  const features: PricingFeature[] = [
    {
      name: "Portfolio Website",
      starter: true,
      pro: true,
      business: true,
      icon: <Camera size={18} />,
    },
    {
      name: "Client Booking",
      starter: true,
      pro: true,
      business: true,
      icon: <Calendar size={18} />,
    },
    {
      name: "Booking Limit",
      starter: false,
      pro: true,
      business: true,
      icon: <Calendar size={18} />,
    },
    {
      name: "Contracts & Invoicing",
      starter: false,
      pro: true,
      business: true,
      icon: <FileText size={18} />,
    },
    {
      name: "Real-time Chat",
      starter: false,
      pro: true,
      business: true,
      icon: <MessageSquare size={18} />,
    },
    {
      name: "Smart Shoot Planning",
      starter: false,
      pro: true,
      business: true,
      icon: <Camera size={18} />,
    },
    {
      name: "Team Collaboration",
      starter: false,
      pro: false,
      business: true,
      icon: <Users size={18} />,
    },
    {
      name: "Priority Support",
      starter: false,
      pro: false,
      business: true,
      icon: <HeadphonesIcon size={18} />,
    },
  ];

  // FAQ items
  const faqItems = [
    {
      question: "Can I switch between plans?",
      answer:
        "Yes, you can upgrade or downgrade your plan at any time. Changes will take effect at the start of your next billing cycle.",
    },
    {
      question: "Is there a trial period?",
      answer:
        "Yes, we offer a 14-day free trial for all plans. No credit card required to start.",
    },
    {
      question: "What payment methods do you accept?",
      answer:
        "We accept all major credit cards, PayPal, and bank transfers for annual plans.",
    },
    {
      question: "Can I cancel my subscription?",
      answer:
        "Yes, you can cancel your subscription at any time from your account settings. You'll retain access until the end of your billing period.",
    },
  ];

  return (
    <>
      <Head>
        <title>Pricing | PhotoPro Platform</title>
        <meta
          name="description"
          content="Choose the perfect plan for your photography business"
        />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Background images with overlay */}
        <div className="absolute top-0 right-0 w-1/3 h-1/2 opacity-10 pointer-events-none">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('/images/wedding-blur.jpg')" }}
          ></div>
        </div>
        <div className="absolute bottom-0 left-0 w-1/4 h-1/3 opacity-10 pointer-events-none">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('/images/commercial-blur.jpg')" }}
          ></div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-16 relative z-10">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to grow your photography business, no hidden
              fees.
            </p>
          </div>

          {/* Pricing Toggle */}
          <div className="flex justify-center mb-16">
            <div className="bg-gray-100 p-1 rounded-full inline-flex items-center">
              <button
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                  !isYearly
                    ? "bg-white shadow-md text-gray-900"
                    : "text-gray-600"
                }`}
                onClick={() => setIsYearly(false)}
              >
                Monthly billing
              </button>
              <button
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                  isYearly
                    ? "bg-white shadow-md text-gray-900"
                    : "text-gray-600"
                }`}
                onClick={() => setIsYearly(true)}
              >
                Annual billing
                <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">
                  Save 15%
                </span>
              </button>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {Object.entries(pricingDetails).map(([plan, details]) => (
              <div
                key={plan}
                className={`relative rounded-2xl backdrop-blur-sm bg-white bg-opacity-70 border border-gray-200 overflow-hidden ${
                  details.popular ? "transform md:-translate-y-4" : ""
                }`}
              >
                {details.popular && (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-1 text-sm font-medium rounded-bl-lg">
                    Most Popular
                  </div>
                )}

                <div className={`p-2 ${details.color}`}></div>

                <div className="p-6">
                  <h3 className="text-2xl font-bold text-gray-900">
                    {details.name}
                  </h3>
                  <p className="text-gray-600 mt-2 min-h-12">
                    {details.description}
                  </p>

                  <div className="mt-6">
                    <span className="text-4xl font-bold text-gray-900">
                      ₹{isYearly ? details.yearlyPrice : details.monthlyPrice}
                    </span>
                    <span className="text-gray-600 ml-2">
                      /{isYearly ? "year" : "month"}
                    </span>
                  </div>

                  <button className="mt-6 w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg px-4 py-3 font-medium hover:from-blue-600 hover:to-indigo-700 transition-all shadow-md">
                    {details.ctaText}
                  </button>

                  <div className="mt-8">
                    <p className="text-sm font-semibold text-gray-800 mb-4">
                      What's included:
                    </p>
                    <ul className="space-y-3">
                      {features.map((feature, idx) => {
                        // Check if plan has this feature
                        const hasFeature =
                          plan === "starter"
                            ? feature.starter
                            : plan === "pro"
                            ? feature.pro
                            : feature.business;

                        // Special case for booking limit
                        let featureText = feature.name;
                        if (feature.name === "Booking Limit" && hasFeature) {
                          featureText =
                            plan === "starter"
                              ? "5 bookings/month"
                              : "Unlimited bookings";
                        }

                        return (
                          <li
                            key={idx}
                            className={`flex items-center ${
                              hasFeature ? "text-gray-800" : "text-gray-400"
                            }`}
                          >
                            <span className="mr-2">{feature.icon}</span>
                            <span className="flex-1">{featureText}</span>
                            {hasFeature ? (
                              <Check
                                size={18}
                                className="text-green-500 ml-2"
                              />
                            ) : (
                              <X size={18} className="text-gray-400 ml-2" />
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA Banner */}
          <div className="mt-20 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 md:p-12 text-center text-white shadow-xl">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Start free, no credit card required
            </h2>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Try any plan free for 14 days. Upgrade anytime — no hidden fees.
            </p>
            <button className="bg-white text-indigo-700 px-8 py-3 rounded-lg font-medium hover:bg-blue-50 transition-colors shadow-md inline-flex items-center">
              <CreditCard size={18} className="mr-2" />
              Start your free trial
            </button>
          </div>

          {/* Testimonials Section */}
          <div className="mt-20">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
              Loved by photographers worldwide
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  quote:
                    "This platform transformed my business. I've doubled my bookings since signing up.",
                  name: "Emma Johnson",
                  role: "Wedding Photographer",
                  avatar: "/images/avatar-1.jpg",
                },
                {
                  quote:
                    "The contract features alone are worth the subscription. So much time saved!",
                  name: "Michael Chen",
                  role: "Portrait Photographer",
                  avatar: "/images/avatar-2.jpg",
                },
                {
                  quote:
                    "Clean interface, amazing customer support, and perfect for scaling my studio.",
                  name: "Sarah Williams",
                  role: "Commercial Photographer",
                  avatar: "/images/avatar-3.jpg",
                },
              ].map((testimonial, idx) => (
                <div
                  key={idx}
                  className="bg-white bg-opacity-70 backdrop-blur-sm p-6 rounded-xl shadow-md"
                >
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden mr-4">
                      <div
                        className="w-full h-full bg-cover bg-center"
                        style={{
                          backgroundImage: `url('${testimonial.avatar}')`,
                        }}
                      ></div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {testimonial.name}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-700 italic">"{testimonial.quote}"</p>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-20 max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
              Frequently Asked Questions
            </h2>

            <div className="space-y-4">
              {faqItems.map((item, idx) => (
                <details
                  key={idx}
                  className="bg-white bg-opacity-70 backdrop-blur-sm rounded-lg overflow-hidden shadow-sm border border-gray-100"
                >
                  <summary className="px-6 py-4 cursor-pointer font-medium text-gray-900 flex justify-between items-center">
                    {item.question}
                    <svg
                      className="w-5 h-5 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      ></path>
                    </svg>
                  </summary>
                  <div className="px-6 py-4 border-t border-gray-100">
                    <p className="text-gray-700">{item.answer}</p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </div>

        {/* Footer with light CTA */}
        <div className="bg-gray-50 border-t border-gray-200 mt-20">
          <div className="container mx-auto px-4 py-12 text-center">
            <h3 className="text-xl font-medium text-gray-900 mb-4">
              Ready to elevate your photography business?
            </h3>
            <button className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg px-6 py-3 font-medium hover:from-blue-600 hover:to-indigo-700 transition-all shadow-md">
              Get started today
            </button>
            <p className="text-gray-600 mt-4 text-sm">
              Questions? Contact our team at{" "}
              <a
                href="mailto:hello@photopro.com"
                className="text-blue-600 hover:underline"
              >
                hello@photopro.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default PricingPage;
