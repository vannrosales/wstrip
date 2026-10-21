export type TemplateSlot = {
  x: number;
  y: number;
  w: number;
  h: number;
  borderRadius?: number;
};

export type StripTemplate = {
  id: string;
  name: string;
  category: 'classic' | 'vintage' | 'playful' | 'minimal';
  /** Typeface family used for header, caption and footer text on the strip. */
  typeface?: 'serif' | 'mono' | 'sans' | 'script';
  shots: 2 | 3 | 4;
  size: {
    width: number;
    height: number;
  };
  slots: TemplateSlot[];
  background: {
    type: 'color' | 'gradient';
    value: string; // hex color
    secondary?: string;
  };
  borderWidth?: number;
  borderColor?: string;
  filter?: string; // default CSS filter if any
  header?: {
    text: string;
    fontFamily?: string;
    fontSize?: number;
    color?: string;
  };
  footer?: {
    text: string;
    subtext?: string;
    showDate?: boolean;
    fontFamily?: string;
    fontSize?: number;
    color?: string;
  };
  frameOverlay?: string;
  accentColor?: string;
};

export type FilterOption = {
  id: string;
  name: string;
  cssFilter: string;
  previewClass?: string;
};

/** Vector sticker drawn from SVG path data on a 24x24 grid (no emoji). */
export type StickerOption = {
  id: string;
  label: string;
  path: string;
  color: string;
  evenodd?: boolean;
};

export type PlacedSticker = {
  id: string;
  stickerId: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  size: number; // size in px on the unscaled template canvas
};

export type StripCompositionOptions = {
  filterId?: string;
  customCaption?: string;
  showDate?: boolean;
  stickers?: PlacedSticker[];
  mirrored?: boolean;
};

export type CameraFacingMode = 'user' | 'environment';
