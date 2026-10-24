# MRVN Id Admin (fork of ory-ui-console)

- **Upstream:** https://github.com/THEDANIIEL/ory-ui-console
- **Fork:** https://github.com/MarvinSMX/ory-ui-console
- **URL:** https://id-admin.internal.mrvn.me
- **Image:** `ghcr.io/marvinsmx/ory-ui-console` (linux/arm64 + amd64)
- **Auth:** Oathkeeper `X-User` / `X-Authenticated` + Kratos `metadata_public.groups ⊇ admins` (`TRUST_EDGE=1`)
- **Style:** auth/web tokens — DotField vignette, glass, MRVN mark, dark-only (no Ory chrome)

## Cluster env

| Var | Value |
|---|---|
| `KRATOS_ADMIN_URL` | `http://kratos-admin.ory.svc.cluster.local` |
| `HYDRA_ADMIN_URL` | `http://hydra-admin.ory.svc.cluster.local` |
| `TRUST_EDGE` | `1` |
| `REQUIRED_ADMIN_GROUP` | `admins` |
| `SESSION_SECRET` | from Secret `ory-ui-console-secrets` |
| `KETO_*` | optional (unset = Keto pages error gracefully) |

Flux: `infrastructure/base/ory/auth-admin/` keeps Service/VS name `auth-admin` → `id-admin.internal.mrvn.me`.
