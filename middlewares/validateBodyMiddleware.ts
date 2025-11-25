import { SchemaValidatorFactory } from "@/backend/schemaValidator";
import { NextRequest, NextResponse } from "next/server";
import { ZodType } from "zod";

export async function validateBodyMiddleware(req: NextRequest, schema: ZodType): Promise<NextResponse> {
  const body = await req.json()

  const validator = new SchemaValidatorFactory().createValidator("zod");
  const {error} = validator.validate(schema, body);

  if(error) {
    throw error
  }

  return NextResponse.next()
}

