import { Package, Users, Tag, Filter, Mail, Heart, Calculator, Image, Music, Disc3, Cloud, Truck } from "lucide-react";
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

const menuItems = [
  { value: "products", label: "Produits", icon: Package, badge: "newProductsCount" },
  { value: "categories", label: "Catégories", icon: Tag },
  { value: "filters", label: "Filtres", icon: Filter },
  { value: "contacts", label: "Messages", icon: Mail, badge: "unreadMessagesCount" },
  { value: "lovable", label: "Lovable", icon: Heart },
  { value: "moni", label: "Moni", icon: Calculator },
  { value: "clients", label: "Users", icon: Users, badge: "newUsersCount" },
  { value: "images", label: "Images", icon: Image },
  { value: "idees", label: "Idées", icon: Users },
  { value: "artistes", label: "Artistes", icon: Music },
  { value: "discogs", label: "Discogs", icon: Disc3, badge: "discogsUnseenCount" },
  { value: "soundcloud", label: "SoundCloud", icon: Cloud },
  { value: "distribution", label: "Distribution", icon: Truck, href: "/distribution" },
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
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const badgeCount = getBadgeCount(item.badge);
                return (
                  <SidebarMenuItem key={item.value}>
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
                  ) : (
                    <Link to={item.href} className="flex items-center w-full">
                      <SidebarMenuButton
                        className={activeTab === item.value ? "bg-muted text-primary font-medium w-full" : "hover:bg-muted/50 w-full"}
                        asChild
                      >
                        <div className="flex items-center w-full">
                          <item.icon className="h-4 w-4 shrink-0" />
                          {!isCollapsed && (
                            <div className="flex items-center justify-between w-full ml-2">
                              <span>{item.label}</span>
                              {badgeCount > 0 && (
                                <Badge variant="destructive" className="ml-1 min-w-[20px] h-5 px-1.5 py-0 text-xs">
                                  {badgeCount}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
            <SidebarTrigger className="m-2 self-start" />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
