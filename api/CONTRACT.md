# AAPI Statistics API

React endpoint: `http://localhost/aapi-api/statistics.php`

The separate PHP backend must return `success` and `data.projects`, `data.investors`, `data.investment_value`, and `data.jobs`.

Database mapping:
- projects → `COUNT(*)`
- active investors → `users` where role is `investisseur` and statut is `actif`
- investment value → `SUM(projects.montant_investissement)` excluding archived projects
- jobs → `SUM(projects.nombre_emplois)` excluding archived projects
