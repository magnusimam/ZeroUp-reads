import React from 'react';
import ActionTree from './ActionTree';

export default function WhatYouCanDo() {
  const actions = [
    {
      id: 1,
      emoji:'📚',
      title: 'Read',
      description: 'Explore hundreds of Africans-language books - stories, science, history and more. free for every child.',
      cta: 'Start Reading',
      link: '/library',
      color: '#0d9488',
      bg: '#CCFBF1',
    },
    {
      id: 2,
      emoji: '📚',
      title: 'Translate',
      description: 'Any book can be translated into Hausa, Yoruba, Igbo, Swahili, Zulu and more - instantly with AI.',
      cta: 'See How',
      link: '/library',
      color: '#D97706',
      bg: '#FEF3C7',
    },
    {
      id: 3,
      emoji:'📚',
      title:'Support',
      description:'Help us preserve endangered African languages and build book security for every child on the continent.',
      cta: 'Get involved',
      link: '/about',
      color: '#7c3AED',
      bg: '#EDE9FE',
    },
  ];

  return (
    <section style={{
      padding:'80px 24px',
      background: 'var(--cream, #FFFBF5)',
      textAlign:'center',
    }}>
      {/* Section heading */}

      <div style={{ maxWidth: 600, margin: ' 0 auto 56px'}}>
        <span style={{
          display: 'inline-block',
          background: '#CCFBF1',
          color: '#0D9488',
          fontSize:12,
          fontWeight:700,
          letterSpacing: 2,
          padding:'6px 16px',
          borderRadius:99,
          marginBottom: 16,
          fontFamily:'Nunito',
          textTransform:'uppercase',
        }}>
          What you can do
        </span>
        <h2 style={{
          fontFamily: 'Nunito',
          fontWeight: 900,
          fontSize: 'clamp(24px, 4vw,36px)',
          color: 'var(--navy, #0F172A)',
          lineHeight:1.3,
          marginBottom: 16,
        }}>
          More Than Just Reading
        </h2>
        <p style={{
          fontFamily: 'Nunito Sans',
          fontSize: 16,
          color: '#64748B',
          lineHeight: 1.7,
        }}>
          Zeroup Reads is a full ecosystem for African-language literacy -
          read, translate, and help preserve language for the next generation.
        </p>
      </div>

      <ActionTree actions={actions} />
    </section>
  );
}
