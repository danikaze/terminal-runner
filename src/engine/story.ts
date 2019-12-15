export interface StoryData {
  name: string;
}

export class Story {
  public name: string;
  public source: string | undefined;

  constructor(data: StoryData, source?: string) {
    const errors = Story.validateStory(data);
    if (errors) {
      throw new Error(errors.join('\n'));
    }

    this.source = source;
    this.name = data.name;
  }

  public static validateStory(data: StoryData): string[] | null {
    const errors: string[] = [];

    if (!data.name) {
      errors.push('Name not provided');
    }

    return errors.length === 0 ? null : errors;
  }
}
