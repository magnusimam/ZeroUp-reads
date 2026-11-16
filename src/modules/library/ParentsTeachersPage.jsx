import React from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import useParentsTeachers from './useParentsTeachers';
import { AUDIENCE_TABS } from './parentsTeachersConfig';
import { ParentsTab, TeachersTab } from './components/ParentsTeachersTabs';

// Suggested books for parents (reading at home) and teachers (by subject and
// level). Reached from the Library page's two cards and Explore → Parents &
// Teachers; ?tab=teachers opens the Teachers tab.
export default function ParentsTeachersPage() {
  const pt = useParentsTeachers();

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--hero-cream)' }}>
      <Navbar />

      <header style={{ background: 'linear-gradient(135deg, #FFF1DC 0%, #EAF6EE 100%)' }}>
        <div className="max-w-content mx-auto w-full px-4 sm:px-6 pt-10 pb-6">
          <h1 className="font-nunito font-extrabold text-3xl sm:text-4xl" style={{ color: 'var(--navy)' }}>
            Parents <span style={{ color: 'var(--hero-orange)' }}>&amp;</span> Teachers
          </h1>
          <p className="font-nunito-sans text-base mt-2" style={{ color: 'var(--hero-ink)' }}>
            Suggested books for reading at home and teaching in class.
          </p>

          <div role="tablist" aria-label="Who are you choosing books for?" className="flex gap-2 mt-6">
            {AUDIENCE_TABS.map(t => {
              const active = pt.tab === t.id;
              return (
                <button
                  key={t.id}
                  role="tab"
                  aria-selected={active}
                  onClick={() => pt.setTab(t.id)}
                  className="inline-flex items-center gap-2 px-5 h-11 rounded-full font-nunito font-extrabold text-[15px] transition"
                  style={active
                    ? { background: 'var(--navy)', color: 'white', boxShadow: '0 6px 16px rgba(11,31,77,0.25)' }
                    : { background: 'white', color: 'var(--hero-ink)', border: '1.5px solid var(--hero-border)' }}
                >
                  <span aria-hidden="true">{t.icon}</span> {t.label}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      <main role="tabpanel" className="max-w-content mx-auto w-full px-4 sm:px-6 py-10 flex-1">
        {pt.tab === 'parents' ? (
          <ParentsTab shelves={pt.parentShelves} />
        ) : (
          <TeachersTab
            subjects={pt.subjects}
            subjectId={pt.subjectId}
            setSubjectId={pt.setSubjectId}
            levels={pt.levels}
            level={pt.level}
            setLevel={pt.setLevel}
            books={pt.teacherBooks}
            onClear={pt.clearTeacherFilters}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}
