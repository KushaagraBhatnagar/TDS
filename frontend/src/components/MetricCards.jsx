import { Users, CheckCircle, Send, Search } from 'lucide-react';

const MetricCards = ({ stats }) => {
  const cards = [
    {
      title: 'Total Vetted Clients',
      value: stats?.totalClients || 0,
      icon: Users,
      description: 'Total profiles managed by you',
      color: 'border-l-4 border-tdc-green'
    },
    {
      title: 'Active Pipeline',
      value: stats?.activeClients || 0,
      icon: Search,
      description: 'Onboarding or actively searching',
      color: 'border-l-4 border-tdc-sage'
    },
    {
      title: 'Success Match Rate',
      value: `${stats?.successRate || 0}%`,
      icon: CheckCircle,
      description: 'Percentage of clients successfully matched',
      color: 'border-l-4 border-tdc-gold'
    },
    {
      title: 'Recommendations Dispatched',
      value: stats?.totalMatchesSent || 0,
      icon: Send,
      description: 'Introductions emailed to clients',
      color: 'border-l-4 border-tdc-charcoal'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, idx) => {
        const IconComponent = card.icon;
        return (
          <div 
            key={idx} 
            className={`bg-white p-6 rounded-xl border border-tdc-cream-dark/30 shadow-[0_4px_20px_-4px_rgba(29,38,35,0.03)] hover:shadow-[0_8px_30px_-6px_rgba(29,38,35,0.06)] transition-all duration-300 ${card.color}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-tdc-charcoal/50 uppercase tracking-wider font-sans">
                  {card.title}
                </p>
                <h3 className="text-3xl font-serif font-bold text-tdc-green mt-1">
                  {card.value}
                </h3>
              </div>
              <div className="p-3 bg-tdc-beige/50 rounded-lg text-tdc-gold border border-tdc-cream-dark/20">
                <IconComponent className="h-6 w-6" />
              </div>
            </div>
            <p className="text-xs text-tdc-charcoal/60 mt-3 font-sans font-medium">
              {card.description}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default MetricCards;
