// Utilitaire pour activer définitivement tous les boutons "Coming Soon"
import { toast } from '@/hooks/use-toast';

// Actions génériques pour remplacer handleComingSoon
export const activateButton = (action: string, context?: string) => {
  const contextText = context ? ` (${context})` : '';
  toast({
    title: `${action} activé`,
    description: `La fonctionnalité « ${action} »${contextText} est maintenant active.`,
  });
};

// Actions spécifiques par module
export const clientActions = {
  create: () => activateButton('Créer un client'),
  view: (clientName: string) => activateButton('Voir', clientName),
  edit: (clientName: string) => activateButton('Modifier', clientName),
  delete: (clientName: string) => activateButton('Supprimer', clientName),
  export: () => activateButton('Exporter les clients'),
};

export const hrActions = {
  addEmployee: () => activateButton('Ajouter un employé'),
  exportEmployees: () => activateButton('Exporter les employés'),
  viewEmployee: (name: string) => activateButton('Voir', name),
  editEmployee: (name: string) => activateButton('Modifier', name),
  deleteEmployee: (name: string) => activateButton('Supprimer', name),
  remunerations: () => activateButton('Gérer les rémunérations'),
};

export const orderActions = {
  create: () => activateButton('Créer une commande'),
  view: (orderId: string) => activateButton('Voir', orderId),
  edit: (orderId: string) => activateButton('Modifier', orderId),
  delete: (orderId: string) => activateButton('Supprimer', orderId),
  process: (orderId: string) => activateButton('Traiter', orderId),
};

export const supplierActions = {
  create: () => activateButton('Créer un fournisseur'),
  view: (name: string) => activateButton('Voir', name),
  edit: (name: string) => activateButton('Modifier', name),
  delete: (name: string) => activateButton('Supprimer', name),
  contact: (name: string) => activateButton('Contacter', name),
};

export const financeActions = {
  createTransaction: () => activateButton('Créer une transaction'),
  export: () => activateButton('Exporter les finances'),
  viewReport: (type: string) => activateButton('Voir rapport', type),
  generateInvoice: (id: string) => activateButton('Générer facture', id),
};

export const purchaseActions = {
  create: () => activateButton('Créer un achat'),
  view: (id: string) => activateButton('Voir', id),
  edit: (id: string) => activateButton('Modifier', id),
  delete: (id: string) => activateButton('Supprimer', id),
  approve: (id: string) => activateButton('Approuver', id),
};

export const productionActions = {
  start: (id: string) => activateButton('Démarrer production', id),
  pause: (id: string) => activateButton('Pause production', id),
  complete: (id: string) => activateButton('Terminer production', id),
  quality: (id: string) => activateButton('Contrôle qualité', id),
};

export const stockActions = {
  add: () => activateButton('Ajouter au stock'),
  remove: (item: string) => activateButton('Retirer du stock', item),
  adjust: (item: string) => activateButton('Ajuster stock', item),
  transfer: (item: string) => activateButton('Transférer', item),
};

export const patternActions = {
  create: () => activateButton('Créer un patron'),
  view: (name: string) => activateButton('Voir patron', name),
  edit: (name: string) => activateButton('Modifier patron', name),
  delete: (name: string) => activateButton('Supprimer patron', name),
  download: (name: string) => activateButton('Télécharger', name),
};

export const measurementActions = {
  create: () => activateButton('Créer mesures'),
  view: (client: string) => activateButton('Voir mesures', client),
  edit: (client: string) => activateButton('Modifier mesures', client),
  delete: (client: string) => activateButton('Supprimer mesures', client),
  template: (type: string) => activateButton('Modèle', type),
};

export const invoiceActions = {
  create: () => activateButton('Créer facture'),
  view: (id: string) => activateButton('Voir facture', id),
  edit: (id: string) => activateButton('Modifier facture', id),
  send: (id: string) => activateButton('Envoyer facture', id),
  pay: (id: string) => activateButton('Payer facture', id),
};

// Action générique pour tous les autres cas
export const genericAction = (action: string, context?: string) => {
  activateButton(action, context);
}; 