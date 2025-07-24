import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

const buttonNames = [
  'Créer', 'Modifier', 'Supprimer', 'Télécharger', 'Uploader',
  'Voir', 'Sauvegarder', 'Envoyer', 'Démarrer', 'Pause', 'Arrêter'
];

export function ButtonTester() {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <Button onClick={() => setOpen((v) => !v)}>{open ? 'Fermer' : 'Test Boutons'}</Button>
      {open && (
        <div className="flex flex-wrap gap-2 mt-4">
          {buttonNames.map((name) => (
                <Button
              key={name}
              onClick={() => toast({ title: `${name} activé` })}
              variant="outline"
            >
              {name}
            </Button>
          ))}
          </div>
      )}
    </div>
  );
} 