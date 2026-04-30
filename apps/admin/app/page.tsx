import {
  BarChart3,
  Bell,
  Boxes,
  ClipboardList,
  ImageIcon,
  Plus,
  Search
} from "lucide-react";

import { Badge, Button, Card, CardContent, CardHeader } from "@kth/ui";

const metrics = [
  { label: "Active products", value: "0", detail: "Ready for catalogue import" },
  { label: "New enquiries", value: "0", detail: "Awaiting enquiry flow setup" },
  { label: "About images", value: "0", detail: "R2 integration prepared" },
  { label: "Draft products", value: "0", detail: "Admin CRUD comes next" }
];

const setupItems = [
  "Connect Neon DATABASE_URL and run Drizzle migrations",
  "Add R2 credentials for product and about images",
  "Configure Resend for enquiry notifications"
];

export default function AdminHome() {
  return (
    <main className="min-h-screen px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col gap-4 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--accent)]">
              Admin portal
            </p>
            <h1 className="mt-1 font-display text-2xl font-bold sm:text-3xl">
              Kashmir Tyre House operations
            </h1>
          </div>
          <div className="flex gap-2">
            <Button aria-label="Search admin records" size="icon" variant="secondary">
              <Search size={18} />
            </Button>
            <Button aria-label="Notifications" size="icon" variant="secondary">
              <Bell size={18} />
            </Button>
            <Button>
              <Plus size={18} />
              Add product
            </Button>
          </div>
        </header>

        <section className="mt-5 grid gap-4 md:grid-cols-4">
          {metrics.map((metric) => (
            <Card className="animate-rise" key={metric.label}>
              <CardHeader>
                <p className="text-sm text-[var(--muted-foreground)]">
                  {metric.label}
                </p>
                <p className="font-display text-4xl font-bold">{metric.value}</p>
              </CardHeader>
              <CardContent className="text-sm text-[var(--muted-foreground)]">
                {metric.detail}
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="mt-5 grid gap-5 lg:grid-cols-[1.35fr_0.65fr]">
          <Card>
            <CardHeader className="flex flex-col gap-3 border-b border-[var(--border)] sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-display text-xl font-bold">
                  Catalogue workspace
                </h2>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  The admin shell is ready for TanStack Table product management.
                </p>
              </div>
              <Badge tone="warning">Setup mode</Badge>
            </CardHeader>
            <CardContent className="pt-5">
              <div className="overflow-hidden rounded-lg border border-[var(--border)]">
                <div className="grid grid-cols-[1.2fr_0.8fr_0.8fr] bg-[var(--surface-strong)] px-4 py-3 text-sm font-semibold text-[var(--muted-foreground)]">
                  <span>Area</span>
                  <span>Status</span>
                  <span>Owner</span>
                </div>
                {[
                  ["Products", "Schema ready", "Admin"],
                  ["Enquiries", "Schema ready", "Sales"],
                  ["Images", "R2 env ready", "Content"]
                ].map(([area, status, owner]) => (
                  <div
                    className="grid grid-cols-[1.2fr_0.8fr_0.8fr] border-t border-[var(--border)] px-4 py-4 text-sm"
                    key={area}
                  >
                    <span className="font-semibold">{area}</span>
                    <span className="text-[var(--muted-foreground)]">
                      {status}
                    </span>
                    <span className="text-[var(--muted-foreground)]">
                      {owner}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-5">
            <Card>
              <CardHeader>
                <BarChart3 className="text-[var(--signal)]" size={24} />
                <h2 className="font-display text-xl font-bold">Next actions</h2>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm text-[var(--muted-foreground)]">
                  {setupItems.map((item) => (
                    <li className="flex gap-3" key={item}>
                      <span className="mt-1 h-2 w-2 rounded-full bg-[var(--accent)]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <div className="grid grid-cols-3 gap-3">
              <Card className="p-4 text-center">
                <Boxes className="mx-auto text-[var(--steel)]" size={22} />
                <p className="mt-2 text-xs font-semibold">Products</p>
              </Card>
              <Card className="p-4 text-center">
                <ClipboardList className="mx-auto text-[var(--steel)]" size={22} />
                <p className="mt-2 text-xs font-semibold">Enquiries</p>
              </Card>
              <Card className="p-4 text-center">
                <ImageIcon className="mx-auto text-[var(--steel)]" size={22} />
                <p className="mt-2 text-xs font-semibold">Media</p>
              </Card>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
