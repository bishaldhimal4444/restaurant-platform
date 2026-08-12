'use client';

import { useTransition } from 'react';
import type { MenuSection } from '../../../lib/types';
import { updateSectionAction, deleteSectionAction, moveSectionUpAction, moveSectionDownAction } from '../../../actions/menu-items';
import { Button } from '../../../components/ui/button';

interface SectionRowProps {
  section: MenuSection;
}

export function SectionRow({ section }: SectionRowProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex items-center justify-between py-4">
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          isLoading={isPending}
          onClick={() => startTransition(() => moveSectionUpAction(section.id))}
          disabled={section.displayOrder === 0}
          aria-label="Move up"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          isLoading={isPending}
          onClick={() => startTransition(() => moveSectionDownAction(section.id))}
          aria-label="Move down"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </Button>
        <div>
          <p className="font-medium">{section.name}</p>
          {section.description && <p className="text-sm text-zinc-500">{section.description}</p>}
          <p className="mt-0.5 text-xs text-zinc-400">Order: {section.displayOrder} • {section.isActive ? 'Active' : 'Inactive'}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="secondary"
          isLoading={isPending}
          onClick={() => startTransition(() => updateSectionAction(section.id, { isActive: !section.isActive }))}
        >
          {section.isActive ? 'Deactivate' : 'Activate'}
        </Button>
        <Button
          type="button"
          variant="secondary"
          isLoading={isPending}
          onClick={() => startTransition(() => deleteSectionAction(section.id))}
        >
          Delete
        </Button>
      </div>
    </div>
  );
}
