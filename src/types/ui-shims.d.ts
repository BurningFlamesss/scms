// ---------------------------------------------------------------------------
// Ambient module shims for the pre-existing shadcn/ui primitives.
//
// The design-system primitives in `src/components/ui/*` ship as `.jsx` files.
// TypeScript's inference on plain-JS `forwardRef` components produces overly
// narrow prop signatures (e.g. it marks `className` as required), so we declare
// them as permissive external modules instead. All *application* code
// (domain models, services, feature components) remains fully typed.
// ---------------------------------------------------------------------------

type UIComponent = (props: any) => any;
type VariantFn = (...args: any[]) => string;

declare module "@/components/ui/accordion" {
  export const Accordion: UIComponent;
  export const AccordionItem: UIComponent;
  export const AccordionTrigger: UIComponent;
  export const AccordionContent: UIComponent;
}
declare module "@/components/ui/alert-dialog" {
  export const AlertDialog: UIComponent;
  export const AlertDialogPortal: UIComponent;
  export const AlertDialogOverlay: UIComponent;
  export const AlertDialogTrigger: UIComponent;
  export const AlertDialogContent: UIComponent;
  export const AlertDialogHeader: UIComponent;
  export const AlertDialogFooter: UIComponent;
  export const AlertDialogTitle: UIComponent;
  export const AlertDialogDescription: UIComponent;
  export const AlertDialogAction: UIComponent;
  export const AlertDialogCancel: UIComponent;
}
declare module "@/components/ui/alert" {
  export const Alert: UIComponent;
  export const AlertTitle: UIComponent;
  export const AlertDescription: UIComponent;
}
declare module "@/components/ui/aspect-ratio" {
  export const AspectRatio: UIComponent;
}
declare module "@/components/ui/avatar" {
  export const Avatar: UIComponent;
  export const AvatarImage: UIComponent;
  export const AvatarFallback: UIComponent;
}
declare module "@/components/ui/badge" {
  export const Badge: UIComponent;
  export const badgeVariants: VariantFn;
}
declare module "@/components/ui/breadcrumb" {
  export const Breadcrumb: UIComponent;
  export const BreadcrumbList: UIComponent;
  export const BreadcrumbItem: UIComponent;
  export const BreadcrumbLink: UIComponent;
  export const BreadcrumbPage: UIComponent;
  export const BreadcrumbSeparator: UIComponent;
  export const BreadcrumbEllipsis: UIComponent;
}
declare module "@/components/ui/button" {
  export const Button: UIComponent;
  export const buttonVariants: VariantFn;
}
declare module "@/components/ui/calendar" {
  export const Calendar: UIComponent;
}
declare module "@/components/ui/card" {
  export const Card: UIComponent;
  export const CardHeader: UIComponent;
  export const CardFooter: UIComponent;
  export const CardTitle: UIComponent;
  export const CardDescription: UIComponent;
  export const CardContent: UIComponent;
}
declare module "@/components/ui/carousel" {
  export const Carousel: UIComponent;
  export const CarouselContent: UIComponent;
  export const CarouselItem: UIComponent;
  export const CarouselPrevious: UIComponent;
  export const CarouselNext: UIComponent;
}
declare module "@/components/ui/checkbox" {
  export const Checkbox: UIComponent;
}
declare module "@/components/ui/collapsible" {
  export const Collapsible: UIComponent;
  export const CollapsibleTrigger: UIComponent;
  export const CollapsibleContent: UIComponent;
}
declare module "@/components/ui/command" {
  export const Command: UIComponent;
  export const CommandDialog: UIComponent;
  export const CommandInput: UIComponent;
  export const CommandList: UIComponent;
  export const CommandEmpty: UIComponent;
  export const CommandGroup: UIComponent;
  export const CommandItem: UIComponent;
  export const CommandShortcut: UIComponent;
  export const CommandSeparator: UIComponent;
}
declare module "@/components/ui/context-menu" {
  export const ContextMenu: UIComponent;
  export const ContextMenuTrigger: UIComponent;
  export const ContextMenuContent: UIComponent;
  export const ContextMenuItem: UIComponent;
  export const ContextMenuSeparator: UIComponent;
  export const ContextMenuLabel: UIComponent;
}
declare module "@/components/ui/dialog" {
  export const Dialog: UIComponent;
  export const DialogPortal: UIComponent;
  export const DialogOverlay: UIComponent;
  export const DialogTrigger: UIComponent;
  export const DialogClose: UIComponent;
  export const DialogContent: UIComponent;
  export const DialogHeader: UIComponent;
  export const DialogFooter: UIComponent;
  export const DialogTitle: UIComponent;
  export const DialogDescription: UIComponent;
}
declare module "@/components/ui/drawer" {
  export const Drawer: UIComponent;
  export const DrawerPortal: UIComponent;
  export const DrawerOverlay: UIComponent;
  export const DrawerTrigger: UIComponent;
  export const DrawerClose: UIComponent;
  export const DrawerContent: UIComponent;
  export const DrawerHeader: UIComponent;
  export const DrawerFooter: UIComponent;
  export const DrawerTitle: UIComponent;
  export const DrawerDescription: UIComponent;
}
declare module "@/components/ui/dropdown-menu" {
  export const DropdownMenu: UIComponent;
  export const DropdownMenuTrigger: UIComponent;
  export const DropdownMenuContent: UIComponent;
  export const DropdownMenuItem: UIComponent;
  export const DropdownMenuCheckboxItem: UIComponent;
  export const DropdownMenuRadioItem: UIComponent;
  export const DropdownMenuLabel: UIComponent;
  export const DropdownMenuSeparator: UIComponent;
  export const DropdownMenuShortcut: UIComponent;
  export const DropdownMenuGroup: UIComponent;
  export const DropdownMenuPortal: UIComponent;
  export const DropdownMenuSub: UIComponent;
  export const DropdownMenuSubContent: UIComponent;
  export const DropdownMenuSubTrigger: UIComponent;
  export const DropdownMenuRadioGroup: UIComponent;
}
declare module "@/components/ui/hover-card" {
  export const HoverCard: UIComponent;
  export const HoverCardTrigger: UIComponent;
  export const HoverCardContent: UIComponent;
}
declare module "@/components/ui/input" {
  export const Input: UIComponent;
}
declare module "@/components/ui/label" {
  export const Label: UIComponent;
}
declare module "@/components/ui/pagination" {
  export const Pagination: UIComponent;
  export const PaginationContent: UIComponent;
  export const PaginationLink: UIComponent;
  export const PaginationItem: UIComponent;
  export const PaginationPrevious: UIComponent;
  export const PaginationNext: UIComponent;
  export const PaginationEllipsis: UIComponent;
}
declare module "@/components/ui/popover" {
  export const Popover: UIComponent;
  export const PopoverTrigger: UIComponent;
  export const PopoverContent: UIComponent;
  export const PopoverAnchor: UIComponent;
}
declare module "@/components/ui/progress" {
  export const Progress: UIComponent;
}
declare module "@/components/ui/radio-group" {
  export const RadioGroup: UIComponent;
  export const RadioGroupItem: UIComponent;
}
declare module "@/components/ui/scroll-area" {
  export const ScrollArea: UIComponent;
  export const ScrollBar: UIComponent;
}
declare module "@/components/ui/select" {
  export const Select: UIComponent;
  export const SelectGroup: UIComponent;
  export const SelectValue: UIComponent;
  export const SelectTrigger: UIComponent;
  export const SelectContent: UIComponent;
  export const SelectLabel: UIComponent;
  export const SelectItem: UIComponent;
  export const SelectSeparator: UIComponent;
}
declare module "@/components/ui/separator" {
  export const Separator: UIComponent;
}
declare module "@/components/ui/sheet" {
  export const Sheet: UIComponent;
  export const SheetPortal: UIComponent;
  export const SheetOverlay: UIComponent;
  export const SheetTrigger: UIComponent;
  export const SheetClose: UIComponent;
  export const SheetContent: UIComponent;
  export const SheetHeader: UIComponent;
  export const SheetFooter: UIComponent;
  export const SheetTitle: UIComponent;
  export const SheetDescription: UIComponent;
}
declare module "@/components/ui/skeleton" {
  export const Skeleton: UIComponent;
}
declare module "@/components/ui/slider" {
  export const Slider: UIComponent;
}
declare module "@/components/ui/sonner" {
  export const Toaster: UIComponent;
  export const toast: any;
}
declare module "@/components/ui/switch" {
  export const Switch: UIComponent;
}
declare module "@/components/ui/table" {
  export const Table: UIComponent;
  export const TableHeader: UIComponent;
  export const TableBody: UIComponent;
  export const TableFooter: UIComponent;
  export const TableHead: UIComponent;
  export const TableRow: UIComponent;
  export const TableCell: UIComponent;
  export const TableCaption: UIComponent;
}
declare module "@/components/ui/tabs" {
  export const Tabs: UIComponent;
  export const TabsList: UIComponent;
  export const TabsTrigger: UIComponent;
  export const TabsContent: UIComponent;
}
declare module "@/components/ui/textarea" {
  export const Textarea: UIComponent;
}
declare module "@/components/ui/toggle" {
  export const Toggle: UIComponent;
  export const toggleVariants: VariantFn;
}
declare module "@/components/ui/toggle-group" {
  export const ToggleGroup: UIComponent;
  export const ToggleGroupItem: UIComponent;
}
declare module "@/components/ui/tooltip" {
  export const Tooltip: UIComponent;
  export const TooltipTrigger: UIComponent;
  export const TooltipContent: UIComponent;
  export const TooltipProvider: UIComponent;
}
declare module "@/components/ui/progress-ring" {
  export const ProgressRing: UIComponent;
}
declare module "@/hooks/use-toast" {
  export const useToast: (...args: any[]) => any;
  export const toast: any;
}
declare module "@/constants/testIds" {
  const value: Record<string, Record<string, string>>;
  export = value;
}
