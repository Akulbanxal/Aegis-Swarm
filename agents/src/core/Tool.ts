export interface ToolContext {
  incidentId: string;
  [key: string]: any;
}

export abstract class Tool {
  abstract name: string;
  abstract description: string;

  /**
   * Execute the tool's action.
   * @param context Contextual data for the tool.
   * @returns A promise resolving to the tool's output.
   */
  abstract execute(context: ToolContext): Promise<any>;
}
