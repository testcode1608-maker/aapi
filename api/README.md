# AAPI statistics API contract

The React homepage reads real statistics from:

`http://localhost/aapi-api/statistics.php`

The live PHP endpoint belongs to the separate `aapi-api` backend and must return JSON in this shape:

```json
{
  "success": true,
  "data": {
    "projects": 57,
    "investors": 53,
    "investment_value": 2407500000,
    "jobs": 3433
  }
}
```

SQL fields used by the backend:

- `projects.id` → project count
- `users.role = 'investisseur'` and `users.statut = 'actif'` → active investors
- `projects.montant_investissement` → investment value
- `projects.nombre_emplois` → jobs

For investment value and jobs, archived projects are excluded with `statut <> 'archive'`.
