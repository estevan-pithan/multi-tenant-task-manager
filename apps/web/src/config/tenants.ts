export interface Tenant {
  id: string
  label: string
  token: string
}

export const tenants: Tenant[] = [
  {
    id: "tenant_a",
    label: "Tenant A",
    token: import.meta.env.VITE_TENANT_A_TOKEN,
  },
  {
    id: "tenant_b",
    label: "Tenant B",
    token: import.meta.env.VITE_TENANT_B_TOKEN,
  },
]
