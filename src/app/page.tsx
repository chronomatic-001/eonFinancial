'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeftRight,
  LineChart,
  PiggyBank,
  Bitcoin,
  Users2,
  Coins,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { stats, sparkSavings } from '@/data/constants';
import Layout from '@/components/Layout';
import SparkSelection from '@/components/SparkSelection';
import Community from '@/components/Community';

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();
  const [visitorPains, setVisitorPains] = useState<number[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('visitorSelections');
    if (saved) {
      setVisitorPains(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem('visitorSelections');
      if (saved) {
        setVisitorPains(JSON.parse(saved));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    if (user && user.user_metadata?.selectedPains?.length === 0) {
      const painPointsSection = document.getElementById('pain-points');
      if (painPointsSection) {
        painPointsSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [user]);

  const handleJoinWaitlist = () => {
    router.push('/signup');
  };

  return (
    <Layout>
      <div className="relative">
        <main className="pt-16">
          {/* Hero Section */}
          <div
            id="hero-section"
            className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 pb-12 sm:pb-16 text-center"
          >
            <div className="relative z-10 max-w-7xl mx-auto">
              <div className="text-2xl font-bold mb-4 text-white">
                Are You in Charge of Your Wealth?
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl mb-12 font-display">
                We Spark your <span className="text-primary-400">Savings</span>
              </h1>

              <div className="mt-6 max-w-2xl mx-auto text-xl space-y-4">
                <span className="text-gray-200 block">
                  We understand Savings can be boring and challenging!
                </span>
                <span className="text-gray-200 block">
                  What features will spark your{' '}
                  <span className="text-white font-bold">Savings</span>?
                </span>
              </div>

              <div className="mt-12 flex justify-center space-x-6">
                <div className="flex flex-col items-center space-y-6">
                  <button
                    onClick={() => {
                      const sparkSavingsSection =
                        document.getElementById('spark-savings');
                      if (sparkSavingsSection) {
                        sparkSavingsSection.scrollIntoView({
                          behavior: 'smooth',
                        });
                      }
                    }}
                    className="group flex items-center gap-2 px-8 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-all duration-300 shadow-lg shadow-primary-600/20 hover:shadow-primary-600/30 hover:scale-105 text-lg"
                  >
                    <span>Select Spark</span>
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </button>
                </div>
              </div>

              {/* Sliding Text */}
              <div className="relative w-1/2 mx-auto overflow-hidden py-8 mt-24">
                <div className="flex">
                  <div className="flex animate-marquee">
                    <div className="flex items-center space-x-8">
                      <div className="flex items-center">
                        <ArrowLeftRight
                          className="h-5 w-5 text-primary-400"
                          strokeWidth={1.5}
                        />
                      </div>

                      <div className="flex items-center">
                        <LineChart
                          className="h-5 w-5 text-white"
                          strokeWidth={1.5}
                        />
                      </div>

                      <div className="flex items-center">
                        <PiggyBank
                          className="h-5 w-5 text-primary-400"
                          strokeWidth={1.5}
                        />
                      </div>
                      <div className="flex items-center">
                        <Bitcoin
                          className="h-5 w-5 text-white"
                          strokeWidth={1.5}
                        />
                      </div>
                      <div className="flex items-center">
                        <Coins
                          className="h-5 w-5 text-primary-400"
                          strokeWidth={1.5}
                        />
                      </div>
                      <div className="flex items-center">
                        <Users2
                          className="h-5 w-5 text-white"
                          strokeWidth={1.5}
                        />
                      </div>
                    </div>
                    <div className="flex items-center space-x-8">
                      <div className="flex items-center">
                        <ArrowLeftRight
                          className="h-5 w-5 text-primary-400"
                          strokeWidth={1.5}
                        />
                      </div>
                      <div className="flex items-center">
                        <LineChart
                          className="h-5 w-5 text-white"
                          strokeWidth={1.5}
                        />
                      </div>
                      <div className="flex items-center">
                        <PiggyBank
                          className="h-5 w-5 text-primary-400"
                          strokeWidth={1.5}
                        />
                      </div>
                      <div className="flex items-center">
                        <Bitcoin
                          className="h-5 w-5 text-white"
                          strokeWidth={1.5}
                        />
                      </div>
                      <div className="flex items-center">
                        <Coins
                          className="h-5 w-5 text-primary-400"
                          strokeWidth={1.5}
                        />
                      </div>
                      <div className="flex items-center">
                        <Users2
                          className="h-5 w-5 text-white"
                          strokeWidth={1.5}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Proof Stats */}
              <div className="mt-12 sm:mt-16 border-t border-gray-100/20 pt-8">
                <dl className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-3">
                  {stats.map((stat) => (
                    <div
                      key={stat.id}
                      className="mx-auto flex max-w-xs flex-col gap-y-2"
                    >
                      <dt className="text-base leading-7 text-gray-300 flex items-center justify-center gap-2">
                        <stat.icon className="h-5 w-5 text-primary-400" />
                        {stat.name}
                      </dt>
                      <dd className="text-2xl font-bold tracking-tight text-white font-display text-center">
                        {stat.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </div>

          {/* About Section */}
          <div
            id="about-section"
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24"
          >
            <div className="text-center mb-16">
              <h1 className="text-4xl font-bold text-white mb-6 font-display">
                We Proactively{' '}
                <span className="text-primary-400">Empower Your Savings!</span>
              </h1>
            </div>

            <div className="max-w-3xl mx-auto">
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-12 shadow-xl border border-white/20">
                <div className="prose prose-lg mx-auto">
                  <div className="space-y-12">
                    <div>
                      <h2 className="text-2xl font-semibold text-white mb-4">
                        Our Mission
                      </h2>
                      <p className="text-gray-200 leading-relaxed">
                        At{' '}
                        <span className="font-bold text-primary-400">
                          eon financial
                        </span>
                        , our mission is to transform the savings experience,
                        making it engaging and empowering for everyone. We
                        believe that saving money shouldn't be a struggle;
                        instead, it should be a seamless journey towards
                        financial stability and growth.
                      </p>
                    </div>

                    <div>
                      <h2 className="text-2xl font-semibold text-white mb-4">
                        Your Voice Matters
                      </h2>
                      <p className="text-gray-200 leading-relaxed">
                        We know that every individual has unique financial
                        challenges and aspirations. That's why we encourage you
                        to share your thoughts and experiences with us. Your
                        insights are crucial in helping us design features and
                        tools that genuinely meet your needs.
                      </p>
                    </div>

                    <div>
                      <h2 className="text-2xl font-semibold text-white mb-4">
                        Join the Movement
                      </h2>
                      <p className="text-gray-200 leading-relaxed">
                        Become a part of the{' '}
                        <span className="font-bold text-primary-400">
                          eon financial
                        </span>{' '}
                        community as we revolutionize the way people save.
                        Together, we'll develop strategies that truly reflect
                        your priorities and enable you to cultivate your wealth
                        efficiently.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Spark Selection Section */}
          <div
            id="spark-savings"
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16"
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white font-display">
                Sparks
              </h2>
              <div className="mt-4">
                <p className="text-lg text-gray-200">
                  Select up to 2 sparks you want us to build
                </p>
                {user && (
                  <p className="mt-2 text-sm text-primary-400 font-medium">
                    Click "Update Sparks" after making your selection
                  </p>
                )}
              </div>
            </div>

            <SparkSelection />

            {!user && visitorPains.length > 0 && (
              <div className="mt-8 text-center">
                <button
                  onClick={handleJoinWaitlist}
                  className="mt-6 bg-primary-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-primary-700 transition-all duration-300 font-display group hover:scale-105 shadow-xl shadow-primary-600/20 hover:shadow-primary-600/30 flex items-center mx-auto space-x-2"
                >
                  <span>Join Waitlist</span>
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            )}
          </div>

          {/* Community Section */}
          <Community />
        </main>

        {/* Footer */}
        <footer className="mt-16 border-t border-white/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">
                  About eon
                </h3>
                <p className="text-gray-300">
                  Empowering your financial journey through innovative savings
                  solutions.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">
                  Quick Links
                </h3>
                <ul className="space-y-2">
                  <li>
                    <button
                      onClick={() => {
                        const aboutSection =
                          document.getElementById('about-section');
                        if (aboutSection)
                          aboutSection.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="text-gray-300 hover:text-primary-400 transition-colors"
                    >
                      About Us
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => {
                        const communitySection =
                          document.getElementById('community-section');
                        if (communitySection)
                          communitySection.scrollIntoView({
                            behavior: 'smooth',
                          });
                      }}
                      className="text-gray-300 hover:text-primary-400 transition-colors"
                    >
                      Community
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={handleJoinWaitlist}
                      className="text-gray-300 hover:text-primary-400 transition-colors"
                    >
                      Join Waitlist
                    </button>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">
                  Contact
                </h3>
                <p className="text-gray-300">
                  Get in touch? Reach out at contact@eonfinancial.co
                </p>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-white/20">
              <p className="text-center text-gray-300">
                © {new Date().getFullYear()} eon financial. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </Layout>
  );
}
