export interface CodeLine {
  fileLineNumber: number;
  blockNumber: number | undefined;
  sourceText: string;
  gCodes: number[] ;
  mCodes: number[] ;
  x: number | undefined;
  z: number | undefined;
  rpm: number | undefined;
  feed: number | undefined;
}



