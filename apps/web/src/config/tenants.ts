export interface Tenant {
  id: string
  label: string
  token: string
}

export const tenants: Tenant[] = [
  {
    id: "tenant_a",
    label: "Tenant A",
    token: "token-tenant-a",
  },
  {
    id: "tenant_b",
    label: "Tenant B",
    token: "token-tenant-b",
  },
]
