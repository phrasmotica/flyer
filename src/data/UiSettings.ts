export interface UiSettings {
    flyerFormSection: FlyerFormSection
    currentSection: PlayViewSection
    pinnedSection: PlayViewSection | null
}

export enum FlyerFormSection {
    Players,
    Settings,
    Tables,
    Prizes,
}

export enum PlayViewSection {
    Fixtures,
    Standings,
    Tables,
    Info,
    EventLog,
}
