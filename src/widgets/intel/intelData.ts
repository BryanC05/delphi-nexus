export type Glyph = {
  symbol: string;
  name: string;
  tag: string;
  desc: string;
};

export type ElementInfo = {
  symbol: string;
  name: string;
  number: number;
  weight: string;
  group: string;
  desc: string;
};

export type CipherMachine = {
  name: string;
  country: string;
  year: string;
  type: string;
  desc: string;
};

export type PhilosophySchool = {
  school: string;
  core: string;
  thinkers: string;
  quote: string;
};

export const GLYPH_DATABASE: Glyph[] = [
  { symbol: '☣', name: 'BIO-HAZARD PROTOCOL', tag: 'HAZARD', desc: 'Indicates active biological hazard or genetic threat vectors in the vicinity.' },
  { symbol: '☢', name: 'RADIATION EMISSION', tag: 'HAZARD', desc: 'Critical radioactive isotope leaks or background radiation spike detected.' },
  { symbol: '☠', name: 'TARGET DESTROYED', tag: 'COMBAT', desc: 'Indicates system deletion or confirmation of target removal.' },
  { symbol: '☯', name: 'NODE BALANCING', tag: 'NETWORK', desc: 'Symmetrical channel load balance. Safe operational flow.' },
  { symbol: '⚙', name: 'PROCESS CORE', tag: 'SYSTEM', desc: 'Core execution thread running under standard processor load.' },
  { symbol: '⚛', name: 'QUANTUM ENCRYPT', tag: 'SECURITY', desc: 'Quantum particle state encryption active on network channel.' },
  { symbol: '✦', name: 'INTEL SOURCE', tag: 'INTEL', desc: 'Newly registered metadata node added to surveillance registry.' },
  { symbol: '⚔', name: 'COMBAT PROTOCOL', tag: 'COMBAT', desc: 'Tactical subsystem active. Firewall weapons fully loaded.' },
  { symbol: '🛡', name: 'SECURE SHELL', tag: 'SECURITY', desc: 'AES-256 encrypted shell shield preventing incoming injections.' },
  { symbol: '🔑', name: 'CRYPTO KEY', tag: 'SECURITY', desc: 'Public/private key pair verified for channel handshake.' },
  { symbol: '👁', name: 'SURVEILLANCE NODE', tag: 'WATCHER', desc: 'Sub-orbital camera array tracking target telemetry.' },
  { symbol: '🛸', name: 'UNIDENTIFIED OBJECT', tag: 'SPACE', desc: 'Orbital velocity telemetry of unknown aerospace signature.' },
  { symbol: 'Ω', name: 'OMEGA TERMINAL', tag: 'SYSTEM', desc: 'Final execution thread boundary. Recursion loop safe.' },
  { symbol: 'Ψ', name: 'NEURAL HANDSHAKE', tag: 'NEURAL', desc: 'Synaptic link established with user neural deck.' },
  { symbol: 'Φ', name: 'GOLDEN RATIO', tag: 'MATH', desc: 'Layout optimization formula applied. Maximum aesthetics.' },
  { symbol: 'λ', name: 'LAMBDA ROUTER', tag: 'NETWORK', desc: 'Serverless request execution router handling gateway requests.' },
  { symbol: '∞', name: 'RECURSION POINT', tag: 'MATH', desc: 'Infinite loop buffer allocated. Thread overflow protected.' },
];

