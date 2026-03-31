import {
  BarChart2,
  Circle,
  Snowflake,
  Target,
  Trophy,
  Zap,
} from "lucide-react";

const CATEGORIES = [
  { label: "All", icon: BarChart2 },
  { label: "Soccer", icon: Circle },
  { label: "Basketball", icon: Target },
  { label: "Tennis", icon: Zap },
  { label: "Ice Hockey", icon: Snowflake },
  { label: "eSports", icon: Trophy },
];

interface SidebarProps {
  activeCategory: string;
  setActiveCategory: (cat: string) => void;
}

export default function Sidebar({
  activeCategory,
  setActiveCategory,
}: SidebarProps) {
  return (
    <aside className="hidden md:flex flex-col w-52 flex-shrink-0 border-r border-border bg-sidebar/50 p-3 gap-1">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-2 py-1 mt-1">
        Sports
      </p>
      {CATEGORIES.map(({ label, icon: Icon }) => (
        <button
          key={label}
          type="button"
          data-ocid={`sidebar.${label.toLowerCase().replace(" ", "_")}.link`}
          onClick={() => setActiveCategory(label)}
          className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            activeCategory === label
              ? "bg-primary/15 text-primary border border-primary/30"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary"
          }`}
        >
          <Icon className="w-4 h-4 flex-shrink-0" />
          {label}
        </button>
      ))}
    </aside>
  );
}
