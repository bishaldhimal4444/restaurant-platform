import { SessionStatusWatcher } from './session-status-watcher';

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ sessionId: string }>;
}

export default async function SessionLayout({ children, params }: LayoutProps) {
  const { sessionId } = await params;
  return (
    <>
      <SessionStatusWatcher sessionId={sessionId} />
      {children}
    </>
  );
}
