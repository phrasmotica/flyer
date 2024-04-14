export enum FixtureStatus {
    Unknown,
    WaitingForRoundGeneration,
    WaitingForPreviousResult,
    WaitingForPlayers,
    WaitingForRound,
    WaitingForTable,
    WaitingForAssignment,
    WaitingForBreaker,
    ReadyToStart,
    InProgress,
    Finished,
}
