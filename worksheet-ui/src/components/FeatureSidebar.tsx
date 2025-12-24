import { ROUTES } from '../navigation/routes';

interface FeatureSidebarProps {
    currentRoute: string;
    onNavigate: (route: string) => void;
}

interface Feature {
    name: string;
    icon: string;
    route: string;
    offline: boolean;
    description: string;
}

const features: Feature[] = [
    {
        name: 'Worksheet Builder',
        icon: '📝',
        route: ROUTES.WORKSHEET_DASHBOARD,
        offline: true,
        description: 'Create custom worksheets',
    },
    {
        name: 'Quiz Analytics',
        icon: '📊',
        route: ROUTES.ANALYTICS,
        offline: true,
        description: 'Analyze quiz performance',
    },
    {
        name: 'Print Reports',
        icon: '📄',
        route: ROUTES.PRINT_REPORT_VIEW,
        offline: true,
        description: 'View and print reports',
    },
    {
        name: 'Push to Canvas',
        icon: '➕',
        route: ROUTES.QUIZ_IMPORT,
        offline: false,
        description: 'Upload quizzes to Canvas',
    },
    {
        name: 'Canvas Courses',
        icon: '📚',
        route: ROUTES.CANVAS_COURSES,
        offline: false,
        description: 'Browse Canvas courses',
    },
];

export function FeatureSidebar({ currentRoute, onNavigate }: Readonly<FeatureSidebarProps>) {
    return (
        <div className="w-64 theme-surface border-r-2 theme-border-strong h-screen flex flex-col print:hidden">
            {/* Header */}
            <div className="p-4 border-b-2 theme-border-strong">
                <h1 className="text-xl font-black uppercase tracking-tight theme-text">json-printer</h1>
                <p className="text-[8px] theme-text-muted font-bold tracking-widest mt-1">FEATURES</p>
            </div>

            {/* Feature List */}
            <nav className="flex-1 overflow-y-auto p-2">
                {features.map((feature) => {
                    const isActive = currentRoute === feature.route;
                    const isOffline = feature.offline;

                    return (
                        <button
                            key={feature.route}
                            onClick={() => onNavigate(feature.route)}
                            className={`
                w-full text-left p-3 mb-2 rounded-lg border-2 transition-all
                ${isActive
                                    ? 'bg-[var(--color-accent)] text-white border-[var(--color-accent)]'
                                    : 'theme-surface theme-text theme-border hover:border-[var(--color-accent)]'
                                }
              `}
                        >
                            <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-lg" role="img" aria-label={feature.name}>{feature.icon}</span>
                                    <span className="font-bold text-sm">{feature.name}</span>
                                </div>
                                {isOffline && (
                                    <span className="text-[8px] px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded font-bold">
                                        OFFLINE
                                    </span>
                                )}
                            </div>
                            <p className={`text-[10px] ml-7 ${isActive ? 'text-white/70' : 'theme-text-muted'}`}>{feature.description}</p>
                        </button>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t-2 theme-border-strong">
                <div className="text-[8px] theme-text-muted font-bold tracking-widest">
                    STATUS
                </div>
                <div className="flex items-center gap-2 mt-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-[10px] font-bold theme-text">LOCAL MODE READY</span>
                </div>
            </div>
        </div>
    );
}

