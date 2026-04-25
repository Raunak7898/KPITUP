import { Sidebar } from '../components/Sidebar';
import { TopBar } from '../components/TopBar';
import { Construction } from 'lucide-react';

interface PlaceholderPageProps {
  title: string;
  description?: string;
}

export default function PlaceholderPage({ title, description = "We're currently building this feature. Check back soon!" }: PlaceholderPageProps) {
  return (
    <div className="flex h-screen bg-[var(--bg-main)] overflow-hidden transition-colors">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <TopBar />
        <main className="flex-1 flex items-center justify-center p-8">
          <div className="text-center flex flex-col items-center max-w-md">
            <div className="w-20 h-20 bg-[var(--bg-card-hover)] rounded-full flex items-center justify-center text-[var(--text-muted)] mb-6 border border-[var(--border-color)]">
              <Construction size={40} />
            </div>
            <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-4">{title}</h2>
            <p className="text-[var(--text-muted)] text-lg leading-relaxed">
              {description}
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
