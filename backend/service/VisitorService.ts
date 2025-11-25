import { MongooseUOW } from "@/backend/database/mongoose/MongooseUOW";
import type { Visit } from "@/backend/database/mongoose/models";
import type { DailyCount } from "@/backend/database/mongoose/repos/VisitRepo";
import { AppError } from "@/backend/errorHandler";

type TrackVisitInput = {
  path: string;
  locale?: string | null;
  projectId?: string | null;
  referrer?: string | null;
  userAgent?: string | null;
  ipHash?: string | null;
  country?: string | null;
};

class VisitorService {
  private uow: MongooseUOW;

  constructor(uow: MongooseUOW) {
    this.uow = uow;
  }

  async trackVisit(data: TrackVisitInput): Promise<Visit> {
    if (!data.path) {
      throw new AppError("ERR_MISSING_PARAMETER", "path is required to track a visit", {});
    }

    return this.uow.visitRepo.saveOne({
      path: data.path,
      locale: data.locale ?? null,
      projectId: data.projectId ?? null,
      referrer: data.referrer ?? null,
      userAgent: data.userAgent ?? null,
      ipHash: data.ipHash ?? null,
      country: data.country ?? null,
    });
  }

  async getRecent(limit = 100): Promise<Visit[]> {
    return this.uow.visitRepo.getRecent(limit);
  }

  async getDailyCounts(days = 7): Promise<DailyCount[]> {
    return this.uow.visitRepo.getDailyCounts(days);
  }

  async getSummary({
    recentLimit = 100,
    dailyWindow = 7,
  }: {
    recentLimit?: number;
    dailyWindow?: number;
  }): Promise<{
    total: number;
    recent: Visit[];
    daily: DailyCount[];
  }> {
    const [total, recent, daily] = await Promise.all([
      this.uow.visitRepo.getTotalCount(),
      this.uow.visitRepo.getRecent(recentLimit),
      this.uow.visitRepo.getDailyCounts(dailyWindow),
    ]);

    return { total, recent, daily };
  }
}

export { VisitorService };
export type { TrackVisitInput };

