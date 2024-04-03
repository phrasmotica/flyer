export interface PhaseEvent {
    level: PhaseEventLevel
    message: string
    timestamp: number
}

export enum PhaseEventLevel {
    Default = 0,
    Internal = 100,
}
