export class AlgorithmEngine {
  private keyMappings: AlgorithmActionKeyMapping[] = [];
  private actions: AlgorithmAction[] = [];
  private actionIndex = 0;

  private _numberOfNumbers = 0;
  public get numberOfNumbers(): number {
    return this._numberOfNumbers;
  }

  private _numbersToSortBackup: number[] = [];
  private _numbersToSort: number[] = [];
  public get numbersToSort(): number[] {
    return this._numbersToSort;
  }

  private _currentHighlights: AlgorithmTraceAction[] = [];
  public get currentHighlights(): AlgorithmTraceAction[] {
    return this._currentHighlights;
  }

  public createNew = (numberOfNumbers: number) => {
    console.log("generating numbers");

    this._numbersToSort = [];
    this.keyMappings = [];
    this.actions = [];
    this.actionIndex = 0;
    this._currentHighlights = [];

    this._numberOfNumbers = numberOfNumbers;

    const allNumbers: number[] = [];
    for (let i = 1; i <= numberOfNumbers; i++) {
      allNumbers.push(i);
    }

    while (allNumbers.length > 0) {
      const index = Math.floor(Math.random() * allNumbers.length);
      this._numbersToSort.push(allNumbers.splice(index, 1)[0]);
    }
    this._numbersToSortBackup = [...this._numbersToSort];

    console.log("generated", numberOfNumbers, "numbers");
  };

  public runAlgorithm = (code: string) => {
    console.log("run algorithm");
    const executionContext = new AlgorithmExecutionContext(this);
    code = "var soralvi = this\n" + code;
    code += "\nsort(this.algorithmEngine.numbersToSort)";
    // eslint-disable-next-line @typescript-eslint/no-implied-eval
    new Function(code).apply(executionContext);
    console.log("algorithm finished");
    this._numbersToSort = this._numbersToSortBackup;
  };

  public getKeyMapping = (key: string): number => {
    let mapping = this.keyMappings.find((x) => x.key === key);
    if (!mapping) {
      mapping = {
        k: this.keyMappings.length,
        key: key,
      };
      this.keyMappings.push(mapping);
    }
    return mapping.k;
  };

  public addAndExecuteAction = (action: AlgorithmAction) => {
    this.actions.push(action);
    switch (action.t) {
      case AlgorithmActionType.trace:
        break;
      case AlgorithmActionType.swap:
        // eslint-disable-next-line no-case-declarations
        const index1 = (action as AlgorithmSwapAction).i;
        // eslint-disable-next-line no-case-declarations
        const index2 = (action as AlgorithmSwapAction).j;
        // eslint-disable-next-line no-case-declarations
        const a = this._numbersToSort[index1];
        this._numbersToSort[index1] = this._numbersToSort[index2];
        this._numbersToSort[index2] = a;
        break;
    }
  };

  public executeAction = (action: AlgorithmAction) => {
    switch (action.t) {
      case AlgorithmActionType.trace:
        // eslint-disable-next-line no-case-declarations
        const k = (action as AlgorithmTraceAction).k;
        // eslint-disable-next-line no-case-declarations
        const existingHighlight = this._currentHighlights.find(
          (x) => x.k === k
        );
        if (existingHighlight) {
          this._currentHighlights[
            this._currentHighlights.indexOf(existingHighlight)
          ] = action as AlgorithmTraceAction;
        } else {
          this._currentHighlights.push(action as AlgorithmTraceAction);
        }
        break;
      case AlgorithmActionType.swap:
        console.log("swap");

        // eslint-disable-next-line no-case-declarations
        const index1 = (action as AlgorithmSwapAction).i;
        // eslint-disable-next-line no-case-declarations
        const index2 = (action as AlgorithmSwapAction).j;
        // eslint-disable-next-line no-case-declarations
        const a = this._numbersToSort[index1];
        this._numbersToSort[index1] = this._numbersToSort[index2];
        this._numbersToSort[index2] = a;
        break;
    }
  };

  public step = (): boolean => {
    if (this.actionIndex <= this.actions.length - 1) {
      this.executeAction(this.actions[this.actionIndex]);
      this.actionIndex++;
      return true;
    } else {
      return false;
    }
  };
}

enum AlgorithmActionType {
  trace,
  swap,
}

interface AlgorithmActionKeyMapping {
  key: string;
  k: number;
}

interface AlgorithmTraceAction {
  t: AlgorithmActionType; // type
  k: number; // key index
  i: number; // index
}

interface AlgorithmSwapAction {
  t: AlgorithmActionType;
  i: number; // index1
  j: number; // index2
}

type AlgorithmAction = AlgorithmTraceAction | AlgorithmSwapAction;

class AlgorithmExecutionContext {
  constructor(private algorithmEngine: AlgorithmEngine) {}

  traceIndex = (key: string, index: number) => {
    this.algorithmEngine.addAndExecuteAction({
      i: index,
      k: this.algorithmEngine.getKeyMapping(key),
      t: AlgorithmActionType.trace,
    });
  };

  swapValues = (index1: number, index2: number) => {
    this.algorithmEngine.addAndExecuteAction({
      i: index1,
      j: index2,
      t: AlgorithmActionType.swap,
    });
  };
}

export const algen = new AlgorithmEngine();

// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
(window as any)["ae"] = algen;
