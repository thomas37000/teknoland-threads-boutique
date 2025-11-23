import { Package, Users, Tag, Filter, Mail, Heart, Calculator, Image, Music } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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

  const getBadgeCount = (badgeKey?: string) => {
    if (!badgeKey) return 0;
    if (badgeKey === "newProductsCount") return newProductsCount;
    if (badgeKey === "unreadMessagesCount") return unreadMessagesCount;
    if (badgeKey === "newUsersCount") return newUsersCount;
    return 0;
  };

  return (
    <Sidebar className={isCollapsed ? "w-14" : "w-60"} collapsible="icon">
      <SidebarTrigger className="m-2 self-end" />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Administration</SidebarGroupLabel>
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
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
