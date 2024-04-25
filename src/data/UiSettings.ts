export interface UiSettings {
    baseColourTheme: string
    colourTheme: string
    sidebarPosition: SidebarPosition
    flyerFormSection: FlyerFormSection
    currentSection: PlayViewSection
    pinnedSection: PlayViewSection | null
    debug: boolean,
}

export enum SidebarPosition {
    Right,
    Left,
}

export enum FlyerFormSection {
    Players,
    Duration,
    Settings,
    Tables,
    Prizes,
}

// HIGH: add a value here for "bracket"
export enum PlayViewSection {
    Fixtures,
    Standings,
    Tables,
    Info,
    EventLog,
}