export const ELEMENT_DB: ElementInfo[] = [
  { symbol: 'H', name: 'Hydrogen', number: 1, weight: '1.008', group: 'Reactive Nonmetal', desc: 'Most abundant chemical substance in the Universe. Discovered by Henry Cavendish in 1766.' },
  { symbol: 'He', name: 'Helium', number: 2, weight: '4.0026', group: 'Noble Gas', desc: 'Light, odorless gas used in cryogenics. Discovered in 1868 by Janssen and Lockyer in the solar spectrum.' },
  { symbol: 'Li', name: 'Lithium', number: 3, weight: '6.94', group: 'Alkali Metal', desc: 'Lightest solid element. Highly reactive, used in modern energy cells. Discovered by Arfwedson in 1817.' },
  { symbol: 'C', name: 'Carbon', number: 6, weight: '12.011', group: 'Reactive Nonmetal', desc: 'Tetravalent nonmetal that forms the chemical basis for all known organic life. Key component of steel.' },
  { symbol: 'O', name: 'Oxygen', number: 8, weight: '15.999', group: 'Reactive Nonmetal', desc: 'Highly reactive nonmetal and oxidizing agent. Discovered independently by Scheele (1773) and Priestley (1774).' },
  { symbol: 'Fe', name: 'Iron', number: 26, weight: '55.845', group: 'Transition Metal', desc: "Core metal of Earth's outer and inner core. Essential for human oxygen transport (hemoglobin)." },
  { symbol: 'Au', name: 'Gold', number: 79, weight: '196.97', group: 'Transition Metal', desc: 'Dense, soft, malleable, and ductile transition metal with a bright yellow color. Highly valued historically.' },
  { symbol: 'U', name: 'Uranium', number: 92, weight: '238.03', group: 'Actinide', desc: 'Weakly radioactive metal. Fissionable isotope U-235 is the primary fuel for nuclear reactors.' },
];

export const CIPHER_DB: CipherMachine[] = [
  { name: 'Enigma Machine', country: 'Germany', year: '1918', type: 'Rotor Electro-mechanical', desc: "Used by the German military in WWII. Famously decrypted by Alan Turing's team at Bletchley Park using the Bombe machine." },
  { name: 'Lorenz SZ42', country: 'Germany', year: '1940', type: 'Teleprinter Cipher Attachment', desc: 'Used for high-level strategic communication. Cracked by Bill Tutte using statistical analysis, leading to the Colossus computer.' },
  { name: 'SIGABA (M-134-C)', country: 'USA', year: '1938', type: 'Rotor Electro-mechanical', desc: 'Used by the US during WWII. It was never broken by enemy cryptanalysts during its entire service life.' },
  { name: 'Typex Mark XXII', country: 'UK', year: '1937', type: 'Rotor Electro-mechanical', desc: 'British rotor cipher machine adapted from commercial Enigma designs, with major security improvements.' },
  { name: 'Jefferson Wheel Cipher', country: 'USA', year: '1795', type: 'Mechanical Wheel Cylinders', desc: 'Invented by Thomas Jefferson. Decrypts messages using 36 rotating wooden wheels. Later re-invented as US Army M-94.' },
];

export const PHILOSOPHY_DB: PhilosophySchool[] = [
  { school: 'Stoicism', core: 'Virtue is the only good; focus on what is within control.', thinkers: 'Marcus Aurelius, Seneca, Epictetus', quote: 'You have power over your mind - not outside events. Realize this, and you will find strength.' },
  { school: 'Epicureanism', core: 'Highest good is pleasure (absence of mental anxiety & physical pain).', thinkers: 'Epicurus, Lucretius', quote: 'Do not spoil what you have by desiring what you have not; remember that what you now have was once among the things you only hoped for.' },
  { school: 'Cynicism', core: 'Live in agreement with nature, free from societal conventions and wealth.', thinkers: 'Diogenes of Sinope, Antisthenes', quote: 'It is the privilege of the gods to want nothing, and of godlike men to want little.' },
  { school: 'Platonism', core: 'The material world is a shadow of the true world of perfect Ideas or Forms.', thinkers: 'Plato, Plotinus', quote: 'The heaviest penalty for declining to rule is to be ruled by one inferior to yourself.' },
  { school: 'Aristotelianism', core: 'Empirical observation and logic are the keys to understanding reality.', thinkers: 'Aristotle, Thomas Aquinas', quote: 'We are what we repeatedly do. Excellence, then, is not an act, but a habit.' },
];
