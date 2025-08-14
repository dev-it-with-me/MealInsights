import { Outlet } from "react-router-dom";
import { Text, Group, useDisclosure } from "@/shared/ui-kit";
import { Link, useLocation } from "react-router-dom";
import {
  IconHome,
  IconLeaf,
  IconList,
  IconChefHat,
  IconCalendar,
  IconShoppingCart,
  IconChartLine,
  IconMenu2,
  IconX,
  IconUser,
  IconSettings,
  IconBell,
  IconSearch,
} from "@tabler/icons-react";

const MainLayout = () => {
  const [opened, { toggle }] = useDisclosure();
  const location = useLocation();

  const navigationItems = [
    { icon: IconHome, label: "Home", href: "/" },
    { icon: IconChefHat, label: "Meals", href: "/meals/manage" },
    { icon: IconCalendar, label: "Plan", href: "/diet-plan" },
    { icon: IconList, label: "Ingredients", href: "/ingredients" },
    { icon: IconShoppingCart, label: "Shopping", href: "/shopping-list" },
    { icon: IconChartLine, label: "Analytics", href: "/dashboard" },
    { icon: IconSettings, label: "Settings", href: "/settings" },
  ];

  const isActive = (href: string) => {
    if (href === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen flex">
      {/* Mobile Overlay */}
      {opened && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={toggle}
        />
      )}

      {/* Sidebar - Calm Style */}
      <aside
        className={`
        fixed lg:relative w-64 h-screen z-50
        transform transition-transform duration-300 ease-in-out
        
        ${opened ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}
        style={{
          background: `linear-gradient(135deg, color-mix(in srgb, var(--color-primary-500) 15%, transparent), color-mix(in srgb, var(--color-primary-600) 10%, transparent))`,
        }}
      >
        {/* App Branding - Calm Style */}
        <div className="px-6 py-8 mt-10">
          <Group gap="sm" align="center">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{
                background: `linear-gradient(45deg, var(--color-primary-400), var(--color-secondary-400))`,
              }}
            >
              <IconLeaf size={18} className="text-white" />
            </div>
            <Text
              size="xl"
              fw={300}
              style={{
                color: "var(--color-surface-50)",
                fontFamily: "system-ui, -apple-system, sans-serif",
                letterSpacing: "-0.025em",
              }}
            >
              MealInsights
            </Text>
          </Group>
        </div>

        {/* Navigation Items - Calm Style */}
        <nav className="px-4 flex-1">
          <div className="space-y-2">
            {navigationItems.map((item) => {
              const IconComponent = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => {
                    if (window.innerWidth < 1024) {
                      toggle();
                    }
                  }}
                  className={`
                    group flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200
                    ${active ? "shadow-lg" : "hover:bg-surface-800/30"}
                  `}
                  style={
                    active
                      ? {
                          background: `color-mix(in srgb, var(--color-primary-500) 15%, transparent)`,
                          borderLeft: `3px solid var(--color-primary-400)`,
                        }
                      : {}
                  }
                >
                  <div
                    className={`
                      w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200
                      ${active ? "" : "group-hover:bg-surface-700/50"}
                    `}
                    style={
                      active
                        ? {
                            background: `var(--color-primary-500)`,
                          }
                        : {}
                    }
                  >
                    <IconComponent
                      size={20}
                      className={`${
                        active
                          ? "text-white"
                          : "text-surface-400 group-hover:text-surface-200"
                      }`}
                    />
                  </div>
                  <Text
                    size="sm"
                    fw={active ? 500 : 400}
                    style={{
                      color: active
                        ? "var(--color-surface-50)"
                        : "var(--color-surface-300)",
                    }}
                  >
                    {item.label}
                  </Text>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Mobile Close Button */}
        <button
          onClick={toggle}
          className="lg:hidden absolute top-4 right-4 p-2 rounded-lg hover:bg-surface-700/50 transition-colors"
        >
          <IconX size={20} style={{ color: "var(--color-surface-400)" }} />
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-surface-500-950">
        {/* Top Header - Minimal like Calm */}

        {/* Page Content */}
        <div className="flex-1 overflow-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
