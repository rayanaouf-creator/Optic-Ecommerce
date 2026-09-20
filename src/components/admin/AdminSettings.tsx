import React from 'react';
import { useState, useEffect } from 'react';
import { getMetaPixelId, saveMetaPixelId, trackPixelEvent } from '../../lib/metaPixel';
import { Target, Check, AlertCircle, ExternalLink, Activity, Info } from 'lucide-react';

export function AdminSettings() {
  const [pixelId, setPixelId] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [testSuccess, setTestSuccess] = useState(false);

  useEffect(() => {
    const current = getMetaPixelId();
    setPixelId(current);
  }, []);

  const handleSave = (e: React.FormEvent) => {
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
        <h2 className="text-xl font-bold text-slate-900">Paramètres Marketing & Publicité (Marketing Settings)</h2>
        <p className="text-sm text-slate-500">Configurez votre Pixel Meta (Facebook & Instagram) pour vos campagnes publicitaires.</p>
      </div>

      {/* Meta Pixel Card */}
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

        <form onSubmit={handleSave} className="space-y-4">
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
