export interface DashboardUser {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string | null;
  role: string;
  statut: string;
  photo?: string | null;
  last_login?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface DashboardProfile {
  type_investisseur?: string | null;
  nom_entreprise?: string | null;
  registre_commerce?: string | null;
  nif?: string | null;
  nis?: string | null;
  wilaya?: string | null;
  commune?: string | null;
  adresse?: string | null;
  site_web?: string | null;
  secteur_activite?: string | null;
  description?: string | null;
}

export interface DashboardProject {
  id: number;
  titre: string;
  secteurs?: string | null;
  montant_investissement: number;
  nombre_emplois: number;
  statut: string;
  wilaya?: string | null;
  commune?: string | null;
  adresse?: string | null;
  superficie?: number | null;
  unite_superficie?: string | null;
  image?: string | null;
  date_debut?: string | null;
  date_fin?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface DashboardInvestment {
  id: number;
  user_id?: number;
  project_id?: number | null;
  montant: number;
  statut: string;
  reference?: string | null;
  date_investissement?: string | null;
  notes?: string | null;
  projet_titre?: string | null;
  projet_wilaya?: string | null;
  projet_statut?: string | null;
  projet_montant?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface DashboardRequest {
  id: number;
  user_id?: number;
  projet_id?: number | null;
  type_demande: string;
  objet: string;
  description?: string | null;
  montant_demande?: number | null;
  wilaya?: string | null;
  statut: string;
  priorite?: string | null;
  reponse?: string | null;
  traite_par?: number | null;
  date_traitement?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  projet_titre?: string | null;
}

export interface DashboardDocument {
  id: number;
  user_id?: number;
  project_id?: number | null;
  request_id?: number | null;
  titre: string;
  type_document: string;
  fichier?: string | null;
  nom_original?: string | null;
  extension?: string | null;
  taille?: number | null;
  statut: string;
  commentaire?: string | null;
  uploaded_at?: string | null;
  projet_titre?: string | null;
}

export interface DashboardMessage {
  id: number;
  sender_id: number;
  receiver_id: number;
  sujet?: string | null;
  contenu: string;
  lu: number;
  date_lecture?: string | null;
  created_at?: string | null;
  sender_nom?: string | null;
  sender_prenom?: string | null;
  sender_email?: string | null;
}

export interface DashboardNotification {
  id: number;
  titre: string;
  message: string;
  type: string;
  lien?: string | null;
  lu: number;
  date_lecture?: string | null;
  created_at?: string | null;
}

export interface DashboardStats {
  projects_total: number;
  projects_active: number;
  projects_completed: number;
  projects_in_study?: number;
  projects_submitted?: number;
  projects_approved?: number;
  projects_rejected?: number;
  projects_value?: number;
  total_jobs?: number;
  investments_total: number;
  investments_active: number;
  investments_completed?: number;
  investments_pending?: number;
  investments_cancelled?: number;
  total_investment: number;
  investment_ratio?: number;
  requests_total: number;
  requests_pending: number;
  requests_accepted?: number;
  requests_rejected?: number;
  documents_total: number;
  documents_validated?: number;
  documents_pending?: number;
  documents_rejected?: number;
  messages_total?: number;
  messages_unread: number;
  notifications_total?: number;
  notifications_unread: number;
  profile_completion?: number;
}

export interface DashboardActivity {
  title: string;
  text: string;
  date?: string | null;
  icon: string;
}

export interface DashboardLast {
  project?: DashboardProject | null;
  investment?: DashboardInvestment | null;
  request?: DashboardRequest | null;
  message?: DashboardMessage | null;
  notification?: DashboardNotification | null;
}

export interface DashboardResponse {
  success: boolean;
  message: string;
  user: DashboardUser;
  profile: DashboardProfile | null;
  stats: DashboardStats;
  projects: DashboardProject[];
  investments: DashboardInvestment[];
  requests: DashboardRequest[];
  documents: DashboardDocument[];
  messages: DashboardMessage[];
  notifications: DashboardNotification[];
  activities?: DashboardActivity[];
  last?: DashboardLast;
}

export interface CreateProjectForm {
  titre: string;
  description: string;
  wilaya: string;
  commune: string;
  adresse: string;
  montant_investissement: string;
  nombre_emplois: string;
  superficie: string;
  unite_superficie: string;
  sector_id: string;
  date_debut: string;
  date_fin: string;
}
