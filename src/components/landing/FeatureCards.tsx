import { Link as LinkIcon, Cpu, FileText, Activity, Mic, Award } from 'lucide-react';

const features = [
    {
        icon: LinkIcon,
        title: "Blockchain Provenance",
        description: "Every transaction and product movement is recorded on an immutable blockchain ledger ensuring complete transparency.",
        color: "blue"
    },
    {
        icon: Cpu,
        title: "IoT Monitoring",
        description: "Real-time monitoring of product conditions (temperature, humidity) throughout the supply chain journey.",
        color: "green"
    },
    {
        icon: FileText,
        title: "Smart Contracts",
        description: "Automated escrow payments and quality verification through tamper-proof smart contracts.",
        color: "purple"
    },
    {
        icon: Activity,
        title: "AI Fraud Detection",
        description: "Machine learning algorithms monitor transactions for anomalies and potential fraud.",
        color: "orange"
    },
    {
        icon: Mic,
        title: "Voice Interface",
        description: "Voice commands and multilingual support for farmers with limited digital literacy.",
        color: "red"
    },
    {
        icon: Award,
        title: "Sustainability Rewards",
        description: "Farmers earn tokens for sustainable practices that can be redeemed for benefits.",
        color: "teal"
    }
];

const colorClasses = {
    blue: { bg: "bg-blue-50", text: "text-blue-600" },
    green: { bg: "bg-green-50", text: "text-green-600" },
    purple: { bg: "bg-purple-50", text: "text-purple-600" },
    orange: { bg: "bg-orange-50", text: "text-orange-600" },
    red: { bg: "bg-red-50", text: "text-red-600" },
    teal: { bg: "bg-teal-50", text: "text-teal-600" },
};

const FeatureCard = ({ feature }: { feature: (typeof features)[0] }) => {
    const Icon = feature.icon;
    const colors = colorClasses[feature.color as keyof typeof colorClasses];

    return (
        <div className="group bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition">
            <div className={`${colors.bg} w-14 h-14 rounded-lg flex items-center justify-center`}>
                <Icon className={`w-6 h-6 ${colors.text} transition-transform duration-300 ease-in-out group-hover:rotate-10 group-hover:scale-110`} />
            </div>
            <h3 className="mt-4 text-xl font-semibold text-gray-900">{feature.title}</h3>
            <p className="mt-2 text-gray-600">{feature.description}</p>
        </div>
    );
};


const FeatureCards = () => {
  return (
    <section id="features" className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">Powerful Features</h2>
            <p className="text-lg text-center text-gray-600 mb-12 max-w-3xl mx-auto">
                AgriChain combines cutting-edge technologies to revolutionize agricultural supply chains
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {features.map((feature, i) => (
                    <FeatureCard key={i} feature={feature} />
                ))}
            </div>
        </div>
    </section>
  );
};

export default FeatureCards;
