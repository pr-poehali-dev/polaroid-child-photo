import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

interface Effects {
  blur: number;
  flash: number;
  sepia: number;
  vignette: number;
  grain: number;
}

export default function PolaroidEditor() {
  const [image, setImage] = useState<string | null>(null);
  const [effects, setEffects] = useState<Effects>({
    blur: 0,
    flash: 30,
    sepia: 50,
    vignette: 40,
    grain: 20
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
        toast.success('Фото загружено!');
      };
      reader.readAsDataURL(file);
    }
  };

  const applyEffects = () => {
    if (!image || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      ctx.filter = `
        blur(${effects.blur}px) 
        sepia(${effects.sepia}%) 
        brightness(${1 + effects.flash / 100})
      `;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        const distX = (i / 4) % canvas.width - canvas.width / 2;
        const distY = Math.floor(i / 4 / canvas.width) - canvas.height / 2;
        const distance = Math.sqrt(distX * distX + distY * distY);
        const maxDistance = Math.sqrt(canvas.width * canvas.width + canvas.height * canvas.height) / 2;
        const vignette = 1 - (distance / maxDistance) * (effects.vignette / 100);

        data[i] *= vignette;
        data[i + 1] *= vignette;
        data[i + 2] *= vignette;

        const grain = (Math.random() - 0.5) * effects.grain;
        data[i] += grain;
        data[i + 1] += grain;
        data[i + 2] += grain;
      }

      ctx.putImageData(imageData, 0, 0);
    };
    img.src = image;
  };

  useEffect(() => {
    if (image) {
      applyEffects();
    }
  }, [image, effects]);

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = 'polaroid-photo.png';
    link.href = canvasRef.current.toDataURL();
    link.click();
    toast.success('Фото сохранено!');
  };

  return (
    <div className="min-h-screen p-4 md:p-8" style={{ background: 'linear-gradient(135deg, #FEF7CD 0%, #D4A574 100%)' }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-5xl md:text-6xl font-bold mb-3" style={{ fontFamily: 'Caveat, cursive', color: '#8E6F3E' }}>
            Polaroid Studio
          </h1>
          <p className="text-lg" style={{ fontFamily: 'Caveat, cursive', color: '#8E6F3E' }}>
            Винтажные фото как в 70-х
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <Card className="p-8 shadow-2xl" style={{ background: '#FAF5E8', border: '3px solid #8E6F3E' }}>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2" style={{ fontFamily: 'Caveat, cursive', color: '#8E6F3E' }}>
                <Icon name="Camera" size={28} />
                Загрузить фото
              </h2>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-16 text-xl font-bold shadow-lg hover:scale-105 transition-transform"
                style={{ 
                  fontFamily: 'Caveat, cursive', 
                  background: '#8E6F3E',
                  color: '#FEF7CD'
                }}
              >
                <Icon name="Upload" size={24} className="mr-2" />
                Выбрать фотографию
              </Button>
            </Card>

            {image && (
              <Card className="p-8 shadow-2xl" style={{ background: '#FAF5E8', border: '3px solid #8E6F3E' }}>
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2" style={{ fontFamily: 'Caveat, cursive', color: '#8E6F3E' }}>
                  <Icon name="Sparkles" size={28} />
                  Эффекты камеры
                </h2>
                <div className="space-y-6">
                  <div>
                    <Label className="text-lg mb-2 flex items-center gap-2" style={{ fontFamily: 'Caveat, cursive', color: '#8E6F3E' }}>
                      <Icon name="Droplet" size={20} />
                      Размытие: {effects.blur}
                    </Label>
                    <Slider
                      value={[effects.blur]}
                      onValueChange={(val) => setEffects({ ...effects, blur: val[0] })}
                      max={5}
                      step={0.1}
                      className="my-2"
                    />
                  </div>

                  <div>
                    <Label className="text-lg mb-2 flex items-center gap-2" style={{ fontFamily: 'Caveat, cursive', color: '#8E6F3E' }}>
                      <Icon name="Zap" size={20} />
                      Вспышка: {effects.flash}
                    </Label>
                    <Slider
                      value={[effects.flash]}
                      onValueChange={(val) => setEffects({ ...effects, flash: val[0] })}
                      max={100}
                      step={1}
                      className="my-2"
                    />
                  </div>

                  <div>
                    <Label className="text-lg mb-2 flex items-center gap-2" style={{ fontFamily: 'Caveat, cursive', color: '#8E6F3E' }}>
                      <Icon name="Palette" size={20} />
                      Сепия: {effects.sepia}
                    </Label>
                    <Slider
                      value={[effects.sepia]}
                      onValueChange={(val) => setEffects({ ...effects, sepia: val[0] })}
                      max={100}
                      step={1}
                      className="my-2"
                    />
                  </div>

                  <div>
                    <Label className="text-lg mb-2 flex items-center gap-2" style={{ fontFamily: 'Caveat, cursive', color: '#8E6F3E' }}>
                      <Icon name="Circle" size={20} />
                      Виньетка: {effects.vignette}
                    </Label>
                    <Slider
                      value={[effects.vignette]}
                      onValueChange={(val) => setEffects({ ...effects, vignette: val[0] })}
                      max={100}
                      step={1}
                      className="my-2"
                    />
                  </div>

                  <div>
                    <Label className="text-lg mb-2 flex items-center gap-2" style={{ fontFamily: 'Caveat, cursive', color: '#8E6F3E' }}>
                      <Icon name="Grid3x3" size={20} />
                      Зерно: {effects.grain}
                    </Label>
                    <Slider
                      value={[effects.grain]}
                      onValueChange={(val) => setEffects({ ...effects, grain: val[0] })}
                      max={50}
                      step={1}
                      className="my-2"
                    />
                  </div>
                </div>

                <Button
                  onClick={handleDownload}
                  className="w-full mt-6 h-14 text-xl font-bold shadow-lg hover:scale-105 transition-transform"
                  style={{ 
                    fontFamily: 'Caveat, cursive', 
                    background: '#8E6F3E',
                    color: '#FEF7CD'
                  }}
                >
                  <Icon name="Download" size={24} className="mr-2" />
                  Сохранить фото
                </Button>
              </Card>
            )}
          </div>

          <div>
            <Card 
              className="p-8 shadow-2xl min-h-[600px] flex items-center justify-center"
              style={{ 
                background: '#FFFFFF',
                border: '20px solid #FAF5E8',
                boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
              }}
            >
              {image ? (
                <div className="relative w-full">
                  <canvas
                    ref={canvasRef}
                    className="w-full h-auto"
                    style={{ 
                      boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                      maxHeight: '600px',
                      objectFit: 'contain'
                    }}
                  />
                  <div 
                    className="text-center mt-6 text-2xl"
                    style={{ 
                      fontFamily: 'Caveat, cursive', 
                      color: '#8E6F3E'
                    }}
                  >
                    Memories · {new Date().getFullYear()}
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <Icon name="Image" size={80} style={{ color: '#D4A574', margin: '0 auto' }} />
                  <p className="text-2xl" style={{ fontFamily: 'Caveat, cursive', color: '#8E6F3E' }}>
                    Загрузите фото для начала
                  </p>
                </div>
              )}
            </Card>
          </div>
        </div>

        <div className="mt-12 text-center space-y-4">
          <div className="flex justify-center gap-4 flex-wrap">
            {['📷', '✨', '🎞️', '📸', '🌟'].map((emoji, i) => (
              <span 
                key={i} 
                className="text-4xl animate-pulse"
                style={{ animationDelay: `${i * 0.2}s` }}
              >
                {emoji}
              </span>
            ))}
          </div>
          <p className="text-lg" style={{ fontFamily: 'Caveat, cursive', color: '#8E6F3E' }}>
            Создавайте уникальные винтажные снимки
          </p>
        </div>
      </div>
    </div>
  );
}
