import { useState, useRef, useEffect, useCallback } from 'react';
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';
import { Camera, Trash2, Plus, Save, X, Keyboard } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';

interface BarcodeScannerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaveDrafts: (codes: string[]) => void;
}

export function BarcodeScanner({ open, onOpenChange, onSaveDrafts }: BarcodeScannerProps) {
  const { toast } = useToast();
  const [scannedCodes, setScannedCodes] = useState<string[]>([]);
  const [manualCode, setManualCode] = useState('');
  const [scannerActive, setScannerActive] = useState(false);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const manualInputRef = useRef<HTMLInputElement>(null);
  const lastScannedRef = useRef<string>('');
  const scanCooldownRef = useRef<number>(0);

  const handleScanSuccess = useCallback((decodedText: string) => {
    const now = Date.now();
    
    // Prevent duplicate scans within 2 seconds cooldown
    if (decodedText === lastScannedRef.current && now - scanCooldownRef.current < 2000) {
      return;
    }
    
    lastScannedRef.current = decodedText;
    scanCooldownRef.current = now;

    if (!scannedCodes.includes(decodedText)) {
      setScannedCodes(prev => [...prev, decodedText]);
      toast({
        title: 'Código escaneado',
        description: `ISBN: ${decodedText}`,
      });
    } else {
      toast({
        title: 'Código duplicado',
        description: 'Este código já foi escaneado.',
        variant: 'destructive',
      });
    }
  }, [scannedCodes, toast]);

  const startScanner = useCallback(() => {
    if (scannerRef.current) return;

    const config = {
      fps: 10,
      qrbox: { width: 250, height: 100 },
      supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
      rememberLastUsedCamera: true,
    };

    scannerRef.current = new Html5QrcodeScanner('reader', config, false);
    scannerRef.current.render(handleScanSuccess, (error) => {
      // Ignore scan errors (common when no barcode in view)
      console.debug('Scan error:', error);
    });
    setScannerActive(true);
  }, [handleScanSuccess]);

  const stopScanner = useCallback(() => {
    if (scannerRef.current) {
      scannerRef.current.clear().catch(console.error);
      scannerRef.current = null;
      setScannerActive(false);
    }
  }, []);

  useEffect(() => {
    if (!open) {
      stopScanner();
      setScannedCodes([]);
      setManualCode('');
    }
  }, [open, stopScanner]);

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, [stopScanner]);

  const addManualCode = () => {
    const code = manualCode.trim();
    if (!code) return;

    if (scannedCodes.includes(code)) {
      toast({
        title: 'Código duplicado',
        description: 'Este código já foi adicionado.',
        variant: 'destructive',
      });
      return;
    }

    setScannedCodes(prev => [...prev, code]);
    setManualCode('');
    manualInputRef.current?.focus();
  };

  const removeCode = (code: string) => {
    setScannedCodes(prev => prev.filter(c => c !== code));
  };

  const clearAll = () => {
    setScannedCodes([]);
  };

  const handleSave = () => {
    if (scannedCodes.length === 0) {
      toast({
        title: 'Nenhum código',
        description: 'Escaneie ou digite pelo menos um código.',
        variant: 'destructive',
      });
      return;
    }

    onSaveDrafts(scannedCodes);
    onOpenChange(false);
  };

  // Handle USB barcode scanner (keyboard input)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addManualCode();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera size={20} />
            Scanner de Códigos de Barras
          </DialogTitle>
          <DialogDescription>
            Escaneie códigos ISBN com a câmera ou digite manualmente
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Camera Scanner */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Câmera</span>
              <Button
                size="sm"
                variant={scannerActive ? 'destructive' : 'outline'}
                onClick={scannerActive ? stopScanner : startScanner}
              >
                {scannerActive ? (
                  <>
                    <X size={14} className="mr-1" />
                    Parar
                  </>
                ) : (
                  <>
                    <Camera size={14} className="mr-1" />
                    Iniciar Câmera
                  </>
                )}
              </Button>
            </div>
            <div 
              id="reader" 
              className={`w-full rounded-lg overflow-hidden ${!scannerActive ? 'hidden' : ''}`}
            />
          </div>

          {/* Manual Input */}
          <div className="space-y-2">
            <span className="text-sm font-medium flex items-center gap-2">
              <Keyboard size={16} />
              Entrada Manual / Leitor USB
            </span>
            <div className="flex gap-2">
              <Input
                ref={manualInputRef}
                placeholder="Digite o ISBN ou código"
                value={manualCode}
                onChange={e => setManualCode(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <Button onClick={addManualCode} disabled={!manualCode.trim()}>
                <Plus size={16} />
              </Button>
            </div>
          </div>

          {/* Scanned Codes List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                Códigos Escaneados ({scannedCodes.length})
              </span>
              {scannedCodes.length > 0 && (
                <Button size="sm" variant="ghost" onClick={clearAll}>
                  <Trash2 size={14} className="mr-1" />
                  Limpar
                </Button>
              )}
            </div>
            
            {scannedCodes.length > 0 ? (
              <ScrollArea className="h-40 border rounded-lg p-2">
                <div className="space-y-2">
                  {scannedCodes.map((code, index) => (
                    <div 
                      key={code} 
                      className="flex items-center justify-between p-2 bg-muted rounded"
                    >
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{index + 1}</Badge>
                        <span className="font-mono text-sm">{code}</span>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6"
                        onClick={() => removeCode(code)}
                      >
                        <X size={14} />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="h-40 border rounded-lg flex items-center justify-center text-muted-foreground">
                Nenhum código escaneado
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={scannedCodes.length === 0}>
            <Save size={16} className="mr-2" />
            Salvar como Rascunhos ({scannedCodes.length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
