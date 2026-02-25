import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../../hooks/useQueries';
import { UserRole } from '../../backend';
import { GraduationCap, MapPin, Phone, Mail, Heart } from 'lucide-react';

export default function Footer() {
  const year = new Date().getFullYear();
  const appId = encodeURIComponent(window.location.hostname || 'university-of-africa-portal');
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const isAuthenticated = !!identity;

  const getPortalPath = (role: 'student' | 'staff' | 'admin' | 'parent') => {
    if (isAuthenticated && userProfile) {
      const roleMap: Record<string, string> = {
        student: '/student',
        staff: '/staff',
        admin: '/admin',
        parent: '/parent',
      };
      return roleMap[role];
    }
    return `/login/${role}`;
  };

  return (
    <footer className="bg-navy text-white/80 border-t border-gold/20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gold/60">
                <img
                  src="/assets/generated/university-crest.dim_256x256.png"
                  alt="University Crest"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <div className="text-gold font-serif font-bold text-sm">University of Africa</div>
                <div className="text-white/50 text-xs">Toru-Orua</div>
              </div>
            </div>
            <p className="text-sm text-white/60 leading-relaxed">
              Empowering minds, transforming lives, and building the future of Africa through quality education.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-gold font-semibold text-sm uppercase tracking-wider mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <button onClick={() => navigate({ to: '/' })} className="hover:text-gold transition-colors">Home</button>
              </li>
              <li>
                <button onClick={() => navigate({ to: '/admissions' })} className="hover:text-gold transition-colors">Admissions</button>
              </li>
              <li>
                <button onClick={() => navigate({ to: '/admissions/apply' })} className="hover:text-gold transition-colors">Apply Now</button>
              </li>
              <li>
                <button onClick={() => navigate({ to: '/admissions/check' })} className="hover:text-gold transition-colors">Check Admission</button>
              </li>
              <li>
                <button onClick={() => navigate({ to: '/portal' })} className="hover:text-gold transition-colors">All Portals</button>
              </li>
            </ul>
          </div>

          {/* Portals */}
          <div>
            <h3 className="text-gold font-semibold text-sm uppercase tracking-wider mb-4">Portals</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <button onClick={() => navigate({ to: getPortalPath('student') })} className="hover:text-gold transition-colors">
                  Student Portal
                </button>
              </li>
              <li>
                <button onClick={() => navigate({ to: getPortalPath('staff') })} className="hover:text-gold transition-colors">
                  Staff Portal
                </button>
              </li>
              <li>
                <button onClick={() => navigate({ to: getPortalPath('parent') })} className="hover:text-gold transition-colors">
                  Parent Portal
                </button>
              </li>
              <li>
                <button onClick={() => navigate({ to: getPortalPath('admin') })} className="hover:text-gold transition-colors">
                  Admin Panel
                </button>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-gold font-semibold text-sm uppercase tracking-wider mb-4">Contact</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-gold mt-0.5 flex-shrink-0" />
                <span>Toru-Orua, Bayelsa State, Nigeria</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gold flex-shrink-0" />
                <span>+234 800 000 0000</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gold flex-shrink-0" />
                <span>info@uniafricatoru.edu.ng</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/40">
          <p>© {year} University of Africa, Toru-Orua. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with <Heart className="w-3 h-3 text-gold fill-gold" /> using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold hover:text-gold-light transition-colors"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
