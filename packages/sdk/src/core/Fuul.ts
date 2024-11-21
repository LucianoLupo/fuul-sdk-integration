import { fetchMockedData } from "../api/client";
import type { FuulConfig, ProjectInfo } from "../types";

export class Fuul {
  private projectInfo: ProjectInfo | null = null;
  private config: FuulConfig | null = null;

  constructor(config?: FuulConfig) {
    if (config) {
      void this.init(config);
    }
  }

  async init(config: FuulConfig): Promise<ProjectInfo> {
    if (!config?.apiKey) throw new Error(`ApiKey needed to initialize`);
    this.config = config;

    try {
      this.projectInfo = await fetchMockedData(config.apiKey);
      return this.projectInfo;
    } catch (error) {
      throw new Error(`Failed to initialize`);
    }
  }

  //lupo0x comment: this functions are not needed according to test specs... but think will be good to have a way to retrieve the data
  getProjectInfo(): ProjectInfo | null {
    return this.projectInfo;
  }

  getConfig(): FuulConfig | null {
    return this.config;
  }
}
