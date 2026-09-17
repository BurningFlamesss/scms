import { useMemo, useState } from 'react';
import { Download as DownloadIcon, FileText } from 'lucide-react';
import { Chip } from '../Chip';
import { Eyebrow, WidgetCaption } from '../Text';
import { downloadCategories, downloads } from '#/content/extras';
import { formatBs, formatAd } from '#/lib/nepaliDate';
import { slugify } from '#/lib/ics';

function formatSize(kb: number): string {
  return kb >= 1024 ? (kb / 1024).toFixed(1) + ' MB' : kb + ' KB';
}

/**
 * B6.3 - Downloads centre. Format and size are shown before the click, never
 * after it. The documents themselves are held in the school office CMS; this
 * build issues a plain-text record card in their place rather than a dead link.
 */
export function DownloadsCentre() {
  const [cat, setCat] = useState<string | null>(null);
  const list = useMemo(() => (cat ? downloads.filter((d) => d.category === cat) : downloads), [cat]);

  const issue = (title: string, meta: string) => {
    const blob = new Blob(
      [
        'EVEREST ENGLISH BOARDING SECONDARY SCHOOL\r\n',
        'Pokhara, Kaski, Nepal\r\n\r\n',
        title + '\r\n',
        meta + '\r\n\r\n',
        'This record card stands in for the document, which is published from the\r\n',
        'school office content system. Collect the signed copy from the front office\r\n',
        'or telephone +977-61-460218.\r\n',
      ],
      { type: 'text/plain;charset=utf-8' },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'everest-' + slugify(title) + '.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className='flex flex-col gap-8' data-testid='downloads-centre'>
      <div className='flex flex-col gap-2'>
        <Eyebrow>Downloads</Eyebrow>
        <WidgetCaption>Format and size are shown before you tap anything.</WidgetCaption>
      </div>

      <div className='flex flex-wrap items-center gap-2' data-testid='downloads-filters'>
        <span className='u-label mr-2 text-n-600'>Category</span>
        {downloadCategories.map((c) => (
          <Chip
            key={c}
            selected={cat === c}
            onClick={() => setCat(cat === c ? null : c)}
            testId={'chip-dl-' + slugify(c)}
          >
            {c}
          </Chip>
        ))}
        {cat ? (
          <Chip selected={false} onClick={() => setCat(null)} testId='chip-dl-clear'>
            Clear
          </Chip>
        ) : null}
      </div>

      {list.length === 0 ? (
        <p className='border-y-hair border-n-300 py-8 text-body-l text-ink' data-testid='downloads-empty'>
          Nothing is filed under that category yet.
        </p>
      ) : (
        <ul className='flex flex-col'>
          {list.map((d) => {
            const meta = `${d.format} · ${formatSize(d.sizeKb)} · updated ${formatBs(d.updated.bs)} BS (${formatAd(d.updated.ad)})`;
            return (
              <li key={d.id} className='border-t-hair border-n-200 last:border-b-hair'>
                <button
                  type='button'
                  onClick={() => issue(d.title, meta)}
                  data-testid={'download-' + d.id}
                  className='group flex w-full flex-wrap items-center gap-x-6 gap-y-2 py-4 text-left transistion-colors duration-fast !border-0 !bg-transparent focus-visible:outline-none focus-visible:ring-0 hover:bg-secondary/50'
                >
                  <FileText aria-hidden='true' size={16} className='shrink-0 text-accent' />
                  <span className='min-w-0 flex-1 text-body-m text-ink'>{d.title}</span>
                  <span className='u-label text-n-600'>{d.category}</span>
                  <span className='u-label tnum w-[72px] text-n-600'>{d.format}</span>
                  <span className='u-label tnum w-[84px] text-n-600'>{formatSize(d.sizeKb)}</span>
                  <span className='u-label tnum hidden w-[168px] text-n-600 lg:block'>
                    {formatBs(d.updated.bs)} BS
                  </span>
                  <DownloadIcon
                    aria-hidden='true'
                    size={16}
                    className='shrink-0 text-ink transition-transform duration-micro ease-state group-hover:translate-y-[3px]'
                  />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
