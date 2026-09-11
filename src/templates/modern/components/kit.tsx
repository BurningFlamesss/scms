/**
 * Typed re-export shim for the shadcn/ui primitives.
 *
 * The library components ship as untyped `.jsx` forwardRef components, which
 * TypeScript widens to `RefAttributes<any>` and therefore rejects every prop.
 * Rather than rewriting 45 library files, this module re-exports them once with
 * permissive component types. All application code imports primitives from here.
 */

import type { ComponentType } from "react";

import * as AccordionModule from "#/components/ui/accordion";
import * as BadgeModule from "#/components/ui/badge";
import * as ButtonModule from "#/components/ui/button";
import * as CardModule from "#/components/ui/card";
import * as DialogModule from "#/components/ui/dialog";
import * as InputModule from "#/components/ui/input";
import * as ProgressModule from "#/components/ui/progress";
import * as SeparatorModule from "#/components/ui/separator";
import * as SheetModule from "#/components/ui/sheet";
import * as SkeletonModule from "#/components/ui/skeleton";
import * as TabsModule from "#/components/ui/tabs";
import * as TooltipModule from "#/components/ui/tooltip";

// A permissive component type is intentional here: these are untyped JS
// library components and the shim exists purely to unblock consumers.
type UI = ComponentType<any>;

const as = (component: unknown): UI => component as unknown as UI;

export const Accordion = as(AccordionModule.Accordion);
export const AccordionItem = as(AccordionModule.AccordionItem);
export const AccordionTrigger = as(AccordionModule.AccordionTrigger);
export const AccordionContent = as(AccordionModule.AccordionContent);

export const Badge = as(BadgeModule.Badge);
export const Button = as(ButtonModule.Button);

export const Card = as(CardModule.Card);
export const CardHeader = as(CardModule.CardHeader);
export const CardTitle = as(CardModule.CardTitle);
export const CardDescription = as(CardModule.CardDescription);
export const CardContent = as(CardModule.CardContent);
export const CardFooter = as(CardModule.CardFooter);

export const Dialog = as(DialogModule.Dialog);
export const DialogTrigger = as(DialogModule.DialogTrigger);
export const DialogContent = as(DialogModule.DialogContent);
export const DialogHeader = as(DialogModule.DialogHeader);
export const DialogTitle = as(DialogModule.DialogTitle);
export const DialogDescription = as(DialogModule.DialogDescription);
export const DialogFooter = as(DialogModule.DialogFooter);
export const DialogClose = as(DialogModule.DialogClose);

export const Input = as(InputModule.Input);
export const Separator = as(SeparatorModule.Separator);

export const Sheet = as(SheetModule.Sheet);
export const SheetTrigger = as(SheetModule.SheetTrigger);
export const SheetContent = as(SheetModule.SheetContent);
export const SheetHeader = as(SheetModule.SheetHeader);
export const SheetTitle = as(SheetModule.SheetTitle);
export const SheetDescription = as(SheetModule.SheetDescription);
export const SheetFooter = as(SheetModule.SheetFooter);
export const SheetClose = as(SheetModule.SheetClose);

export const Skeleton = as(SkeletonModule.Skeleton);

export const Tabs = as(TabsModule.Tabs);
export const TabsList = as(TabsModule.TabsList);
export const TabsTrigger = as(TabsModule.TabsTrigger);
export const TabsContent = as(TabsModule.TabsContent);

export const Tooltip = as(TooltipModule.Tooltip);
export const TooltipTrigger = as(TooltipModule.TooltipTrigger);
export const TooltipContent = as(TooltipModule.TooltipContent);
export const TooltipProvider = as(TooltipModule.TooltipProvider);

export const Progress = as(ProgressModule.Progress);