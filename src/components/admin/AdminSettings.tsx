import React from 'react';
import { useState, useEffect, useRef } from 'react';
import { getMetaPixelId, saveMetaPixelId, trackPixelEvent } from '../../lib/metaPixel';
import { getStoreSettings, saveStoreSettings, StoreSettings } from '../../lib/storeSettings';
import { compressImage } from '../../lib/imageUtils';
import logoDefault from '../../assets/logo.jpg';
import { 
  Target, Check, AlertCircle, ExternalLink, Activity, Info, 
  Upload, Image as ImageIcon, Key, Trash2, RefreshCw, Sparkles, Building2
} from 'lucide-react';

export function AdminSettings() {
  // Store Settings (Logo, Store Name, UploadThing Token)
  const [settings, setSettings] = useState<StoreSettings>({
    logoUrl: '',
    storeName: 'VISIOTTICA',
    storeSubtitle: 'EYEWEAR',
    uploadthingToken: ''
  });
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [logoInputType, setLogoInputType] = useState<'upload' | 'url'>('upload');
  const [customLogoUrl, setCustomLogoUrl] = useState('');
  const [isProcessingLogo, setIsProcessingLogo] = useState(false);
  const [settingsSavedSuccess, setSettingsSavedSuccess] = useState(false);
  const [settingsError, setSettingsError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Meta Pixel state
  const [pixelId, setPixelId] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [testSuccess, setTestSuccess] = useState(false);

  useEffect(() => {
    // Load Meta Pixel
    const currentPixel = getMetaPixelId();
    setPixelId(currentPixel);

    // Load Store Settings
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      const data = await getStoreSettings();
      setSettings(data);
      if (data.logoUrl) {
        setLogoPreview(data.logoUrl);
        setCustomLogoUrl(data.logoUrl);
      }
    } catch (e) {
      console.warn('Error loading store settings:', e);
    }
  }

  // Handle Logo Upload & Compression
  const handleLogoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingLogo(true);
    setSettingsError('');
    try {
      // Compress logo to a clean size (max width 600px, 85% quality)
      const compressedDataUrl = await compressImage(file, 600, 0.85);
      setLogoPreview(compressedDataUrl);
      setCustomLogoUrl('');
    } catch (err: any) {
      console.error('Error processing logo image:', err);
      setSettingsError('Échec du traitement du logo. Veuillez essayer un autre fichier image.');
    } finally {
      setIsProcessingLogo(false);
    }
  };

  const handleApplyLogoUrl = () => {
    if (!customLogoUrl.trim()) return;
    setLogoPreview(customLogoUrl.trim());
  };

  const handleResetToDefaultLogo = () => {
    setLogoPreview('');
    setCustomLogoUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Save Branding & Credentials
  const handleSaveStoreSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessingLogo(true);
    setSettingsError('');
    try {
      const updated: Partial<StoreSettings> = {
        logoUrl: logoPreview.trim(),
        storeName: (settings.storeName || 'VISIOTTICA').trim(),
        storeSubtitle: (settings.storeSubtitle || 'EYEWEAR').trim(),
        uploadthingToken: (settings.uploadthingToken || '').trim()
      };

      await saveStoreSettings(updated);
      setSettings({
        ...settings,
        ...updated
      });
      setSettingsSavedSuccess(true);
      setTimeout(() => setSettingsSavedSuccess(false), 3500);
    } catch (err: any) {
      console.error('Failed to save settings:', err);
      setSettingsError('Une erreur est survenue lors de l\'enregistrement des paramètres.');
    } finally {
      setIsProcessingLogo(false);
    }
  };

  // Meta Pixel Handlers
  const handleSavePixel = (e: React.FormEvent) => {
    e.preventDefault();
    saveMetaPixelId(pixelId);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleSendTestEvent = () => {
    if (!pixelId.trim()) {
      alert('Veuillez d\'abord enregistrer votre ID Meta Pixel.');
      return;
    }
    trackPixelEvent('Lead', {
      content_name: 'Test Admin Lead Event',
      currency: 'DZD',
      value: 1000
    });
    setTestSuccess(true);
    setTimeout(() => setTestSuccess(false), 3000);
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Paramètres de la Boutique (Store Settings)</h2>
        <p className="text-sm text-slate-500">Personnalisez votre logo, l'identité de marque, les identifiants UploadThing et vos outils marketing.</p>
      </div>

      {/* 1. BRANDING & LOGO SECTION */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center border border-amber-100">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                Logo & Identité de Marque
                {logoPreview ? (
                  <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-0.5 rounded-full font-semibold">
                    Logo personnalisé
                  </span>
                ) : (
                  <span className="bg-slate-100 text-slate-600 text-xs px-2.5 py-0.5 rounded-full font-semibold">
                    Logo par défaut
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-500">
                Changez le logo affiché dans la barre de navigation du site client et le panneau d'administration.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSaveStoreSettings} className="space-y-6">
          {/* Logo Live Preview */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col sm:flex-row items-center gap-6">
            <div className="w-40 h-24 bg-white rounded-xl border border-slate-200 flex items-center justify-center p-3 shadow-xs overflow-hidden shrink-0">
              <img 
                src={logoPreview || logoDefault} 
                alt="Logo Preview" 
                className="max-h-full max-w-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = logoDefault;
                }}
              />
            </div>
            <div className="flex-1 space-y-2 text-center sm:text-left">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Aperçu en direct dans le Header</div>
              <div className="flex items-center gap-3 justify-center sm:justify-start">
                <span className="font-serif text-lg font-bold text-slate-900 leading-none">
                  {settings.storeName || 'VISIOTTICA'}
                </span>
                {settings.storeSubtitle && (
                  <span className="text-[10px] font-medium tracking-[0.25em] text-slate-500 uppercase">
                    {settings.storeSubtitle}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                Format conseillé : PNG ou JPG transparent ou sur fond blanc (ex: 400x120px).
              </p>
              {logoPreview && (
                <button
                  type="button"
                  onClick={handleResetToDefaultLogo}
                  className="text-xs text-rose-600 hover:text-rose-700 font-medium inline-flex items-center gap-1.5 transition-colors mt-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Rétablir le logo par défaut
                </button>
              )}
            </div>
          </div>

          {/* Logo Upload Switcher */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-semibold text-slate-700">
                Source du Logo
              </label>
              <div className="flex bg-slate-100 p-1 rounded-lg text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setLogoInputType('upload')}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    logoInputType === 'upload' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Téléverser (Fichier)
                </button>
                <button
                  type="button"
                  onClick={() => setLogoInputType('url')}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    logoInputType === 'url' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Lien URL Web
                </button>
              </div>
            </div>

            {logoInputType === 'upload' ? (
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <label className="flex-1 w-full border-2 border-dashed border-slate-300 hover:border-slate-400 bg-slate-50/50 hover:bg-slate-50 rounded-xl p-4 flex items-center justify-center gap-3 cursor-pointer transition-colors">
                  <Upload className="w-5 h-5 text-slate-500 shrink-0" />
                  <span className="text-sm font-medium text-slate-700">
                    Sélectionner une image de logo depuis votre appareil
                  </span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoFileChange}
                    className="hidden"
                  />
                </label>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="url"
                  value={customLogoUrl}
                  onChange={(e) => setCustomLogoUrl(e.target.value)}
                  placeholder="https://example.com/mon-logo.png"
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
                <button
                  type="button"
                  onClick={handleApplyLogoUrl}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors"
                >
                  Appliquer l'URL
                </button>
              </div>
            )}
          </div>

          {/* Store Name & Subtitle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Nom de la boutique (Store Name)
              </label>
              <input
                type="text"
                value={settings.storeName || ''}
                onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                placeholder="Ex: VISIOTTICA"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Sous-titre / Slogan (Subtitle)
              </label>
              <input
                type="text"
                value={settings.storeSubtitle || ''}
                onChange={(e) => setSettings({ ...settings, storeSubtitle: e.target.value })}
                placeholder="Ex: EYEWEAR ou OPTIQUE DE LUXE"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>

          {/* 2. UPLOADTHING CREDENTIALS SECTION */}
          <div className="border-t border-slate-100 pt-6 space-y-4">
            <div className="flex items-center gap-2">
              <Key className="w-5 h-5 text-indigo-600" />
              <h4 className="text-sm font-bold text-slate-900">
                UploadThing API Token (Hébergement Cloud Médias)
              </h4>
            </div>
            <p className="text-xs text-slate-500">
              Configurez ou mettez à jour votre token UploadThing directement depuis l'espace admin sans modifier le code source.
            </p>
            <div>
              <input
                type="password"
                value={settings.uploadthingToken || ''}
                onChange={(e) => setSettings({ ...settings, uploadthingToken: e.target.value })}
                placeholder="eyJhcGlLZXkiOiJ1dGtfYXBpXy4uLiIsImFwcElkIjoiLi4uIn0="
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-[11px] text-slate-400">
                  {settings.uploadthingToken ? '✓ Token configuré' : 'Aucun token UploadThing personnalisé renseigné'}
                </span>
                <a
                  href="https://uploadthing.com/dashboard"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
                >
                  Tableau de bord UploadThing <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          {/* Error & Success Alerts */}
          {settingsError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              {settingsError}
            </div>
          )}

          {settingsSavedSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-medium flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              Paramètres de marque et identifiants enregistrés avec succès ! Le logo est mis à jour sur tout le site.
            </div>
          )}

          {/* Submit button */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isProcessingLogo}
              className="bg-slate-900 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {isProcessingLogo ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Enregistrer les modifications
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* 3. META PIXEL CARD */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center border border-blue-100">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                Meta Pixel (Facebook & Instagram)
                {pixelId ? (
                  <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-0.5 rounded-full font-semibold">
                    Actif
                  </span>
                ) : (
                  <span className="bg-amber-100 text-amber-800 text-xs px-2.5 py-0.5 rounded-full font-semibold">
                    Non configuré
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-500">
                Suivez automatiquement les visites de pages, clics et commandes (achats) générés par vos publicités.
              </p>
            </div>
          </div>
          <a 
            href="https://adsmanager.facebook.com/events_manager2" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="hidden sm:flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-medium bg-blue-50 px-3 py-2 rounded-xl transition-colors"
          >
            Meta Events Manager
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <form onSubmit={handleSavePixel} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Pixel ID (Identifiant du pixel Meta)
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={pixelId}
                onChange={(e) => setPixelId(e.target.value)}
                placeholder="Exemple: 1234567890123456"
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
              <button
                type="submit"
                className="bg-slate-900 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                Enregistrer le Pixel
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-2 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              Vous trouverez votre Pixel ID à 15 ou 16 chiffres dans le Gestionnaire d'événements Meta (Events Manager).
            </p>
          </div>

          {savedSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-medium flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              Identifiant Meta Pixel enregistré avec succès ! Il est maintenant actif sur tout le site web.
            </div>
          )}
        </form>

        {/* Standard Events Tracked Info */}
        <div className="border-t border-slate-100 pt-6 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Événements automatiquement transmis à Meta
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2 text-slate-900 font-semibold text-xs mb-1">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                PageView
              </div>
              <p className="text-[11px] text-slate-500">
                Se déclenche dès qu'un visiteur arrive sur n'importe quelle page de la boutique.
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2 text-slate-900 font-semibold text-xs mb-1">
                <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                ViewContent
              </div>
              <p className="text-[11px] text-slate-500">
                Se déclenche sur la fiche produit avec le nom de la monture et le prix en DA.
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2 text-slate-900 font-semibold text-xs mb-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                Purchase (Achat)
              </div>
              <p className="text-[11px] text-slate-500">
                Se déclenche lors de la confirmation d'une commande client avec le montant total en DA.
              </p>
            </div>
          </div>
        </div>

        {/* Test Event Button */}
        {pixelId && (
          <div className="border-t border-slate-100 pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="text-xs text-slate-500">
              Vérifiez la connexion avec Meta Events Manager en envoyant un événement de test.
            </div>
            <button
              type="button"
              onClick={handleSendTestEvent}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Activity className="w-3.5 h-3.5 text-blue-600" />
              Tester l'événement Pixel
            </button>
          </div>
        )}

        {testSuccess && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-800 text-xs font-medium flex items-center gap-2">
            <Check className="w-4 h-4 text-blue-600 shrink-0" />
            Événement de test envoyé à Meta ! Vérifiez l'onglet "Tester les événements" dans Events Manager.
          </div>
        )}
      </div>

      {/* Meta Ad Launching Guide */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 space-y-4">
        <h3 className="text-lg font-bold text-white">Conseils pour lancer votre campagne Meta en Algérie</h3>
        <ul className="space-y-2.5 text-xs text-slate-300">
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 font-bold">1.</span>
            <span><strong>URL de destination</strong> : Utilisez l'adresse directe du produit (ex: <code className="bg-slate-800 px-1.5 py-0.5 rounded text-slate-200">/product/ID</code>) plutôt que la page d'accueil pour maximiser le taux de conversion.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 font-bold">2.</span>
            <span><strong>Paiement à la livraison</strong> : Mettez en avant "Paiement à la livraison (Cash on delivery) et livraison 58 wilayas" dans le texte de votre annonce Facebook/Instagram.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 font-bold">3.</span>
            <span><strong>Objectif de campagne</strong> : Dans Ads Manager, choisissez l'objectif <strong>Ventes (Sales)</strong> ou <strong>Trafic / Prospects (Leads)</strong> avec optimisation sur l'événement <em>Purchase</em>.</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
