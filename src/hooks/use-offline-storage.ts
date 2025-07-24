import { useState, useEffect, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';

interface OfflineData {
  id: string;
  type: 'create' | 'update' | 'delete';
  table: string;
  data: any;
  timestamp: number;
  synced: boolean;
}

interface OfflineStorageState {
  isOnline: boolean;
  pendingActions: OfflineData[];
  isSyncing: boolean;
  lastSync: Date | null;
}

interface PWAFeatures {
  isInstallable: boolean;
  isInstalled: boolean;
  notificationPermission: NotificationPermission;
  canInstall: boolean;
}

// Configuration IndexedDB
const DB_NAME = 'AtelierProOffline';
const DB_VERSION = 2;
const STORE_NAME = 'pendingActions';
const CACHE_STORE = 'cacheData';

class OfflineStorage {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Store pour les actions en attente
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('synced', 'synced', { unique: false });
        }

        // Store pour les données en cache
        if (!db.objectStoreNames.contains(CACHE_STORE)) {
          const cacheStore = db.createObjectStore(CACHE_STORE, { keyPath: 'key' });
          cacheStore.createIndex('expiry', 'expiry', { unique: false });
        }
      };
    });
  }

  async addPendingAction(action: Omit<OfflineData, 'id'>): Promise<string> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      
      const id = `${action.type}_${action.table}_${Date.now()}_${Math.random()}`;
      const data: OfflineData = { ...action, id, synced: false };
      
      const request = store.add(data);
      
      request.onsuccess = () => resolve(id);
      request.onerror = () => reject(request.error);
    });
  }

  async getPendingActions(): Promise<OfflineData[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async markAsSynced(id: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      
      const getRequest = store.get(id);
      
      getRequest.onsuccess = () => {
        const data = getRequest.result;
        if (data) {
          data.synced = true;
          const updateRequest = store.put(data);
          updateRequest.onsuccess = () => resolve();
          updateRequest.onerror = () => reject(updateRequest.error);
        } else {
          resolve();
        }
      };
      
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async removeSyncedActions(): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('synced');
      
      const request = index.openCursor(IDBKeyRange.only(true));
      
      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        } else {
          resolve();
        }
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  async clearAll(): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

// Instance globale
const offlineStorage = new OfflineStorage();

export function useOfflineStorage() {
  const [state, setState] = useState<OfflineStorageState>({
    isOnline: navigator.onLine,
    pendingActions: [],
    isSyncing: false,
    lastSync: null,
  });

  // Initialiser le stockage offline
  useEffect(() => {
    offlineStorage.init().then(() => {
      loadPendingActions();
    });
  }, []);

  // Surveiller la connectivité
  useEffect(() => {
    const handleOnline = () => {
      setState(prev => ({ ...prev, isOnline: true }));
      syncPendingActions();
    };

    const handleOffline = () => {
      setState(prev => ({ ...prev, isOnline: false }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Charger les actions en attente
  const loadPendingActions = useCallback(async () => {
    try {
      const actions = await offlineStorage.getPendingActions();
      setState(prev => ({ ...prev, pendingActions: actions }));
    } catch (error) {
      console.error('Erreur lors du chargement des actions en attente:', error);
    }
  }, []);

  // Ajouter une action en attente
  const addPendingAction = useCallback(async (
    type: 'create' | 'update' | 'delete',
    table: string,
    data: any
  ) => {
    try {
      const action: Omit<OfflineData, 'id'> = {
        type,
        table,
        data,
        timestamp: Date.now(),
        synced: false,
      };

      await offlineStorage.addPendingAction(action);
      await loadPendingActions();

      toast({
        title: "Action enregistrée",
        description: "L'action sera synchronisée quand vous serez en ligne.",
      });

      return true;
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'action:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer l'action hors ligne.",
        variant: "destructive",
      });
      return false;
    }
  }, [loadPendingActions]);

  // Synchroniser les actions en attente
  const syncPendingActions = useCallback(async () => {
    if (state.isSyncing) return;

    setState(prev => ({ ...prev, isSyncing: true }));

    try {
      const actions = await offlineStorage.getPendingActions();
      const unsyncedActions = actions.filter(action => !action.synced);

      if (unsyncedActions.length === 0) {
        setState(prev => ({ 
          ...prev, 
          isSyncing: false, 
          lastSync: new Date() 
        }));
        return;
      }

      let syncedCount = 0;
      let errorCount = 0;

      for (const action of unsyncedActions) {
        try {
          // Ici, vous devriez implémenter la logique de synchronisation
          // avec votre API Supabase
          await syncActionToSupabase(action);
          await offlineStorage.markAsSynced(action.id);
          syncedCount++;
        } catch (error) {
          console.error('Erreur lors de la synchronisation:', error);
          errorCount++;
        }
      }

      await loadPendingActions();
      await offlineStorage.removeSyncedActions();

      setState(prev => ({ 
        ...prev, 
        isSyncing: false, 
        lastSync: new Date() 
      }));

      if (syncedCount > 0) {
        toast({
          title: "Synchronisation terminée",
          description: `${syncedCount} actions synchronisées.`,
        });
      }

      if (errorCount > 0) {
        toast({
          title: "Erreurs de synchronisation",
          description: `${errorCount} actions n'ont pas pu être synchronisées.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erreur lors de la synchronisation:', error);
      setState(prev => ({ ...prev, isSyncing: false }));
      
      toast({
        title: "Erreur de synchronisation",
        description: "Impossible de synchroniser les données.",
        variant: "destructive",
      });
    }
  }, [state.isSyncing, loadPendingActions]);

  // Fonction pour synchroniser une action avec Supabase
  const syncActionToSupabase = async (action: OfflineData) => {
    // Cette fonction doit être implémentée selon vos besoins
    // Elle devrait utiliser votre client Supabase pour synchroniser les données
    
    console.log('Synchronisation de l\'action:', action);
    
    // Simulation d'une synchronisation
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Ici, vous devriez appeler votre API Supabase
    // Exemple :
    // const { error } = await supabase
    //   .from(action.table)
    //   [action.type](action.data);
    // if (error) throw error;
  };

  // Vider le cache
  const clearCache = useCallback(async () => {
    try {
      await offlineStorage.clearAll();
      await loadPendingActions();
      
      toast({
        title: "Cache vidé",
        description: "Toutes les données en cache ont été supprimées.",
      });
    } catch (error) {
      console.error('Erreur lors du vidage du cache:', error);
      toast({
        title: "Erreur",
        description: "Impossible de vider le cache.",
        variant: "destructive",
      });
    }
  }, [loadPendingActions]);

  return {
    ...state,
    addPendingAction,
    syncPendingActions,
    clearCache,
    loadPendingActions,
  };
} 