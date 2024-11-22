import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div>
        <h1>Welcome to DevExpress Next.js Demo</h1>
        <div className="mt-4">
          <Link href="/login" className="mr-4 text-blue-500">
            Go to Login
          </Link>
          <Link href="/pageone" className="text-blue-500">
          Patient Management
          </Link>
          <Link href="/pagetwo" className="text-blue-500">
            User Management
          </Link>
        </div>
      </div>
    </main>
  );
}