import Link from 'next/link';
import { User, ShoppingBag, Truck, Shield, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

const roles = [
  {
    name: "Farmers & MSMEs",
    icon: User,
    color: "green",
    features: [
      "Verified profiles with digital ID",
      "Product listing with IoT data",
      "Voice & multilingual support",
    ],
    link: "/register/farmer",
    action: "Register as Farmer",
  },
  {
    name: "Buyers",
    icon: ShoppingBag,
    color: "blue",
    features: [
      "View product provenance",
      "Real-time freshness data",
      "Secure escrow payments",
    ],
    link: "/register/buyer",
    action: "Register as Buyer",
  },
  {
    name: "Logistics",
    icon: Truck,
    color: "orange",
    features: [
      "Real-time shipment tracking",
      "IoT condition monitoring",
      "Digital delivery confirmation",
    ],
    link: "/register/logistics",
    action: "Register as Logistics",
  },
  {
    name: "Admins",
    icon: Shield,
    color: "purple",
    features: [
      "User verification",
      "Quality control",
      "Fraud detection",
    ],
    link: "/register/admin",
    action: "Admin Access",
  },
];

const colorClasses = {
  green: {
    bg: "bg-green-50",
    iconBg: "bg-green-100",
    iconText: "text-green-600",
    check: "text-green-500",
    button: "bg-green-600 hover:bg-green-700",
  },
  blue: {
    bg: "bg-blue-50",
    iconBg: "bg-blue-100",
    iconText: "text-blue-600",
    check: "text-blue-500",
    button: "bg-blue-600 hover:bg-blue-700",
  },
  orange: {
    bg: "bg-orange-50",
    iconBg: "bg-orange-100",
    iconText: "text-orange-600",
    check: "text-orange-500",
    button: "bg-orange-600 hover:bg-orange-700",
  },
  purple: {
    bg: "bg-purple-50",
    iconBg: "bg-purple-100",
    iconText: "text-purple-600",
    check: "text-purple-500",
    button: "bg-purple-600 hover:bg-purple-700",
  },
};

const RoleCard = ({ role }: { role: (typeof roles)[0] }) => {
  const Icon = role.icon;
  const colors = colorClasses[role.color as keyof typeof colorClasses];

  return (
    <Link href={role.link} className="block h-full">
      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 transition duration-300 ease-in-out hover:-translate-y-1 hover:shadow-xl h-full flex flex-col">
        <div className={`${colors.bg} p-6`}>
          <div className={`${colors.iconBg} w-14 h-14 rounded-full flex items-center justify-center mx-auto`}>
            <Icon className={`w-6 h-6 ${colors.iconText}`} />
          </div>
          <h3 className="mt-4 text-xl font-semibold text-center text-gray-900">{role.name}</h3>
        </div>
        <div className="p-6 flex flex-col flex-grow">
          <ul className="space-y-3 flex-grow">
            {role.features.map((feature, i) => (
              <li key={i} className="flex items-start">
                <Check className={`w-5 h-5 ${colors.check} mt-0.5 mr-2 flex-shrink-0`} />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          <Button tabIndex={-1} className={`mt-6 w-full text-white ${colors.button}`}>
            {role.action}
          </Button>
        </div>
      </div>
    </Link>
  );
};

const RoleCards = () => {
  return (
    <section id="roles" className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">For Everyone in the Supply Chain</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {roles.map((role) => (
            <RoleCard key={role.name} role={role} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default RoleCards;
