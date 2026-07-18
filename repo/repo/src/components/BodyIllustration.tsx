import type { Accent } from '../lib/types';
import { accentClasses } from '../lib/utils';

interface Props {
  slug: string;
  accent: Accent;
}

// Friendly, stylized SVG illustrations for each body system.
// Each is self-contained, uses the accent color, and animates subtly.
export function BodyIllustration({ slug, accent }: Props) {
  const a = accentClasses(accent);
  const stroke = `currentColor`;
  const cls = a.text;

  switch (slug) {
    case 'nervous':
      return (
        <svg viewBox="0 0 200 200" className={`h-full w-full ${cls}`} fill="none">
          <circle cx="100" cy="58" r="34" className={a.bgSoft} stroke={stroke} strokeWidth="4" />
          <path d="M100 92v58" stroke={stroke} strokeWidth="4" strokeLinecap="round" />
          <path d="M70 110c10 8 50 8 60 0" stroke={stroke} strokeWidth="4" strokeLinecap="round" opacity="0.5" />
          {[40, 70, 100, 130, 160].map((y, i) => (
            <g key={i}>
              <path d={`M100 ${y} l-30 12 M100 ${y} l30 12`} stroke={stroke} strokeWidth="3" strokeLinecap="round" opacity="0.7" />
              <circle cx={70} cy={y + 12} r="4" className={a.bg} />
              <circle cx={130} cy={y + 12} r="4" className={a.bg} />
            </g>
          ))}
          <path d="M88 50l-6 8 M112 50l6 8 M92 66c4 4 12 4 16 0" stroke={stroke} strokeWidth="3" strokeLinecap="round" />
          <circle cx="100" cy="58" r="4" className={a.bg}>
            <animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite" />
          </circle>
        </svg>
      );
    case 'circulatory':
      return (
        <svg viewBox="0 0 200 200" className={`h-full w-full ${cls}`} fill="none">
          <path d="M40 100c20-30 60-30 60 0s40 30 60 0" stroke={stroke} strokeWidth="3" strokeLinecap="round" opacity="0.4" />
          <path d="M40 120c20-30 60-30 60 0s40 30 60 0" stroke={stroke} strokeWidth="3" strokeLinecap="round" opacity="0.3" />
          <path
            d="M100 60c-22 0-40 18-40 40s18 40 40 40 40-18 40-40-18-40-40-40zm0 16c-13 0-24 11-24 24s11 24 24 24 24-11 24-24-11-24-24-24z"
            className={a.bgSoft}
            stroke={stroke}
            strokeWidth="4"
          />
          <path d="M100 76v32M88 92h24" stroke={stroke} strokeWidth="6" strokeLinecap="round" />
          <circle cx="100" cy="100" r="6" className={a.bg}>
            <animate attributeName="r" values="6;9;6" dur="1s" repeatCount="indefinite" />
          </circle>
        </svg>
      );
    case 'respiratory':
      return (
        <svg viewBox="0 0 200 200" className={`h-full w-full ${cls}`} fill="none">
          <path d="M70 50v80a30 30 0 0060 0V50" className={a.bgSoft} stroke={stroke} strokeWidth="4" strokeLinejoin="round" />
          <path d="M100 50v70" stroke={stroke} strokeWidth="3" opacity="0.4" />
          {[0, 1, 2, 3].map((i) => (
            <g key={i}>
              <path
                d={`M100 ${70 + i * 16} l-30 ${8 + i * 4}`}
                stroke={stroke}
                strokeWidth="3"
                strokeLinecap="round"
                opacity="0.7"
              />
              <path
                d={`M100 ${70 + i * 16} l30 ${8 + i * 4}`}
                stroke={stroke}
                strokeWidth="3"
                strokeLinecap="round"
                opacity="0.7"
              />
            </g>
          ))}
          <path d="M100 36c0-8 4-14 8-14" stroke={stroke} strokeWidth="3" strokeLinecap="round" />
          <circle cx="100" cy="100" r="5" className={a.bg}>
            <animate attributeName="opacity" values="1;0.3;1" dur="2.5s" repeatCount="indefinite" />
          </circle>
        </svg>
      );
    case 'digestive':
      return (
        <svg viewBox="0 0 200 200" className={`h-full w-full ${cls}`} fill="none">
          <path d="M84 36h32l-4 24a8 8 0 008 8h0a14 14 0 0014-14V40" className={a.bgSoft} stroke={stroke} strokeWidth="4" strokeLinejoin="round" />
          <path d="M100 68v18" stroke={stroke} strokeWidth="4" strokeLinecap="round" />
          <path d="M100 86c-18 0-22 14-22 24s6 26 22 26 22-16 22-26-4-24-22-24z" className={a.bgSoft} stroke={stroke} strokeWidth="4" />
          <path d="M100 136c0 18 6 28 24 28" stroke={stroke} strokeWidth="4" strokeLinecap="round" opacity="0.6" />
          <circle cx="100" cy="108" r="6" className={a.bg}>
            <animateTransform attributeName="transform" type="translate" values="0 0; 0 8; 0 0" dur="3s" repeatCount="indefinite" />
          </circle>
        </svg>
      );
    case 'musculoskeletal':
      return (
        <svg viewBox="0 0 200 200" className={`h-full w-full ${cls}`} fill="none">
          <path d="M100 40c14 0 22 10 22 22s-8 22-22 22-22-10-22-22 8-22 22-22z" className={a.bgSoft} stroke={stroke} strokeWidth="4" />
          <path d="M100 84v40M100 124l-22 28M100 124l22 28M100 96l-24 18M100 96l24 18" stroke={stroke} strokeWidth="4" strokeLinecap="round" />
          <circle cx="78" cy="152" r="6" className={a.bg} />
          <circle cx="122" cy="152" r="6" className={a.bg} />
          <circle cx="76" cy="114" r="5" className={a.bg} />
          <circle cx="124" cy="114" r="5" className={a.bg} />
          <circle cx="100" cy="62" r="4" className={a.bg}>
            <animate attributeName="opacity" values="1;0.4;1" dur="2s" repeatCount="indefinite" />
          </circle>
        </svg>
      );
    case 'immune':
      return (
        <svg viewBox="0 0 200 200" className={`h-full w-full ${cls}`} fill="none">
          <circle cx="100" cy="100" r="46" className={a.bgSoft} stroke={stroke} strokeWidth="4" />
          <path d="M100 60v80M60 100h80" stroke={stroke} strokeWidth="3" opacity="0.3" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => {
            const rad = (deg * Math.PI) / 180;
            const x = 100 + Math.cos(rad) * 46;
            const y = 100 + Math.sin(rad) * 46;
            return <circle key={i} cx={x} cy={y} r="6" className={a.bg} />;
          })}
          <circle cx="100" cy="100" r="14" className={a.bg}>
            <animate attributeName="r" values="14;18;14" dur="2s" repeatCount="indefinite" />
          </circle>
        </svg>
      );
    case 'endocrine':
      return (
        <svg viewBox="0 0 200 200" className={`h-full w-full ${cls}`} fill="none">
          <circle cx="100" cy="44" r="14" className={a.bgSoft} stroke={stroke} strokeWidth="4" />
          <circle cx="68" cy="84" r="10" className={a.bgSoft} stroke={stroke} strokeWidth="4" />
          <circle cx="132" cy="84" r="10" className={a.bgSoft} stroke={stroke} strokeWidth="4" />
          <circle cx="100" cy="116" r="12" className={a.bgSoft} stroke={stroke} strokeWidth="4" />
          <circle cx="100" cy="152" r="9" className={a.bgSoft} stroke={stroke} strokeWidth="4" />
          <path d="M100 58v8M82 90l14 16M118 90l-14 16M100 128v16" stroke={stroke} strokeWidth="3" opacity="0.5" />
          {[
            [100, 44],
            [68, 84],
            [132, 84],
            [100, 116],
            [100, 152],
          ].map(([cx, cy], i) => (
            <circle key={i} cx={cx} cy={cy} r="3" className={a.bg}>
              <animate
                attributeName="opacity"
                values="0;1;0"
                dur="2.5s"
                begin={`${i * 0.5}s`}
                repeatCount="indefinite"
              />
            </circle>
          ))}
        </svg>
      );
    case 'integumentary':
      return (
        <svg viewBox="0 0 200 200" className={`h-full w-full ${cls}`} fill="none">
          <rect x="44" y="44" width="112" height="112" rx="24" className={a.bgSoft} stroke={stroke} strokeWidth="4" />
          <path d="M44 80h112M44 120h112" stroke={stroke} strokeWidth="2" opacity="0.25" />
          {[
            [76, 76],
            [124, 76],
            [100, 100],
            [76, 124],
            [124, 124],
          ].map(([cx, cy], i) => (
            <circle key={i} cx={cx} cy={cy} r="3" className={a.bg}>
              <animate
                attributeName="cy"
                values={`${cy};${cy - 4};${cy}`}
                dur="2s"
                begin={`${i * 0.3}s`}
                repeatCount="indefinite"
              />
            </circle>
          ))}
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 200 200" className={`h-full w-full ${cls}`} fill="none">
          <circle cx="100" cy="100" r="50" className={a.bgSoft} stroke={stroke} strokeWidth="4" />
        </svg>
      );
  }
}
