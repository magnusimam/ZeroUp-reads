import React, {useState}from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const BOOKS = [
{ id: 1, title:'The Midnight Voyage', author: 'Elena Sterling', category:'Story Books', level:'Children', rating:4.9, color:'#1A3A5C'},
{ id: 2, title:'Shadows of the Grove', author: 'Marcus Thorne', category:'Story Books', level:'Young Adult', rating:4.7, color:'#2D1B4E'},
{ id: 3, title:'The Lighthouse Keeper', author: 'Sarah Penhaligon', category:'Story Books', level:'Children', rating:4.8, color:'#1A4A3A'},
{ id: 4, title:'Fables Of The Future', author: 'Orion Pax', category:'Story Books', level:'Student', rating:5.0, color:'#4A2A1A'},
{ id: 5, title:'The Architecture of Literacy', author: 'Dr Amara Osei', category:'Educational', level:'University', rating:4.8, color:'#1A2A4A1A3A5C'},
{ id: 6, title:'Principles of Logic', author: 'Pro Chidi Eze', category:'Educational', level:'Student', rating:4.6, color:'#2A1A4A'},
{ id: 7, title:'History of Syntax', author: 'Dr Fatima Malik', category:'Educational', level:'Educator', rating:4.7, color:'#1A3A2A'},
{ id: 8, title:'Creative Writing', author: 'Nkechi Adeyemi', category:'Educational', level:'Intermediate', rating:4.5, color:'#3A1A2A'},
]


