… Voici le plan proposé pour intégrer Discogs dans la partie admin.

## 1. Base de données (Supabase)

3 nouvelles tables :

**`discogs_releases`** — catalogue des releases du label 1625918
- release_id (int, unique), title, artist, year, thumbnail, discogs_url
- current_collection_count, current_wantlist_count
- last_synced_at, created_at, updated_at

**`discogs_stats_history`** — historique pour calcul des deltas
- release_id, collection_count, wantlist_count
- delta_collection, delta_wantlist, recorded_at

**`discogs_sync_state`** — état global
- last_full_sync_at, last_release_sync_at
- unseen_collection_delta, unseen_wantlist_delta (cumul depuis dernière visite admin)
- last_admin_viewed_at

RLS : lecture/écriture admin uniquement. Edge functions utilisent `service_role`.

## 2. Secrets

Ajout via le tool secrets :
- `DISCOGS_CONSUMER_KEY`
- `DISCOGS_CONSUMER_SECRET`
- `DISCOGS_USER_TOKEN` (suffisant pour lire stats publiques d'un label — pas besoin de full OAuth flow pour ce use case)

Note : pour ce besoin (lire releases publiques d'un label + counts collection/wantlist), le **personal access token** Discogs suffit. OAuth complet n'est nécessaire que si on veut agir au nom d'utilisateurs tiers. Je propose donc d'utiliser le token, plus simple et largement suffisant. Dis-moi si tu veux quand même le flow OAuth complet.

## 3. Edge functions

**`discogs-sync-releases`** (manuel + 1×/jour via cron)
- GET `/labels/1625918/releases?per_page=100` paginé
- Upsert dans `discogs_releases`

**`discogs-sync-stats`** (cron toutes les 30 min)
- Pour chaque release, GET `/releases/{id}` → `community.have` / `community.want`
- Batch séquentiel avec délai (60 req/min auth = 1s entre appels)
- Compare avec ancienne valeur, écrit ligne dans `discogs_stats_history` avec deltas
- Met à jour `current_*_count` et incrémente `unseen_*_delta` dans `discogs_sync_state`
- Respecte rate limit Discogs (header `X-Discogs-Ratelimit-Remaining`)

**`discogs-mark-seen`**
- Reset des `unseen_*_delta` quand admin ouvre l'onglet

Cron via `pg_cron` + `pg_net` qui POST sur les edge functions.

## 4. UI Admin

Nouvel onglet **"Discogs"** dans `AdminSidebar.tsx` (icône Disc3) avec badge rouge si `unseen_collection_delta + unseen_wantlist_delta > 0`.

Composant `DiscogsManagement.tsx` :
- Header : bouton "Synchroniser maintenant", date dernier sync, total releases
- Grille de cartes responsive (thumbnail, titre, artiste, année)
- Sur chaque carte : badges animés "Collection: 123 (+3)" / "Wantlist: 58 (+5)"
- Filtre/tri : nouveautés en haut, recherche par titre/artiste
- Loading skeletons, gestion erreurs API
- Drawer/modal détails release avec mini-graph historique (recharts)

À l'ouverture de l'onglet → appel `discogs-mark-seen` pour reset des badges.

## 5. Architecture

```text
supabase/functions/
  discogs-sync-releases/index.ts   ← import releases label
  discogs-sync-stats/index.ts      ← cron 30min, deltas
  discogs-mark-seen/index.ts       ← reset badges

src/components/admin/
  DiscogsManagement.tsx            ← onglet principal
  discogs/
    ReleaseCard.tsx
    DeltaBadge.tsx
    SyncButton.tsx
    ReleaseDetailDialog.tsx
  AdminSidebar.tsx                 ← +entrée Discogs +badge
src/hooks/useDiscogs.ts            ← fetch + mark-seen
```

## 6. Points clés respect rate limit
- User-Agent obligatoire `TeknolandApp/1.0`
- Authorization: `Discogs token=...` → 60 req/min
- Délai 1100ms entre requêtes dans `discogs-sync-stats`
- Si `X-Discogs-Ratelimit-Remaining` < 5 → sleep 60s
- Sync stats par batch de 50 releases max par invocation, curseur stocké dans `discogs_sync_state`

## 7. Questions avant de lancer

1. **OAuth complet ou simple token ?** Je recommande le token (suffit pour ce use case). OK ?
2. **Confirmes-tu que je peux te demander les 3 secrets Discogs maintenant ?**
3. **Fréquence cron** : 30 min comme demandé, confirmé ?

Dis "ok" pour que je lance la migration SQL + secrets + code.
