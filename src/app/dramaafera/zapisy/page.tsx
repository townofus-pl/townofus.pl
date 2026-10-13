import type { Metadata } from 'next';
import SignupsClient from './SignupsClient';

export const metadata: Metadata = { title: 'Zapisy na środę — Dramaafera' };

export default function SignupsPage() {
    return <SignupsClient />;
}
