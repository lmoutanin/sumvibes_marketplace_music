"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Send } from "lucide-react";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setSent(true);
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="relative min-h-screen bg-gradient-premium">
      <Navbar />

      <main className="pt-20">
        <section className="px-6 py-12 md:py-16">
          <div className="mx-auto max-w-2xl">
            <h1 className="text-4xl md:text-6xl font-bold font-display mb-4">
              Contactez-<span className="text-gradient">nous</span>
            </h1>
            <p className="text-xl text-slate-400">
              Une question, une suggestion ou un partenariat ? Notre équipe est à votre écoute.
            </p>
          </div>
        </section>

        <section className="px-6 pb-24">
          <div className="mx-auto max-w-2xl">
            {sent ? (
              <div className="glass rounded-3xl p-12 text-center">
                <div className="mb-6"><Send className="w-12 h-12 text-green-400 mx-auto" /></div>
                <h2 className="text-2xl font-bold mb-4">Message envoyé !</h2>
                <p className="text-slate-400 mb-6">Nous vous répondrons dans les 24 à 48 heures.</p>
                <button onClick={() => setSent(false)} className="glass rounded-xl px-6 py-3 font-semibold hover:bg-white/10">
                  Envoyer un autre message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="glass rounded-3xl p-8 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-slate-300">Nom complet</label>
                    <input
                      type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Votre nom"
                      className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-gold/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-slate-300">Email</label>
                    <input
                      type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="votre@email.com"
                      className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-gold/50"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-slate-300">Sujet</label>
                  <input
                    type="text" required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    placeholder="Objet de votre message"
                    className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-gold/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-slate-300">Message</label>
                  <textarea
                    required value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Décrivez votre demande en détail..."
                    rows={6}
                    className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-gold/50 resize-none"
                  />
                </div>
                <button
                  type="submit" disabled={loading}
                  className="w-full btn-primary bg-brand-gold text-black py-4 font-bold text-lg flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-6 h-6 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  ) : (
                    <><Send className="w-5 h-5" /> Envoyer le message</>
                  )}
                </button>
              </form>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
