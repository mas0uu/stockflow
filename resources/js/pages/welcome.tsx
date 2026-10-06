import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowRight, ArrowLeftRight, Boxes, ClipboardList } from 'lucide-react';
import AppLogoIcon from '@/components/app-logo-icon';
import { Button } from '@/components/ui/button';
import { dashboard, login, register } from '@/routes';

export default function Welcome() {
    const { auth } = usePage().props;
    return (
        <div className="min-h-screen bg-background text-foreground">
            <Head title="Inventory, in order" />
            <div className="mx-auto max-w-6xl px-6 py-8 md:px-10">
                <header className="flex items-center justify-between gap-4">
                    <Link
                        href="/"
                        className="flex items-center gap-2 text-xl font-semibold"
                    >
                        <AppLogoIcon className="size-8 text-emerald-700 dark:text-emerald-400" />
                        Stockflow
                    </Link>
                    <nav aria-label="Account">
                        {auth.user ? (
                            <Button asChild>
                                <Link href={dashboard()}>
                                    Open dashboard
                                    <ArrowRight />
                                </Link>
                            </Button>
                        ) : (
                            <Button variant="outline" asChild>
                                <Link href={login()}>Log in</Link>
                            </Button>
                        )}
                    </nav>
                </header>
                <main className="py-20 md:py-28">
                    <div className="max-w-3xl">
                        <p className="text-xs font-semibold tracking-[0.2em] text-emerald-700 uppercase dark:text-emerald-400">
                            Your everyday inventory workspace
                        </p>
                        <h1 className="mt-6 text-5xl leading-[1.08] font-semibold tracking-tight md:text-7xl">
                            Every product.
                            <br />
                            Every movement.
                            <br />
                            <span className="text-emerald-700 dark:text-emerald-400">
                                All in order.
                            </span>
                        </h1>
                        <p className="mt-7 max-w-xl text-lg leading-relaxed text-muted-foreground">
                            Organize your products, record incoming and outgoing
                            stock, and know what needs replenishing. Keep your
                            business moving with a clear view of what is on
                            hand.
                        </p>
                        <div className="mt-9 flex flex-wrap gap-3">
                            {auth.user ? (
                                <Button size="lg" asChild>
                                    <Link href={dashboard()}>
                                        Go to your inventory
                                        <ArrowRight />
                                    </Link>
                                </Button>
                            ) : (
                                <>
                                    <Button size="lg" asChild>
                                        <Link href={register()}>
                                            Create an account
                                            <ArrowRight />
                                        </Link>
                                    </Button>
                                    <Button variant="outline" size="lg" asChild>
                                        <Link href={login()}>
                                            Log in to Stockflow
                                        </Link>
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                    <div className="mt-20 grid gap-5 md:grid-cols-3">
                        {[
                            {
                                icon: Boxes,
                                title: 'One organized catalog',
                                description:
                                    'Find products by name, SKU, or category. Keep prices and reorder levels close at hand.',
                            },
                            {
                                icon: ArrowLeftRight,
                                title: 'Stock you can account for',
                                description:
                                    'Record receipts, issues, and corrections with a reason and a running balance.',
                            },
                            {
                                icon: ClipboardList,
                                title: 'A history you can follow',
                                description:
                                    'See who recorded each change and spot low-stock products before they run out.',
                            },
                        ].map((feature) => (
                            <article
                                key={feature.title}
                                className="rounded-xl border bg-card p-6"
                            >
                                <feature.icon className="size-6 text-emerald-700 dark:text-emerald-400" />
                                <h2 className="mt-5 font-semibold">
                                    {feature.title}
                                </h2>
                                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                                    {feature.description}
                                </p>
                            </article>
                        ))}
                    </div>
                </main>
                <footer className="border-t pt-6 text-sm text-muted-foreground">
                    Stockflow · A clearer view of your inventory.
                </footer>
            </div>
        </div>
    );
}
