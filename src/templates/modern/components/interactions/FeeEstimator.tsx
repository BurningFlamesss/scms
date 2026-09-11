import { useEffect, useMemo, useState } from 'react';
import { Copy, Share2, Check, Phone } from 'lucide-react';
import { LedgerCount } from '../motion';
import { Button } from '../Button';
import { SelectField } from '../Field';
import { Eyebrow, WidgetCaption } from '../Text';
import {
  feeLevels,
  hostelLabels,
  transportLabels,
  plusTwoStreams,
} from '#/content/courses';
import { estimate, formatNpr, formatNprBare, announceEstimate, estimateAsText, routeForBand } from '#/lib/fees';
import type { HostelOption, StreamId, TransportBand } from '#/content/types';

const TRANSPORT_OPTIONS: Array<{ value: TransportBand; label: string }> = [
  { value: 'none', label: transportLabels.none },
  { value: 'under3', label: transportLabels.under3 },
  { value: '3to6', label: transportLabels['3to6'] },
  { value: 'over6', label: transportLabels.over6 },
];

const HOSTEL_OPTIONS: Array<{ value: HostelOption; label: string }> = [
  { value: 'none', label: hostelLabels.none },
  { value: 'day', label: hostelLabels.day },
  { value: 'residential', label: hostelLabels.residential },
];

function readBandFromUrl(): TransportBand {
  if (typeof window === 'undefined') return 'none';
  const b = new URLSearchParams(window.location.search).get('band');
  return b === 'under3' || b === '3to6' || b === 'over6' ? b : 'none';
}

/**
 * B1 - Fee estimator. Not a calculator: one hairline-ruled row of controls
 * feeding the same ledger composition the landing page uses. Totals update the
 * instant a control changes; there is no Calculate button.
 */
