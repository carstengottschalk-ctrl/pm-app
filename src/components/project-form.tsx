'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { CalendarIcon, AlertCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { useProjects } from '@/hooks/use-projects';

// Define the form schema
const projectFormSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(100, 'Project name is too long'),
  description: z.string().max(500, 'Description is too long').optional(),
  start_date: z.date().refine((date) => date !== undefined, 'Start date is required'),
  end_date: z.date().refine((date) => date !== undefined, 'End date is required'),
  estimated_budget: z.coerce.number().positive('Budget must be a positive number'),
});

type ProjectFormValues = z.infer<typeof projectFormSchema>;

interface ProjectFormProps {
  defaultValues?: Partial<ProjectFormValues>;
  onSubmit: (data: ProjectFormValues) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
  submitButtonText?: string;
  excludeProjectId?: string; // For edit mode, exclude current project from duplicate check
}

export function ProjectForm({
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting = false,
  submitButtonText = 'Create Project',
  excludeProjectId,
}: ProjectFormProps) {
  const [dateError, setDateError] = useState<string | null>(null);
  const [duplicateNameError, setDuplicateNameError] = useState<string | null>(null);
  const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false);
  const { checkDuplicateName } = useProjects();

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema) as any,
    defaultValues: defaultValues || {
      name: '',
      description: '',
      estimated_budget: 0,
    },
  });

  // Watch for name changes to check for duplicates
  const projectName = form.watch('name');

  useEffect(() => {
    const checkDuplicate = async () => {
      if (!projectName || projectName.trim().length < 1) {
        setDuplicateNameError(null);
        return;
      }

      // Debounce the duplicate check
      setIsCheckingDuplicate(true);
      try {
        const isDuplicate = await checkDuplicateName(projectName, excludeProjectId);
        if (isDuplicate) {
          setDuplicateNameError(`A project with the name "${projectName}" already exists in your team. Consider using a unique name.`);
        } else {
          setDuplicateNameError(null);
        }
      } catch (error) {
        // If the API fails, we'll still validate on submit
        console.error('Failed to check duplicate name:', error);
        setDuplicateNameError(null);
      } finally {
        setIsCheckingDuplicate(false);
      }
    };

    const timeoutId = setTimeout(checkDuplicate, 500); // Debounce for 500ms
    return () => clearTimeout(timeoutId);
  }, [projectName, checkDuplicateName, excludeProjectId]);

  const handleSubmit = async (data: ProjectFormValues) => {
    // Validate that end date is after start date (strictly after)
    if (data.end_date <= data.start_date) {
      setDateError('End date must be after start date');
      toast({
        title: 'Validation Error',
        description: 'End date must be after start date',
        variant: 'destructive',
      });
      return;
    }

    // Check for duplicate name one more time before submitting
    if (data.name.trim()) {
      try {
        const isDuplicate = await checkDuplicateName(data.name, excludeProjectId);
        if (isDuplicate) {
          setDuplicateNameError(`A project with the name "${data.name}" already exists in your team. Please choose a different name.`);
          toast({
            title: 'Duplicate Project Name',
            description: `A project with the name "${data.name}" already exists in your team.`,
            variant: 'destructive',
          });
          return;
        }
      } catch (error) {
        // If the API fails, we'll let the backend handle the validation
        console.error('Failed to check duplicate name before submit:', error);
      }
    }

    setDateError(null);
    setDuplicateNameError(null);
    await onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project Name</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    placeholder="Enter project name"
                    {...field}
                    className={duplicateNameError ? "border-amber-500 focus-visible:ring-amber-500" : ""}
                  />
                  {isCheckingDuplicate && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="h-4 w-4 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
              </FormControl>
              <FormDescription>
                Choose a descriptive name for your project
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {duplicateNameError && (
          <Alert className="border-amber-500 bg-amber-50 text-amber-800 [&>svg]:text-amber-600">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {duplicateNameError}
            </AlertDescription>
          </Alert>
        )}

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe the project goals, scope, or any important details"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Brief description of what this project involves
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="start_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Start Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full pl-3 text-left font-normal',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        {field.value ? (
                          format(field.value, 'PPP')
                        ) : (
                          <span>Pick a start date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormDescription>
                  When the project begins
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="end_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>End Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full pl-3 text-left font-normal',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        {field.value ? (
                          format(field.value, 'PPP')
                        ) : (
                          <span>Pick an end date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date('1900-01-01')}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormDescription>
                  When the project ends
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {dateError && (
          <div className="text-sm font-medium text-destructive">{dateError}</div>
        )}

        <FormField
          control={form.control}
          name="estimated_budget"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estimated Budget</FormLabel>
              <FormControl>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                    $
                  </span>
                  <Input
                    type="number"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className="pl-8"
                    {...field}
                    onChange={(e) => {
                      const value = e.target.value === '' ? '0' : e.target.value;
                      // Parse as float to keep decimal places
                      field.onChange(parseFloat(value) || 0);
                    }}
                  />
                </div>
              </FormControl>
              <FormDescription>
                Total budget allocated for this project
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : submitButtonText}
          </Button>
        </div>
      </form>
    </Form>
  );
}