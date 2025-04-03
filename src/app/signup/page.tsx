'use client';

import React, {
  useState,
  Suspense,
  useEffect,
  FormEvent,
  useCallback,
} from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Layout from '@/components/Layout';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    const message = searchParams.get('message');
    const emailParam = searchParams.get('email');
    if (emailParam) setEmail(emailParam);
  }, [searchParams]);

  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setError(null);
      setLoading(true);

      try {
        let selectedPains = [];
        try {
          const savedSelections = localStorage.getItem('visitorSelections');
          selectedPains = savedSelections ? JSON.parse(savedSelections) : [];
        } catch (localStorageError) {
          console.error('Error reading from localStorage:', localStorageError);
          setError('Could not retrieve previous selections. Please try again.');
          setLoading(false);
          return;
        }

        const { user, error: signUpError } = await signUp(
          email,
          password,
          nickname,
          selectedPains
        );

        if (signUpError?.message === 'User already exists') {
          setRedirecting(true);
          router.push(
            '/signin?message=Please sign in with your existing account&email=' +
              encodeURIComponent(email)
          );
          return;
        } else if (signUpError) {
          setError(signUpError.message);
          setLoading(false);
          return;
        }

        if (user) {
          localStorage.removeItem('visitorSelections'); // Clear localStorage after successful signup
          setRedirecting(true);
          router.push('/#community-section');
        }
      } catch (err) {
        setError('An unexpected error occurred. Please try again.');
      } finally {
        if (!redirecting) {
          setLoading(false);
        }
      }
    },
    [email, password, nickname, signUp, router]
  );

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Layout>
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white font-display">
                Join{' '}
                <span className="text-primary-500">
                  eon <span className="text-primary-500">financial</span>
                </span>
              </h2>
              <p className="mt-2 text-white">
                Create an account to join our community
              </p>
            </div>

            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="nickname"
                    className="block text-sm font-medium text-white mb-1"
                  >
                    Nickname
                  </label>
                  <input
                    id="nickname"
                    name="nickname"
                    type="text"
                    required
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-primary-600 focus:border-primary-600 focus:z-10 sm:text-sm bg-white shadow-sm"
                    placeholder="Choose a nickname"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-white mb-1"
                  >
                    Email address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-primary-600 focus:border-primary-600 focus:z-10 sm:text-sm bg-white shadow-sm"
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-white mb-1"
                  >
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-primary-600 focus:border-primary-600 focus:z-10 sm:text-sm bg-white shadow-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                        <ArrowRight
                          className="h-5 w-5 text-primary-500 group-hover:text-primary-400"
                          aria-hidden="true"
                        />
                      </span>
                      Sign up
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Layout>
    </Suspense>
  );
}