export function FeeEstimator() {
  const [levelId, setLevelId] = useState('secondary-9-10');
  const [streamId, setStreamId] = useState<StreamId>('science');
  const [transport, setTransport] = useState<TransportBand>('none');
  const [hostel, setHostel] = useState<HostelOption>('none');
  const [copied, setCopied] = useState<'idle' | 'copied' | 'shared'>('idle');

  useEffect(() => {
    const b = readBandFromUrl();
    if (b !== 'none') setTransport(b);
  }, []);

  const isPlusTwo = levelId === 'plus-two';
  const result = useMemo(
    () => estimate({ levelId, streamId: isPlusTwo ? streamId : undefined, transport, hostel }),
    [levelId, streamId, isPlusTwo, transport, hostel],
  );

  const heading = useMemo(() => {
    const lvl = feeLevels.find((l) => l.id === levelId)?.label ?? levelId;
    const st = isPlusTwo ? ' · ' + (plusTwoStreams.find((s) => s.id === streamId)?.name ?? '') : '';
    return `Everest EBSS — fee estimate: ${lvl}${st}`;
  }, [levelId, streamId, isPlusTwo]);

  const plainText = estimateAsText(result, heading);
  const matchedRoute = routeForBand(transport);

  const doCopy = async () => {
    const { copyText } = await import('#/lib/ics');
    const ok = await copyText(plainText);
    setCopied(ok ? 'copied' : 'idle');
    window.setTimeout(() => setCopied('idle'), 2400);
  };

  const doShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: heading, text: plainText });
        setCopied('shared');
        window.setTimeout(() => setCopied('idle'), 2400);
        return;
      } catch {
        /* user dismissed - fall through to copy */
      }
    }
    void doCopy();
  };

  return (
    <div className='flex flex-col gap-8' data-testid='fee-estimator' id='fee-estimator'>
      <div className='flex flex-col gap-2'>
        <Eyebrow>Fee estimator</Eyebrow>
        <WidgetCaption>
          Choose a level and any extras. The figures update as you change them.
        </WidgetCaption>
      </div>

      {/* Controls: one hairline-ruled row, wrapping to a column under 768px. */}
      <div className='grid gap-6 border-y-hair border-n-200 py-6 md:grid-cols-2 lg:grid-cols-4'>
        <SelectField
          label='Level'
          name='fee-level'
          testId='fee-level'
          value={levelId}
          onChange={setLevelId}
          options={feeLevels.map((l) => ({ value: l.id, label: l.label }))}
        />
        {/* Never a disabled control: the stream picker is absent unless it applies. */}
        {isPlusTwo ? (
          <SelectField
            label='Stream'
            name='fee-stream'
            testId='fee-stream'
            value={streamId}
            onChange={(v) => setStreamId(v as StreamId)}
            options={plusTwoStreams.map((s) => ({ value: s.id, label: s.name }))}
          />
        ) : null}
        <SelectField
          label='Transport'
          name='fee-transport'
          testId='fee-transport'
          value={transport}
          onChange={(v) => setTransport(v as TransportBand)}
          options={TRANSPORT_OPTIONS}
          hint={matchedRoute ? matchedRoute.name + ' · ' + formatNpr(matchedRoute.monthlyFare) + ' a month' : undefined}
        />
        <SelectField
          label='Hostel'
          name='fee-hostel'
          testId='fee-hostel'
          value={hostel}
          onChange={(v) => setHostel(v as HostelOption)}
          options={HOSTEL_OPTIONS}
        />
      </div>

      <p className='sr-only' role='status' aria-live='polite' data-testid='fee-live'>
        {announceEstimate(result)}
      </p>

      {result.priced ? (
        <>
          <dl className='grid grid-cols-1 border-t-hair border-n-200 sm:grid-cols-2'>
            <div className='flex flex-col gap-2 border-b-hair border-n-200 py-6 pr-6'>
              <dt className='u-label text-n-600'>Per month</dt>
              <dd className='u-display text-display-m text-ink'>
                NPR{' '}
                <LedgerCount
                  value={result.perMonth}
                  mode='tween'
                  format={formatNprBare}
                  testId='fee-per-month'
                />
              </dd>
            </div>
            <div className='flex flex-col gap-2 border-b-hair border-n-200 py-6 sm:border-l-hair sm:border-l-n-200 sm:pl-6'>
              <dt className='u-label text-n-600'>Per year, including one-time charges</dt>
              <dd className='u-display text-display-m text-ink'>
                NPR{' '}
                <LedgerCount
                  value={result.perYear}
                  mode='tween'
                  format={formatNprBare}
                  testId='fee-per-year'
                />
              </dd>
            </div>
          </dl>

          <dl className='flex flex-col' data-testid='fee-breakdown'>
            {result.lines.map((l) => (
              <div
                key={l.id}
                className='flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b-hair border-n-200 py-4'
              >
                <dt className='flex min-w-0 flex-1 flex-col gap-1'>
                  <span className='text-body-m text-ink'>{l.label}</span>
                  <span className='u-label text-n-600'>{l.note}</span>
                </dt>
                <dd className='flex shrink-0 flex-col items-end gap-1'>
                  <span className='u-display tnum text-display-m text-ink'>{formatNpr(l.amount)}</span>
                  <span className='u-label text-n-600'>
                    {l.cadence === 'once' ? 'one time' : l.cadence === 'termly' ? 'per term × 3' : 'per month × 12'}
                  </span>
                </dd>
              </div>
            ))}
          </dl>

          <div className='flex flex-wrap items-center gap-3'>
            <Button variant='secondary' onClick={doCopy} testId='fee-copy'>
              {copied === 'copied' ? <Check aria-hidden='true' size={14} /> : <Copy aria-hidden='true' size={14} />}
              {copied === 'copied' ? 'Copied' : 'Copy estimate'}
            </Button>
            <Button variant='secondary' onClick={doShare} testId='fee-share'>
              <Share2 aria-hidden='true' size={14} />
              {copied === 'shared' ? 'Shared' : 'Share'}
            </Button>
          </div>
        </>
      ) : (
        <div className='flex flex-col gap-4 border-y-hair border-n-300 py-8' data-testid='fee-nodata'>
          <p className='max-w-measure text-body-l text-ink'>
            No fee has been published for this combination yet. The accounts department will quote
            it directly.
          </p>
          <a
            href={'tel:' + result.contactTel.replace(/[^+\d]/g, '')}
            className='u-label inline-flex w-fit min-h-tap items-center gap-2 border-b-hair border-ink py-2 text-ink'
            data-testid='fee-accounts-tel'
          >
            <Phone aria-hidden='true' size={14} />
            Accounts · {result.contactTel}
          </a>
        </div>
      )}

      <p className='u-label text-n-600' data-testid='fee-disclaimer'>
        Indicative only. Confirmed at admission.
      </p>
    </div>
  );
}
