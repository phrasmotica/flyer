export interface UiSettings {
    currentSection: PlayViewSection
    pinnedSection: PlayViewSection | null
}

export enum PlayViewSection {
    Fixtures,
    Standings,
    Tables,
    Info,
    EventLog,
}
