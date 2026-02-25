import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'MakroOppdatering',
  description: 'Test dine makro-kunnskaper! Hvor godt følger du med på finans?',
};

export default function QuizLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
