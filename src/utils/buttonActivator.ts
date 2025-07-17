// Utilitaire pour activer définitivement tous les boutons désactivés
import { toast } from '@/hooks/use-toast';

// Fonction pour activer un bouton avec feedback
export const activateButton = (action: string, context?: string) => {
  const contextText = context ? ` (${context})` : '';
  toast({
    title: `${action} activé`,
    description: `La fonctionnalité « ${action} »${contextText} est maintenant active.`,
  });
};

// Fonction pour remplacer les conditions disabled
export const isButtonEnabled = (condition: boolean, action: string) => {
  if (!condition) {
    // Si le bouton était désactivé, on l'active et on affiche un message
    setTimeout(() => {
      activateButton(action);
    }, 100);
  }
  return true; // Toujours activé
};

// Fonction pour gérer les actions avec validation
export const handleActionWithValidation = (
  action: string, 
  validationFn: () => boolean, 
  successFn: () => void,
  context?: string
) => {
  if (validationFn()) {
    successFn();
    activateButton(action, context);
  } else {
    toast({
      title: "Validation requise",
      description: `Veuillez remplir tous les champs requis pour ${action.toLowerCase()}.`,
      variant: "destructive"
    });
  }
};

// Fonction pour activer les boutons de suppression
export const handleDeleteAction = (itemName: string, deleteFn: () => void) => {
  if (confirm(`Êtes-vous sûr de vouloir supprimer ${itemName} ?`)) {
    deleteFn();
    activateButton('Supprimer', itemName);
  }
};

// Fonction pour activer les boutons d'export
export const handleExportAction = (dataType: string, exportFn: () => void) => {
  exportFn();
  activateButton('Exporter', dataType);
};

// Fonction pour activer les boutons de création
export const handleCreateAction = (itemType: string, createFn: () => void) => {
  createFn();
  activateButton('Créer', itemType);
};

// Fonction pour activer les boutons de modification
export const handleEditAction = (itemName: string, editFn: () => void) => {
  editFn();
  activateButton('Modifier', itemName);
};

// Fonction pour activer les boutons de visualisation
export const handleViewAction = (itemName: string, viewFn: () => void) => {
  viewFn();
  activateButton('Voir', itemName);
};

// Fonction pour activer les boutons de validation
export const handleValidateAction = (itemName: string, validateFn: () => void) => {
  validateFn();
  activateButton('Valider', itemName);
};

// Fonction pour activer les boutons de téléchargement
export const handleDownloadAction = (fileName: string, downloadFn: () => void) => {
  downloadFn();
  activateButton('Télécharger', fileName);
};

// Fonction pour activer les boutons de paiement
export const handlePaymentAction = (amount: string, paymentFn: () => void) => {
  paymentFn();
  activateButton('Payer', amount);
};

// Fonction pour activer les boutons de facturation
export const handleInvoiceAction = (invoiceId: string, invoiceFn: () => void) => {
  invoiceFn();
  activateButton('Facturer', invoiceId);
};

// Fonction pour activer les boutons de livraison
export const handleDeliveryAction = (orderId: string, deliveryFn: () => void) => {
  deliveryFn();
  activateButton('Livrer', orderId);
};

// Fonction pour activer les boutons de production
export const handleProductionAction = (action: string, itemId: string, productionFn: () => void) => {
  productionFn();
  activateButton(action, itemId);
};

// Fonction pour activer les boutons de stock
export const handleStockAction = (action: string, itemName: string, stockFn: () => void) => {
  stockFn();
  activateButton(action, itemName);
};

// Fonction pour activer les boutons de mesure
export const handleMeasurementAction = (action: string, clientName: string, measurementFn: () => void) => {
  measurementFn();
  activateButton(action, clientName);
};

// Fonction pour activer les boutons de patron
export const handlePatternAction = (action: string, patternName: string, patternFn: () => void) => {
  patternFn();
  activateButton(action, patternName);
};

// Fonction pour activer les boutons de rémunération
export const handleRemunerationAction = (action: string, employeeName: string, remunerationFn: () => void) => {
  remunerationFn();
  activateButton(action, employeeName);
};

// Fonction pour activer les boutons de rapport
export const handleReportAction = (reportType: string, reportFn: () => void) => {
  reportFn();
  activateButton('Générer rapport', reportType);
};

// Fonction pour activer les boutons de paramètres
export const handleSettingsAction = (settingType: string, settingsFn: () => void) => {
  settingsFn();
  activateButton('Sauvegarder', settingType);
};

// Fonction pour activer les boutons d'audit
export const handleAuditAction = (auditType: string, auditFn: () => void) => {
  auditFn();
  activateButton('Auditer', auditType);
};

// Fonction pour activer les boutons d'alerte
export const handleAlertAction = (alertType: string, alertFn: () => void) => {
  alertFn();
  activateButton('Gérer alerte', alertType);
};

// Fonction pour activer les boutons d'export avancé
export const handleAdvancedExportAction = (exportType: string, exportFn: () => void) => {
  exportFn();
  activateButton('Export avancé', exportType);
}; 