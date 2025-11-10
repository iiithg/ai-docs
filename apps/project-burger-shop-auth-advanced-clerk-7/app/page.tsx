import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/clerk/login');
}

