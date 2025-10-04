import Link from 'next/link';
import Image from 'next/image';
import { Twitter, Facebook, Linkedin, Youtube } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const Footer = () => {
    const logo = PlaceHolderImages.find((img) => img.id === 'agrichain-logo');
    const socialLinks = [
        { icon: Twitter, href: '#' },
        { icon: Facebook, href: '#' },
        { icon: Linkedin, href: '#' },
        { icon: Youtube, href: '#' },
    ];
    const footerLinks = [
        {
            title: 'Platform',
            links: [
                { name: 'Features', href: '#' },
                { name: 'Pricing', href: '#' },
                { name: 'API', href: '#' },
                { name: 'Integrations', href: '#' },
            ]
        },
        {
            title: 'Resources',
            links: [
                { name: 'Documentation', href: '#' },
                { name: 'Guides', href: '#' },
                { name: 'Blog', href: '#' },
                { name: 'Support', href: '#' },
            ]
        },
        {
            title: 'Company',
            links: [
                { name: 'About', href: '#' },
                { name: 'Careers', href: '#' },
                { name: 'Privacy', href: '#' },
                { name: 'Terms', href: '#' },
            ]
        }
    ];

  return (
    <footer id="about" className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-900 text-gray-400">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center">
            {logo && (
                <Image
                    src={logo.imageUrl}
                    alt={logo.description}
                    width={32}
                    height={32}
                    data-ai-hint={logo.imageHint}
                />
              )}
              <span className="ml-2 text-xl font-bold text-white">AgriClear</span>
            </div>
            <p className="mt-4 text-sm">
              Blockchain-powered transparent supply chain platform for Indian agriculture and MSMEs.
            </p>
            <div className="mt-6 flex space-x-4">
                {socialLinks.map((social, i) => {
                    const Icon = social.icon;
                    return (
                        <Link key={i} href={social.href} className="text-gray-400 hover:text-white">
                           <Icon className="w-5 h-5" />
                           <span className="sr-only">{social.icon.displayName}</span>
                        </Link>
                    )
                })}
            </div>
          </div>
          {footerLinks.map((section) => (
            <div key={section.title}>
                <h3 className="text-sm font-semibold text-white uppercase tracking-wider">{section.title}</h3>
                <ul className="mt-4 space-y-2">
                    {section.links.map(link => (
                        <li key={link.name}>
                            <Link href={link.href} className="text-sm hover:text-white">{link.name}</Link>
                        </li>
                    ))}
                </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 pt-8 border-t border-gray-800 text-sm text-center">
          <p>&copy; {new Date().getFullYear()} AgriClear. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
