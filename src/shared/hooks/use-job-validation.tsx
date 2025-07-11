import { useState } from 'react';
import { jobSchema, draftJobSchema, } from '@/application/schemas/job.schema';
import z from 'zod';
import { IJob } from '@/domain/models/Job';
import { ValidationErrors } from '../types/types/validation-interface';


export function useJobValidation() {
  const [errors, setErrors] = useState<ValidationErrors>();

  const validateJob = (job: Partial<IJob>, isDraft = false): boolean => {
    try {
      const dataToValidate = {
        title: job.title || '',
        description: job.description || '',
        department: job.department || '',
        location: job.location || '',
        salaryRange: job.salaryRange,
        employmentType: job.employmentType,
        experienceLevel: job.experienceLevel,
        tags: job.tags,
        closingDate: job.closingDate,
        competencies: job.competencies || [],
        questions: job.questions || [],
      };

      if (isDraft) {
        draftJobSchema.parse(dataToValidate);
      } else {
        jobSchema.parse(dataToValidate);
      }

      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: ValidationErrors = {};
        error.errors.forEach((err) => {
          const field = err.path[0] as keyof ValidationErrors;
          if (field) {
            newErrors[field] = err.message;
          }
        });
        setErrors(newErrors);
        return false;
      }
      return false;
    }
  };

  const validateField = (field: keyof ValidationErrors, value: unknown): boolean => {
    try {
      switch (field) {
        case 'title':
          jobSchema.shape.title.parse(value);
          break;
        case 'description':
          jobSchema.shape.description.parse(value);
          break;
        case 'department':
          jobSchema.shape.department.parse(value);
          break;
        case 'location':
          jobSchema.shape.location.parse(value);
          break;
        case 'salaryRange':
          jobSchema.shape.salaryRange.parse(value);
          break;
        case 'competencies':
          jobSchema.shape.competencies.parse(value);
          break;
        case 'questions':
          jobSchema.shape.questions.parse(value);
          break;
      }
      setErrors(prev => ({
        ...prev,
        [field]: undefined,
      }));
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors(prev => ({
          ...prev,
          [field]: error.errors[0].message,
        }));
        return false;
      }
      return false;
    }
  };

  const getFieldError = (field: keyof ValidationErrors): string | undefined => {
    return errors?.[field];
  };

  const hasFieldError = (field: keyof ValidationErrors): boolean => {
    return !!errors?.[field];
  };

  const clearFieldError = (field: keyof ValidationErrors): void => {
    setErrors(prev => ({
      ...prev,
      [field]: undefined,
    }));
  };

  const clearAllErrors = (): void => {
    setErrors({});
  };

  return {
    errors,
    validateJob,
    validateField,
    getFieldError,
    hasFieldError,
    clearFieldError,
    clearAllErrors,
  };
}