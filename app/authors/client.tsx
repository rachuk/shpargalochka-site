'use client';

import { useState } from 'react';
import { Hero } from '@/components/Hero';
import { Benefits } from '@/components/Benefits';
import { HowItWorks } from '@/components/HowItWorks';
import { Stats } from '@/components/Stats';
import { RegistrationForm } from '@/components/RegistrationForm';

export function AuthorsClient() {
  const [showForm, setShowForm] = useState(false);

  return (
    <>
      <Hero onApply={() => setShowForm(true)} />
      <Benefits />
      <Stats />
      <HowItWorks />
      <section id="register" className="py-20 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4">
          {showForm ? (
            <RegistrationForm />
          ) : (
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-4">Готові почати?</h2>
              <p className="text-gray-600 mb-8 text-lg">Заповніть коротку анкету — і ми зв&apos;яжемося з вами протягом 24 годин</p>
              <button onClick={() => setShowForm(true)}
                className="bg-violet-700 hover:bg-violet-800 text-white px-10 py-4 rounded-xl text-lg font-semibold transition-colors cursor-pointer">
                Заповнити анкету
              </button>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
