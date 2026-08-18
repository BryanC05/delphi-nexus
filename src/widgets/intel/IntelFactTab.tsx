import { useEffect, useState } from 'react';
import axios from 'axios';

export default function IntelFactTab() {
  const [uselessFact, setUselessFact] = useState('');
  const [catFact, setCatFact] = useState('');
  const [advice, setAdvice] = useState('');
  const [factLoading, setFactLoading] = useState(true);

  const fetchAllFacts = async () => {
    setFactLoading(true);
    setUselessFact('');
    setCatFact('');
    setAdvice('');
    try {
      const [uselessRes, catRes, adviceRes] = await Promise.allSettled([
        axios.get('https://uselessfacts.jsph.pl/api/v2/facts/random'),
        axios.get('https://catfact.ninja/fact'),
        axios.get('https://api.adviceslip.com/advice'),
      ]);

      setUselessFact(
        uselessRes.status === 'fulfilled'
          ? uselessRes.value.data.text
          : 'Astronauts say that space smells like hot metal, seared steak, and welding fumes.'
      );
      setCatFact(
        catRes.status === 'fulfilled'
          ? catRes.value.data.fact
          : 'Cats have 32 muscles in each ear, allowing them to rotate their ears 180 degrees.'
      );
      setAdvice(
        adviceRes.status === 'fulfilled'
          ? adviceRes.value.data.slip.advice
          : "If you don't want to play, don't start the game."
      );
    } catch (error) {
      console.warn('Concerted Fact Fetching failed.', error);
    } finally {
      setFactLoading(false);
    }
  };

  useEffect(() => {
    fetchAllFacts();
  }, []);

  if (factLoading) {
    return <div style={{ color: 'var(--text-muted)', padding: '12px', fontSize: '0.85rem' }}>Decrypting datastreams...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {uselessFact && (
        <div style={{ background: 'rgba(0, 240, 255, 0.03)', padding: '10px 12px', borderLeft: '3px solid var(--accent-color)', borderRadius: '0 4px 4px 0' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--accent-color)', fontFamily: 'var(--font-tech)', marginBottom: '4px', fontWeight: 'bold' }}>GENERAL INTEL FACT</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: '1.4' }}>{uselessFact}</div>
        </div>
      )}
      {catFact && (
        <div style={{ background: 'rgba(0, 240, 255, 0.03)', padding: '10px 12px', borderLeft: '3px solid var(--p3r-cyan)', borderRadius: '0 4px 4px 0' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--p3r-cyan)', fontFamily: 'var(--font-tech)', marginBottom: '4px', fontWeight: 'bold' }}>FELINE RESEARCH OBSERVATION</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: '1.4' }}>{catFact}</div>
        </div>
      )}
      {advice && (
        <div style={{ background: 'rgba(72, 187, 120, 0.03)', padding: '10px 12px', borderLeft: '3px solid #48bb78', borderRadius: '0 4px 4px 0' }}>
          <div style={{ fontSize: '0.7rem', color: '#48bb78', fontFamily: 'var(--font-tech)', marginBottom: '4px', fontWeight: 'bold' }}>TACTICAL ADVICE DIRECTIVE</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: '1.4' }}>{advice}</div>
        </div>
      )}
      <button type="button" onClick={fetchAllFacts} disabled={factLoading} className="news-search-button" style={{ alignSelf: 'flex-end', width: 'auto' }}>
        {factLoading ? 'LOADING...' : 'REFRESH ALL'}
      </button>
    </div>
  );
}
