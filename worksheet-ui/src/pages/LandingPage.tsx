import { FeatureSidebar } from '../components/FeatureSidebar';
import { ROUTES } from '../navigation/routes';

interface LandingPageProps {
    onNavigate: (route: string) => void;
}

export function LandingPage({ onNavigate }: Readonly<LandingPageProps>) {
    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <FeatureSidebar currentRoute={ROUTES.HOME} onNavigate={onNavigate} />

            {/* Main Content */}
            <div className="flex-1 flex items-center justify-center">
                <div className="text-center p-8">
                    <h1 className="text-5xl font-black uppercase tracking-tight mb-4">
                        json-printer
                    </h1>
                    <p className="text-gray-500 text-lg mb-8">
                        Select a feature from the sidebar to get started
                    </p>
                    <div className="text-[10px] text-gray-400 font-bold tracking-widest">
                        OFFLINE-READY • LOCAL-FIRST • CANVAS-COMPATIBLE
                    </div>
                </div>
            </div>
        </div>
    );
}
