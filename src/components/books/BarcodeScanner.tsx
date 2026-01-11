import { useState, useRef, useEffect, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, Trash2, Plus, Save, X, Keyboard, Volume2 } from 'lucide-react';
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

interface ScannedCode {
  code: string;
  count: number;
}

// Simple beep sound function
const playBeep = () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800; // Frequency in Hz
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime); // Low volume
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  } catch (e) {
    console.debug('Audio not available:', e);
  }
};

export function BarcodeScanner({ open, onOpenChange, onSaveDrafts }: BarcodeScannerProps) {
  const { toast } = useToast();
  const [scannedCodes, setScannedCodes] = useState<ScannedCode[]>([]);
  const [manualCode, setManualCode] = useState('');
  const [scannerActive, setScannerActive] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const html5QrcodeRef = useRef<Html5Qrcode | null>(null);
  const manualInputRef = useRef<HTMLInputElement>(null);
  const lastScannedRef = useRef<string>('');
  const scanCooldownRef = useRef<number>(0);

  const handleScanSuccess = useCallback((decodedText: string) => {
    const now = Date.now();
    
    // 3 second cooldown to allow user to change books
    if (now - scanCooldownRef.current < 3000) {
      return;
    }
    
    scanCooldownRef.current = now;
    
    // Play beep sound
    playBeep();

    setScannedCodes(prev => {
      const existing = prev.find(c => c.code === decodedText);
      if (existing) {
        // Increment counter for duplicates
        if (decodedText !== lastScannedRef.current) {
          toast({
            title: 'Código repetido',
            description: `ISBN: ${decodedText} (${existing.count + 1}x)`,
          });
        }
        lastScannedRef.current = decodedText;
        return prev.map(c => 
          c.code === decodedText ? { ...c, count: c.count + 1 } : c
        );
      } else {
        lastScannedRef.current = decodedText;
        toast({
          title: 'Código escaneado',
          description: `ISBN: ${decodedText}`,
        });
        return [...prev, { code: decodedText, count: 1 }];
      }
    });
  }, [toast]);

  const startScanner = useCallback(async () => {
    if (html5QrcodeRef.current || isStarting) return;
    
    setIsStarting(true);
    
    try {
      const html5Qrcode = new Html5Qrcode('reader');
      html5QrcodeRef.current = html5Qrcode;
      
      // Get cameras and prefer back camera on mobile
      const devices = await Html5Qrcode.getCameras();
      let cameraId = devices[0]?.id;
      
      // Try to find back camera
      const backCamera = devices.find(d => 
        d.label.toLowerCase().includes('back') || 
        d.label.toLowerCase().includes('traseira') ||
        d.label.toLowerCase().includes('rear')
      );
      if (backCamera) {
        cameraId = backCamera.id;
      }

      await html5Qrcode.start(
        cameraId || { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 100 },
          aspectRatio: 1.0,
        },
        handleScanSuccess,
        () => {} // Ignore errors
      );
      
      setScannerActive(true);
    } catch (error) {
      console.error('Failed to start scanner:', error);
      toast({
        title: 'Erro ao iniciar câmera',
        description: 'Verifique as permissões de câmera do navegador.',
        variant: 'destructive',
      });
      html5QrcodeRef.current = null;
    } finally {
      setIsStarting(false);
    }
  }, [handleScanSuccess, toast, isStarting]);

  const stopScanner = useCallback(async () => {
    if (html5QrcodeRef.current) {
      try {
        await html5QrcodeRef.current.stop();
        html5QrcodeRef.current = null;
      } catch (e) {
        console.error('Error stopping scanner:', e);
      }
      setScannerActive(false);
    }
  }, []);

  // Auto-start camera when dialog opens
  useEffect(() => {
    if (open) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        startScanner();
      }, 300);
      return () => clearTimeout(timer);
    } else {
      stopScanner();
      setScannedCodes([]);
      setManualCode('');
      lastScannedRef.current = '';
      scanCooldownRef.current = 0;
    }
  }, [open, startScanner, stopScanner]);

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, [stopScanner]);

  const addManualCode = () => {
    const code = manualCode.trim();
    if (!code) return;

    playBeep();

    setScannedCodes(prev => {
      const existing = prev.find(c => c.code === code);
      if (existing) {
        toast({
          title: 'Código repetido',
          description: `ISBN: ${code} (${existing.count + 1}x)`,
        });
        return prev.map(c => 
          c.code === code ? { ...c, count: c.count + 1 } : c
        );
      }
      toast({
        title: 'Código adicionado',
        description: `ISBN: ${code}`,
      });
      return [...prev, { code, count: 1 }];
    });

    setManualCode('');
    manualInputRef.current?.focus();
  };

  const removeCode = (code: string) => {
    setScannedCodes(prev => prev.filter(c => c.code !== code));
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

    // Expand codes based on count
    const expandedCodes = scannedCodes.flatMap(c => 
      Array(c.count).fill(c.code)
    );
    
    onSaveDrafts(expandedCodes);
    onOpenChange(false);
  };

  // Handle USB barcode scanner (keyboard input)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addManualCode();
    }
  };

  const totalItems = scannedCodes.reduce((sum, c) => sum + c.count, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera size={20} />
            Scanner de Códigos de Barras
          </DialogTitle>
          <DialogDescription>
            A câmera iniciará automaticamente. Posicione o código de barras na área de leitura.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          {/* Camera Scanner - starts automatically */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium flex items-center gap-2">
                <Camera size={16} />
                Câmera {scannerActive && <Badge variant="default" className="text-xs">Ativa</Badge>}
              </span>
              <div className="flex items-center gap-2">
                <Volume2 size={14} className="text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Som ativado</span>
              </div>
            </div>
            <div 
              id="reader" 
              className={`w-full rounded-lg overflow-hidden bg-muted min-h-[200px] ${!scannerActive && !isStarting ? 'flex items-center justify-center' : ''}`}
            >
              {!scannerActive && !isStarting && (
                <Button onClick={startScanner} variant="outline">
                  <Camera size={16} className="mr-2" />
                  Iniciar Câmera
                </Button>
              )}
              {isStarting && (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Iniciando câmera...
                </div>
              )}
            </div>
            {scannerActive && (
              <p className="text-xs text-center text-muted-foreground">
                Aguarde 3 segundos entre cada leitura para trocar o livro
              </p>
            )}
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
          <div className="space-y-2 flex-1 overflow-hidden flex flex-col min-h-0">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                Códigos ({scannedCodes.length} únicos, {totalItems} total)
              </span>
              {scannedCodes.length > 0 && (
                <Button size="sm" variant="ghost" onClick={clearAll}>
                  <Trash2 size={14} className="mr-1" />
                  Limpar
                </Button>
              )}
            </div>
            
            {scannedCodes.length > 0 ? (
              <ScrollArea className="flex-1 border rounded-lg p-2">
                <div className="space-y-2">
                  {scannedCodes.map((item, index) => (
                    <div 
                      key={item.code} 
                      className="flex items-center justify-between p-2 bg-muted rounded"
                    >
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{index + 1}</Badge>
                        <span className="font-mono text-sm">{item.code}</span>
                        {item.count > 1 && (
                          <Badge variant="secondary" className="text-xs">
                            {item.count}x
                          </Badge>
                        )}
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6"
                        onClick={() => removeCode(item.code)}
                      >
                        <X size={14} />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="flex-1 border rounded-lg flex items-center justify-center text-muted-foreground min-h-[100px]">
                Nenhum código escaneado
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={scannedCodes.length === 0}>
            <Save size={16} className="mr-2" />
            Salvar Rascunhos ({totalItems})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
