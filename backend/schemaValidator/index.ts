import { ZodType, ZodError } from "zod";

interface ValidationResult<T> {
  value: T | null;
  error: ZodError | null;
}

interface ISchemaValidator {
  validate<T>(schema: ZodType<T>, data: unknown): ValidationResult<T>;
}

class ZodSchemaValidator implements ISchemaValidator {
  validate<T>(schema: ZodType<T>, data: unknown): ValidationResult<T> {
    const res = schema.safeParse(data);
    if (res.success) {
      return { value: res.data, error: null };
    }
    return { value: null, error: res.error };
  }
}

export class SchemaValidatorFactory {
  createValidator(type: "zod" = "zod"): ISchemaValidator {
    switch (type) {
      case "zod":
      default:
        return new ZodSchemaValidator();
    }
  }
}
