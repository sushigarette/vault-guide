import { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { BarcodePrinter } from './BarcodePrinter';
import { Product } from '@/types/stock';

interface PrintDialogProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

export const PrintDialog = ({ isOpen, onClose, product }: PrintDialogProps) => {
  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Impression des codes-barres</DialogTitle>
        </DialogHeader>
        <BarcodePrinter 
          product={product} 
          onClose={onClose} 
        />
      </DialogContent>
    </Dialog>
  );
};
