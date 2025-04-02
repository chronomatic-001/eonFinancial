'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const pathname = usePathname();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="relative">
        {/* Header */}
        <header className="fixed w-full bg-black/50 backdrop-blur-md z-50 border-b border-white/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <Link href="/" className="flex items-center space-x-2">
                <span className="font-sans font-bold text-4xl text-white tracking-wider">
                  EON
                </span>
              </Link>

              {/* Navigation */}
              <nav className="hidden md:flex items-center space-x-8">
                {[
                  { name: 'Home', href: '/', section: 'hero-section' },
                  {
                    name: 'About',
                    href: '/#about-section',
                    section: 'about-section',
                  },
                  {
                    name: 'Community',
                    href: '/#community-section',
                    section: 'community-section',
                  },
                ].map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={(e) => {
                      if (pathname === '/' && item.section) {
                        e.preventDefault();
                        scrollToSection(item.section);
                      }
                    }}
                    className="text-gray-300 hover:text-primary-400 font-medium transition-colors"
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>

              {/* Auth Actions */}
              <div className="hidden md:flex items-center space-x-4">
                {user ? (
                  <button
                    onClick={handleSignOut}
                    className="flex items-center space-x-2 text-gray-300 hover:text-primary-400 font-medium transition-colors"
                  >
                    <span className="text-primary-400">
                      {user.user_metadata?.nickname}
                    </span>
                    <LogOut className="w-5 h-5" />
                    <span>Sign Out</span>
                  </button>
                ) : (
                  <Link
                    href="/signin"
                    className="text-gray-300 hover:text-primary-400 font-medium transition-colors"
                  >
                    Sign In
                  </Link>
                )}
              </div>

              {/* Mobile Menu Button */}
              <div className="flex items-center space-x-4 md:hidden">
                <button
                  onClick={toggleMenu}
                  className="p-2 rounded-lg text-gray-300 hover:bg-white/10 transition-colors"
                >
                  {isMenuOpen ? (
                    <X className="w-6 h-6" />
                  ) : (
                    <Menu className="w-6 h-6" />
                  )}
                </button>
              </div>

              {/* Mobile Menu */}
              <div
                className={`
                  fixed inset-x-0 top-16 p-4 bg-black/50 backdrop-blur-md border-b border-white/20
                  transform transition-transform duration-300 ease-in-out md:hidden
                  ${isMenuOpen ? 'translate-y-0' : '-translate-y-full'}
                `}
              >
                <nav className="flex flex-col space-y-4">
                  {[
                    { name: 'Home', href: '/', section: 'hero-section' },
                    {
                      name: 'About',
                      href: '/#about-section',
                      section: 'about-section',
                    },
                    {
                      name: 'Community',
                      href: '/#community-section',
                      section: 'community-section',
                    },
                  ].map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={(e) => {
                        setIsMenuOpen(false);
                        if (pathname === '/' && item.section) {
                          e.preventDefault();
                          scrollToSection(item.section);
                        }
                      }}
                      className="text-gray-300 hover:text-primary-400 font-medium transition-colors px-4 py-2 rounded-lg hover:bg-white/10"
                    >
                      {item.name}
                    </Link>
                  ))}

                  <div className="pt-4 border-t border-white/20">
                    {user ? (
                      <button
                        onClick={() => {
                          handleSignOut();
                          setIsMenuOpen(false);
                        }}
                        className="flex items-center space-x-4 w-full px-4 py-2 text-gray-300 hover:text-primary-400 font-medium transition-colors rounded-lg hover:bg-white/10"
                      >
                        <span className="text-primary-400">
                          {user.user_metadata?.nickname}
                        </span>
                        <LogOut className="w-5 h-5" />
                        <span>Sign Out</span>
                      </button>
                    ) : (
                      <Link
                        href="/signin"
                        onClick={() => setIsMenuOpen(false)}
                        className="block px-4 py-2 text-gray-300 hover:text-primary-400 font-medium transition-colors rounded-lg hover:bg-white/10"
                      >
                        Sign In
                      </Link>
                    )}
                  </div>
                </nav>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="pt-16">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