export default function LibraryPage() {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('ALL')

  const categories = ['ALL', 'Story Books', 'Educational']

  const filtered = BOOKS.filter(book =>{
    const matchSearch = book.title.toLowerCase().includes(search.toLowerCase())
    const matchCategory = activeCategory === 'ALL' || book.category === activeCategory
    return matchSearch && matchCategory
  })

  const storyBooks = filtered.filter(b => b.category === 'Story Books')
  const eduBooks = filtered.filter(b => b.category === 'Educational')

  return (
    <div style={{ minHeight: '100vh', background: '#0F1E35', fontFamily: 'Nunito Sans, sans-serif'}}>

      <Navbar />

      {/* -- PAGE HEADER -- */}
      <div style={{ padding: '120px 5% 40px'}}>
        <h1 style={{
          fontSize: '2.8rem', fontWeight:900,
          color: 'white', marginBottom: 8
        }}>Knowledge Library</h1>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems:'center', flexWrap:'wrap', gap:12}}>
          <p style={{color:'rgba(255, 255, 255, 0.5)', fontSize: '1rem', maxWidth: 420, lineHeight:1.7}}>
            Access curated literacy resources designed to bridge the gap between imagination and education.
          </p>
          <span style={{color:'#C9921A', fontWeight: 700, fontSize:'0.9rem'}}>
            📚 {BOOKS.length} Titles Available
          </span>
        </div>
      </div>

      {/*-- SEARCH + FILTER BAR--*/}
      <div style={{padding: '0 5% 40px', display:'flex', gap: 12, flexWrap:'wrap', alignItems:'center'}}>

        {/*--SEARCH input--*/}
        <div style={{flex:1, minWidth:260, position:'relative'}}>
          <span style={{position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'rgba(255, 255, 255, 0.4)', fontSize:'1rem'}}>🛡️</span>
          <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder='Search by title, author, or subject...'
          style={{
            width:'100%', padding:'14px 14px 14px 42px',
            background: 'rgba(255, 255, 255, 0.7)',
             border: '1px solid rgba(255, 255, 255, 0.15)', color: 'white', 
              borderRadius: 12 ,
            fontSize:'0.9rem', outline:'none',
          }}
          />
        </div>

        {/* CATEGORY BUTTONS */}
        <div style={{display: 'flex', gap: 8,}}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding:'12px 22px', borderRadius: 10,
                border: activeCategory === cat ? 'none' : '1px solid rgba(255, 255, 255, 0.2)',
                background: activeCategory === cat
                ? 'linear-gradient(135deg, #C9921A, #E8A820)'
                : 'transparent', 
                color: activeCategory === cat ? '#0F1E35' : 'rgba(255, 255, 255, 0.6)',
                fontWeight: 700, fontSize: '0.875rem', 
                cursor:'pointer', transition: 'all 0.2s',
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
      <div style={{padding:'0 5% 80px'}}>
      
      {/*-- STORY BOOKS SECTION--*/}
      {storyBooks.length > 0 && (
        <div style={{marginBottom: 60}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24}}>
            <div style={{display:'flex', alignItems:'center',  gap: 10}}>
              <div style={{width: 4, height:24, background:'#C0921A', borderRadius: 2 }} />
              <h2 style={{color:'white', fontSize:'1.3rem', fontWeight: 800}}>Story Books</h2>
            </div>
            <button style={{ color:'#C9921A', background:'none', border:'none', fontWeight:700, cursor:'pointer',fontSize:'0.875rem', }}
     >View All </button> 
     </div>

     <div style={{display:'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 20}}>
      {storyBooks.map(book => (
        <div key={book.id} style={{
          background:'rgba(255, 255, 255, 0.05)',
          border:'1px solid rgba(255, 255, 255, 0.1)',
          borderRadius:16, overflow:'hidden',
          cursor: 'pointer', transition: 'all 0.3s',
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-6px)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
          {/*-- BOOK COVER*/}
          <div style={{
            height:200, background: book.color,
            display: 'flex', alignItems:'flex-end',
            padding: 14, position: 'relative',
          }}>
            <span style={{
              position: 'absolute', top: 10, right: 10,
              background: 'rgba(201,146,26,0.9)',
              color:'#0F1E35',fontSize:'0.65rem', 
              fontWeight: 800, padding:'3px 10px',
              borderRadius: 100, textTransform: 'uppercase',
            }}>
              {book.level}
            </span>
            <span style={{color:'white', fontWeight: 800, fontSize:'0.9rem', lineHeight: 1.3}}>
              {book.title}
            </span>
            </div>

            {/*BOOK INFO*/}
            <div style={{padding:'14px 16px'}}>
              <p style={{color:'rgba(255, 255, 255, 0.5', fontSize:'0.8rem', marginBottom:12}}>
                By{book.author}
              </p>
              <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
                <span style={{color:'#C9921A', fontSize:'0.8rem', fontWeight:700}}>
                  {book.rating}
                </span>
                <button style={{
                  background: 'linear-gradient(135deg, #C9921A, #E8A820)',
                  color:'#0F1E35', border:'none',
                  padding:'7px 16px', borderRadius: 8,
                  fontWeight: 800, fontSize:'0.78rem',
                  cursor:'pointer',
                }}>Read now</button>
              </div>
              </div>
              </div>
      ))}
      </div>
      </div>
     )}

     {/*-- EDUCATIONAL BOOKS SECTION--*/}
     {eduBooks.length > 0 &&(
      <div>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24}}>
          <div style={{display:'flex', alignItems:'center', gap: 10}}>
          <div style={{width: 4, height: 24, background:'#2A8F8F', borderRadius: 2}} />
          <h2 style={{color:'white', fontSize:'1.3rem', fontWeight:800}}>Educational Books</h2>
          </div>
          <button style={{ color:'#C99A1A', background:'none', border:'none', fontWeight: 700, cursor:'pointer', fontSize:'0.875rem'}}>
            View All
          </button>
          </div>

          {/*FEATURED BIG CARD + GRID */}
            <div style={{display:'grid', gridTemplateColumns:'1.2fr 1fr', gap: 20}}>

              {/* FEATURED BOOK */}
              <div style={{
                background:'rgba(255, 255, 255, 0.05)',
                border:'1px solid rgba(255, 255, 255, 0.1)',
                borderRadius:20, padding:28,
              }}>
                <div style={{
                  width:90, height: 120, borderRadius:10, flexShrink: 0,
                  background: eduBooks[0]?.color || '#1A2A4A',
                  marginBottom: 20,
                }} />
                <span style={{color:'#C9921A', fontSize:'0.72rem', fontWeight:800, textTransform:'uppercase', letterSpacing:'0.1em'}}>
                  Premium Resource
                </span>
                <h3 style={{color:'white', fontSize:'1.3rem', fontWeight: 900, margin:'8px 0 10px', lineHeight:1.3}}>
                  {eduBooks[0]?.title}
                </h3>
                <p style={{color:'rgba(255, 255, 255, 0.45)', fontSize:'0.825rem', lineHeight:1.7, marginBottom:20,}}>
                  A comprehensive guide for advanced students exploring the intersection of literacy, technology, and learning.
                </p>
                <div style={{display:'flex', gap: 8, marginBottom: 20, flexWrap:'wrap'}}>
                  <span style={{background:'rgba(255, 255, 255, 0.08)', color:'rgba(255, 255, 255, 0.5)', padding:'5px 12px', borderRadius:8, fontSize:'0.75rem'}}>
                    480 Pages
                  </span>
                  <span style={{background:'rgba(255, 255, 255, 0.08)', color:'rgba(255, 255, 255, 0.5)', padding:'5px 12px', borderRadius:8, fontSize:'0.75rem'}}>
                    {eduBooks[0]?.level}
                  </span>
                </div>
                <button style={{
                  background:'linear-gradient(135deg, #C9921A, #E8A820)', 
                  color:'#0F1E35', border:'none' ,
                  padding:'11px 24px', borderRadius:10, 
                  fontWeight: 800, fontSize: '0.875rem', cursor:'pointer',
                }}>
                  Open Library
                </button>
              </div>

              {/* Small edu book grid */}
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap: 14}}>
                {eduBooks.slice(1).map(book =>(
                  <div key={book.id} style={{
                    background:'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: 14, padding:16,
                    display: 'flex', gap: 12, alignItems:'flex-start',
                    cursor:'pointer', transition:'all 0.3s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.09)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
                  >
                    <div style={{width: 44, height: 56, borderRadius:6, background: book.color, flexShrink: 0}} />
                    <div>
                      <span style={{ color:'#C9921A', fontSize:'0.6rem', margin:'4px 0 6px', lineHeight: 1.3}}>
                        {book.level}
                      </span>
                      <p style={{ color: 'white', fontWeight: 700, fontSize: '0.8rem', margin: '4px 0 6px', lineHeight: 1.3}}>
                        {book.title}
                      </p>
                      <span style={{ color: '#2A8F8F', fontSize: '0.72rem', fontWeight: 600, cursor:'pointer'}}>
                        Study
                      </span>
                      </div>
                      </div>
                ))}
              </div>
            </div>
          </div>
     )}

     {/* NO RESULTS*/}
     {filtered.length === 0 &&(
      <div style={{ textAlign:'center', padding:'80px 0'}}>
        <p style={{ fontSize:'3rem',}}>📚</p>
        <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize:'1rem', marginTop: 16}}>
          No books match your search. Try something different.
        </p>
      </div>
     )}

      </div>

      <Footer />
      </div>
  )
}














      
    