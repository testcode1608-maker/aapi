<?php
/**
 * AAPI - Public statistics endpoint
 *
 * This file documents the SQL endpoint expected by the React homepage.
 * The production PHP API is currently served from the separate aapi-api project.
 * Keep the same response contract when deploying this endpoint there.
 */

header('Content-Type: application/json; charset=utf-8');

// Expected response contract:
// {
//   "success": true,
//   "data": {
//     "projects": 0,
//     "investors": 0,
//     "investment_value": 0,
//     "jobs": 0
//   }
// }

// SQL used by the AAPI backend:
// SELECT COUNT(*) FROM projects;
// SELECT COUNT(*) FROM users WHERE role = 'investisseur' AND statut = 'actif';
// SELECT COALESCE(SUM(montant_investissement), 0) FROM projects WHERE statut <> 'archive';
// SELECT COALESCE(SUM(nombre_emplois), 0) FROM projects WHERE statut <> 'archive';

http_response_code(501);
echo json_encode([
    'success' => false,
    'message' => 'This endpoint is documented in the React repository. The live endpoint must be deployed in the separate aapi-api PHP backend.'
], JSON_UNESCAPED_UNICODE);
