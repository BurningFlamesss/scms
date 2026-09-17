import { useMemo, useState } from 'react';
import { Eyebrow, WidgetCaption } from '../Text';
import { routines } from '#/lib/routines';
import { RoutineTable } from '../shared/RoutineTable';

export function RoutineViewer() {
  const [selectedClass, setSelectedClass] = useState("Grade 11-12 (Science)");
  const [selectedSection, setSelectedSection] = useState("A");
  const [selectedShift, setSelectedShift] = useState("Morning");

  // Mocking the classes/sections/shifts based on what exists
  const classes = ["Grade 11-12 (Science)", "Grade 11-12 (Management)", "Basic Level (Grade 6-8)"];
  const sections = ["A", "B", "C"];
  const shifts = ["Morning", "Day"];

  const routineIdMap: Record<string, string> = {
    "Grade 11-12 (Science)": "grade-11-12-science",
    "Grade 11-12 (Management)": "grade-11-12-management",
    "Basic Level (Grade 6-8)": "basic-level",
  };

  // Fallback to whichever is closest in the mock data, or render empty. 
  // In real implementation this would fetch the exact assigned routine.
  const mappedKey = routineIdMap[selectedClass] || "basic-level";
  const routine = useMemo(() => {
    const raw = routines.find((r) => r.key === mappedKey) || routines[0];
    return {
      ...raw,
      label: `${selectedClass} - Section ${selectedSection}`,
      shift: `${selectedShift} Shift`,
    };
  }, [mappedKey, selectedClass, selectedSection, selectedShift]);

  return (
    <div className='flex flex-col gap-8' data-testid='routine-viewer'>
      <div className='flex flex-col gap-2'>
        <Eyebrow>Class routine</Eyebrow>
        <WidgetCaption>The period running right now is highlighted, in Nepal time.</WidgetCaption>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
          Class
          <select 
            value={selectedClass} 
            onChange={(e) => setSelectedClass(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {classes.map(c => <option key={c} value={c} className="text-foreground bg-background">{c}</option>)}
          </select>
        </label>
        
        <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
          Section
          <select 
            value={selectedSection} 
            onChange={(e) => setSelectedSection(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {sections.map(s => <option key={s} value={s} className="text-foreground bg-background">{s}</option>)}
          </select>
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
          Shift
          <select 
            value={selectedShift} 
            onChange={(e) => setSelectedShift(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {shifts.map(sh => <option key={sh} value={sh} className="text-foreground bg-background">{sh}</option>)}
          </select>
        </label>
      </div>

      <div className="-mx-2 sm:-mx-0">
        <RoutineTable routine={routine} />
      </div>
    </div>
  );
}
