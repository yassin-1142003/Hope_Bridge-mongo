import { drizzlePgdb, type DrizzleTransaction } from "@/backend/database";

export async function withTransaction<T>(
  fn: (tx: DrizzleTransaction) => Promise<T>,
): Promise<T> {
  return drizzlePgdb.transaction(fn);
}
