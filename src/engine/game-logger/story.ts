import { default as logSystem, NsLogger } from 'util/logger';
import { Story } from 'engine/story';

export class StoryLogger {
  private readonly logger: NsLogger;

  constructor() {
    this.logger = logSystem.getLogger('story');
  }

  public loaded(story: Story): void {
    this.logger.info(`Story loaded: ${story.id}`);
  }

  public errorLoading(errors: string): void {
    this.logger.warn(errors);
  }

  public running(story: Story): void {
    this.logger.info(`Running story: ${story.id}`);
  }
}
