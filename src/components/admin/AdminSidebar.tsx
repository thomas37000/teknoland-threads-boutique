import { Package, Users, Tag, Filter, Mail, Heart, Calculator, Image, Music, Disc3, Cloud, Truck, Database, DatabaseBackup, HardDrive, Cat, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { useDiscogsUnseen } from "@/hooks/useDiscogs";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  newProductsCount: number;
  unreadMessagesCount: number;
  newUsersCount: number;
}

interface MenuItem {
  value: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  href?: string;
  target?: string;
}

const dashboardMenuItems: MenuItem[] = [
  { value: "categories", label: "Catégories", icon: Tag },
  { value: "contacts", label: "Messages", icon: Mail, badge: "unreadMessagesCount" },
  { value: "clients", label: "Users", icon: Users, badge: "newUsersCount" },
  { value: "filters", label: "Filtres", icon: Filter },
  { value: "idees", label: "Idées", icon: Users },
  { value: "images", label: "Images", icon: Image },
  { value: "moni", label: "Moni", icon: Calculator },
  { value: "products", label: "Produits", icon: Package, badge: "newProductsCount" },
];

const apiMenuItems: MenuItem[]= [
  { value: "apiAirtable", label: "ApiAirtable", icon: HardDrive },
  { value: "artistes", label: "Artistes", icon: Music },
  { value: "discogs", label: "Discogs", icon: Disc3, badge: "discogsUnseenCount" },
  { value: "distribution", label: "Distribution", icon: Truck, href: "/distribution" },
  { value: "lovable", label: "Lovable", icon: Heart },
  { value: "soundcloud", label: "SoundCloud", icon: Cloud },
];

const linksMenuItems: MenuItem[] = [
  { value: "Airtable", label: "Airtable", icon: Database, href: "https://airtable.com/appSuJdzsJZZYHqUf/tbl7kClC80WYUoYq2/viwOMXAikMLfmFvf2", target: "_blank" },
  { value: "Github", label: "Github", icon: Cat, href: "https://github.com/thomas37000/teknoland-threads-boutique", target: "_blank" },
  { value: "Portfolio", label: "Portfolio", icon: Star, href: "https://thomas-chalanson-portfolio.lovable.app/", target: "_blank" },
  { value: "Supabase", label: "Supabase", icon: DatabaseBackup, href: "https://supabase.com/dashboard/org/hhidraefjatqiwuysmnz", target: "_blank" },
];

export function AdminSidebar({
  activeTab,
  onTabChange,
  newProductsCount,
  unreadMessagesCount,
  newUsersCount,
}: AdminSidebarProps) {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const discogsUnseenCount = useDiscogsUnseen();

  const getBadgeCount = (badgeKey?: string) => {
    if (!badgeKey) return 0;
    if (badgeKey === "newProductsCount") return newProductsCount;
    if (badgeKey === "unreadMessagesCount") return unreadMessagesCount;
    if (badgeKey === "newUsersCount") return newUsersCount;
    if (badgeKey === "discogsUnseenCount") return discogsUnseenCount;
    return 0;
  };

  return (
    <Sidebar className={isCollapsed ? "w-14 bg-gray-100" : "w-44 bg-gray-100"} collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="m-6">Administration</SidebarGroupLabel>
          {/* // dashboardMenuItems */}
          <SidebarGroupContent>
            <span className="text-xl text-primary font-bold">Dashboard</span>
            <SidebarMenu>
              {dashboardMenuItems.map((item) => {
                const badgeCount = getBadgeCount(item.badge);
                return (
                  <SidebarMenuItem key={item.value}>
                    {"href" in item ? (
                      <Link to={item.href} className="w-full" target={item.target} rel={item.target === "_blank" ? "noopener noreferrer" : undefined}>
                        <SidebarMenuButton className={activeTab === item.value ? "bg-muted text-primary font-medium" : "hover:bg-muted/50"}>
                          <item.icon className="h-4 w-4" />
                          {!isCollapsed && (
                            <div className="flex items-center justify-between w-full">
                              <span>{item.label}</span>
                            </div>
                          )}
                        </SidebarMenuButton>
                      </Link>
                    ) : (
                      <SidebarMenuButton
                        onClick={() => onTabChange(item.value)}
                        className={activeTab === item.value ? "bg-muted text-primary font-medium" : "hover:bg-muted/50"}
                      >
                        <item.icon className="h-4 w-4" />
                        {!isCollapsed && (
                          <div className="flex items-center justify-between w-full">
                            <span>{item.label}</span>
                            {badgeCount > 0 && (
                              <Badge variant="destructive" className="ml-1 min-w-[20px] h-5 px-1.5 py-0 text-xs">
                                {badgeCount}
                              </Badge>
                            )}
                          </div>
                        )}
                      </SidebarMenuButton>
                    )}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
          {/* // apidMenuItems */}
          <SidebarGroupContent>
            <span className="text-xl text-primary font-bold">API</span>
            <SidebarMenu>
              {apiMenuItems.map((item) => {
                const badgeCount = getBadgeCount(item.badge);
                return (
                  <SidebarMenuItem key={item.value}>
                    {"href" in item ? (
                      <Link to={item.href} className="w-full" target={item.target} rel={item.target === "_blank" ? "noopener noreferrer" : undefined}>
                        <SidebarMenuButton className={activeTab === item.value ? "bg-muted text-primary font-medium" : "hover:bg-muted/50"}>
                          <item.icon className="h-4 w-4" />
                          {!isCollapsed && (
                            <div className="flex items-center justify-between w-full">
                              <span>{item.label}</span>
                            </div>
                          )}
                        </SidebarMenuButton>
                      </Link>
                    ) : (
                      <SidebarMenuButton
                        onClick={() => onTabChange(item.value)}
                        className={activeTab === item.value ? "bg-muted text-primary font-medium" : "hover:bg-muted/50"}
                      >
                        <item.icon className="h-4 w-4" />
                        {!isCollapsed && (
                          <div className="flex items-center justify-between w-full">
                            <span>{item.label}</span>
                            {badgeCount > 0 && (
                              <Badge variant="destructive" className="ml-1 min-w-[20px] h-5 px-1.5 py-0 text-xs">
                                {badgeCount}
                              </Badge>
                            )}
                          </div>
                        )}
                      </SidebarMenuButton>
                    )}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
          {/* // linksMenuItems */}
          <SidebarGroupContent>
            <span className="text-xl text-primary font-bold">Links</span>
            <SidebarMenu>
              {linksMenuItems.map((item) => {
                return (
                  <SidebarMenuItem key={item.value}>
                    {"href" in item ? (
                      <Link to={item.href} className="w-full" target={item.target} rel={item.target === "_blank" ? "noopener noreferrer" : undefined}>
                        <SidebarMenuButton className={activeTab === item.value ? "bg-muted text-primary font-medium" : "hover:bg-muted/50"}>
                          <item.icon className="h-4 w-4" />
                          {!isCollapsed && (
                            <div className="flex items-center justify-between w-full">
                              <span>{item.label}</span>
                            </div>
                          )}
                        </SidebarMenuButton>
                      </Link>
                    ) : (
                      <SidebarMenuButton
                        onClick={() => onTabChange(item.value)}
                        className={activeTab === item.value ? "bg-muted text-primary font-medium" : "hover:bg-muted/50"}
                      >
                        <item.icon className="h-4 w-4" />
                        {!isCollapsed && (
                          <div className="flex items-center justify-between w-full">
                            <span>{item.label}</span>
                          </div>
                        )}
                      </SidebarMenuButton>
                    )}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
            <SidebarTrigger className="m-2 self-start text-primary" />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
