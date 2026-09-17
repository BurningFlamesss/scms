import { Eye, Clock } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Segmented } from '../Segmented';
import { Eyebrow, WidgetCaption } from '../Text';
import { routines } from '#/lib/routines';
import { RoutineTable } from '../shared/RoutineTable';

export function RoutineViewer() {
  const [id, setId] = useState(routines[0].key);
  const routine = routines.find((r) => r.key === id)!;

  return (
    <div className='flex flex-col gap-8' data-testid='routine-viewer'>
      <div className='flex flex-col gap-2'>
        <Eyebrow>Class routine</Eyebrow>
        <WidgetCaption>The period running right now is highlighted, in Nepal time.</WidgetCaption>
      </div>

      <Segmented
        label='Class and section'
        value={id}
        onChange={setId}
        testId='routine-class'
        size='sm'
        options={routines.map((r) => ({ value: r.key, label: r.label }))}
      />

      <div className="-mx-2 sm:-mx-0">
        <RoutineTable routine={routine} />
      </div>
    </div>
  );
}
