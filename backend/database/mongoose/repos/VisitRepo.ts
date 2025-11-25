import { ClientSession } from "mongoose";
import { NewVisit, Visit, VisitModel, toVisit } from "../models";

type DailyCount = {
  date: string;
  count: number;
};

class VisitRepo {
  constructor(private session: ClientSession | null = null) {}

  async saveOne(visit: NewVisit): Promise<Visit> {
    const [doc] = await VisitModel.create([visit], {
      session: this.session ?? undefined,
    });
    return toVisit(doc);
  }

  async getRecent(limit: number): Promise<Visit[]> {
    const docs = await VisitModel.find()
      .sort({ created_at: -1, _id: -1 })
      .limit(limit)
      .lean()
      .session(this.session ?? undefined);
    return docs.map((doc: any) => toVisit(doc as any));
  }

  async getTotalCount(): Promise<number> {
    return VisitModel.countDocuments()
      .session(this.session ?? undefined);
  }

  async getDailyCounts(days: number): Promise<DailyCount[]> {
    const since = new Date();
    since.setDate(since.getDate() - (days - 1));

    const pipeline = [
      {
        $match: {
          created_at: { $gte: since },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$created_at" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: -1 } },
      { $limit: days },
    ];

    const results = await VisitModel.aggregate(pipeline)
      .session(this.session ?? undefined);

    return results.map((item: { _id: string; count: number }) => ({
      date: item._id,
      count: item.count,
    }));
  }
}

export { VisitRepo };
export type { DailyCount };

