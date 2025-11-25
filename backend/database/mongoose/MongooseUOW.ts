import { ClientSession } from "mongoose";
import { UsrRepo } from "./repos/UsrRepo";
import { PostRepo } from "./repos/PostRepo";
import { ProjectRepo } from "./repos/ProjectRepo";
import { VisitRepo } from "./repos/VisitRepo";

class MongooseUOW {
  private session: ClientSession;
  private _usrRepo?: UsrRepo;
  private _postRepo?: PostRepo;
  private _projectRepo?: ProjectRepo;
  private _visitRepo?: VisitRepo;

  constructor(session: ClientSession) {
    this.session = session;
  }

  get usrRepo(): UsrRepo {
    if (!this._usrRepo) {
      this._usrRepo = new UsrRepo(this.session);
    }
    return this._usrRepo;
  }

  get postRepo(): PostRepo {
    if (!this._postRepo) {
      this._postRepo = new PostRepo(this.session);
    }
    return this._postRepo;
  }

  get projectRepo(): ProjectRepo {
    if (!this._projectRepo) {
      this._projectRepo = new ProjectRepo(this.session);
    }
    return this._projectRepo;
  }

  get visitRepo(): VisitRepo {
    if (!this._visitRepo) {
      this._visitRepo = new VisitRepo(this.session);
    }
    return this._visitRepo;
  }
}

export { MongooseUOW };
