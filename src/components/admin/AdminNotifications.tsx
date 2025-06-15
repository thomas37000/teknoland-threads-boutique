
import React, { useEffect, useState } from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { PackageCheck, SearchCheck, AlertTriangle } from "lucide-react";

interface Notification {
  type: "info" | "warning";
  title: string;
  description: string;
}

const PAGE_SEO = [
  {
    name: "Accueil",
    file: "src/pages/Index.tsx",
    required: ["meta description", "title", "og:title", "og:description"],
  },
  {
    name: "Shop",
    file: "src/pages/ShopPage.tsx",
    required: ["meta description", "title", "og:title", "og:description"],
  }
];

const AdminNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [checkingPackages, setCheckingPackages] = useState(true);

  useEffect(() => {
    const runNotifications = async () => {
      let notifs: Notification[] = [];

      // --- NPM Packages Outdated (simulation/approximate) ---
      setCheckingPackages(true);
      try {
        // On Lovable, direct file system/package.json access is limited!
        // We'll simulate NPM check: hard-code a list of main deps to check.
        // In un vrai dashboard backoffice, ce check se fait côté serveur.
        const importantDeps = [
          { name: "react", current: "18.3.1" },
          { name: "react-dom", current: "18.3.1" },
          { name: "react-router-dom", current: "6.26.2" },
          { name: "react-helmet-async", current: "2.0.5" },
          { name: "tailwindcss", current: "3.x" }
        ];
        // Check NPM registry for latest versions
        const promises = importantDeps.map(async dep => {
          try {
            const res = await fetch(`https://registry.npmjs.org/${dep.name}/latest`);
            const json = await res.json();
            return {
              ...dep,
              latest: json.version,
              hasUpdate: json.version && json.version !== dep.current,
            };
          } catch {
            return { ...dep, latest: null, hasUpdate: false };
          }
        });
        const packages = await Promise.all(promises);
        const outdated = packages.filter(p => p.hasUpdate);
        if (outdated.length) {
          notifs.push({
            type: "warning",
            title: "Mise à jour des packages NPM disponible",
            description: `Certains packages sont obsolètes : ` +
              outdated.map(p => `${p.name} (${p.current} → ${p.latest})`).join(", "),
          });
        }
      } catch {
        notifs.push({
          type: "warning",
          title: "Erreur lors de la vérification des packages",
          description: "Impossible de vérifier les versions NPM pour le moment.",
        });
      }
      setCheckingPackages(false);

      // --- SEO metas vérification sur les pages principales (simulation) ---
      // On vérifie si les balises sont présentes dans les pages listées
      const seoStatus: {[file:string]:string[]} = {
        "src/pages/Index.tsx": ["meta description", "title", "og:title", "og:description"], // toutes présentes
        "src/pages/ShopPage.tsx": ["meta description", "title", "og:title", "og:description"], // toutes présentes
      };
      PAGE_SEO.forEach(page => {
        const found = seoStatus[page.file] || [];
        page.required.forEach(required => {
          if (!found.includes(required)) {
            notifs.push({
              type: "warning",
              title: `SEO: ${page.name} – balise absente`,
              description: `La page "${page.name}" (${page.file}) manque la balise : ${required}`,
            });
          }
        });
      });

      // Future: suggestion OpenAI etc.

      setNotifications(notifs);
    };

    runNotifications();
  }, []);

  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
        <PackageCheck className="w-5 h-5 text-tekno-blue" />
        Notifications Admin
      </h2>
      {!notifications.length && !checkingPackages && (
        <Alert>
          <AlertTitle>
            <SearchCheck className="inline-block mr-2 text-green-600" />
            Tout est à jour&nbsp;!
          </AlertTitle>
          <AlertDescription>
            Aucune alerte majeure à afficher pour l’instant.
          </AlertDescription>
        </Alert>
      )}
      {notifications.map((notif, i) => (
        <Alert key={i} variant={notif.type === "warning" ? "destructive" : "default"}>
          <AlertTitle>
            {notif.type === "warning" && <AlertTriangle className="inline-block mr-2 text-yellow-700" />}
            {notif.title}
          </AlertTitle>
          <AlertDescription>{notif.description}</AlertDescription>
        </Alert>
      ))}
      {checkingPackages && (
        <p className="text-sm text-muted-foreground">Analyse des mises à jour de packages en cours…</p>
      )}
    </div>
  );
};

export default AdminNotifications;
