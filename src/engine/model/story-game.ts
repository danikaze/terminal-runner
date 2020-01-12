import { Game } from 'engine/game';

export type StoryGame = Pick<Game, 'setNextStory' | 'queueNextStory'>;
