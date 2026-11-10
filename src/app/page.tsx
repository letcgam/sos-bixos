import { CentralComunicacao } from './components/central-comunicacao';

export default function Home() {
    return (
        <main className="flex flex-col items-center justify-center gap-6 bg-background px-6 text-foreground">

            <CentralComunicacao/>

        </main>
    );
}